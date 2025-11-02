import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for creating RFQs - matches Prisma schema
const CreateRFQSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unit: z.string().optional(),
  budget: z.number().optional(), // Decimal in schema, but Zod accepts number
  currency: z.string().default('INR'),
  deadline: z.string().datetime().optional().or(z.date()),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  specifications: z.record(z.any()).optional(), // JSON field
  companyId: z.string().optional(),
  // Voice/Video RFQ fields
  audioFile: z.string().url().optional(),
  videoFile: z.string().url().optional(),
  transcript: z.string().optional(),
})

/**
 * GET /api/rfqs - Get all RFQs with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''
    const createdBy = searchParams.get('createdBy') || searchParams.get('buyerId') || '' // Schema uses createdBy

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (category) {
      where.category = category
    }
    
    if (status) {
      where.status = status
    }

    if (buyerId) {
      where.buyerId = buyerId // Schema uses buyerId
    }

    // Get RFQs with pagination
    const [rfqs, total] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          quotes: {
            take: 5,
            include: {
              supplier: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              quotes: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.rFQ.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: rfqs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })

  } catch (error) {
    console.error('Error fetching RFQs:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/rfqs - Create new RFQ
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // For now, we'll use a mock user ID
    // TODO: Get from authentication token
    const mockUserId = 'user_1'
    
    const validatedData = CreateRFQSchema.parse(body)

    // Prepare data matching prisma/schema.prisma structure
    const rfqData: any = {
      title: validatedData.title,
      description: validatedData.description || null,
      category: validatedData.category,
      quantity: String(validatedData.quantity), // Schema expects String
      unit: validatedData.unit || 'pieces',
      urgency: validatedData.urgency || 'NORMAL',
      status: 'ACTIVE', // Schema uses ACTIVE
      createdBy: mockUserId, // Schema uses createdBy
      requirements: validatedData.specifications ? JSON.stringify(validatedData.specifications) : null,
      location: null,
      tags: validatedData.category ? [validatedData.category] : [],
      isPublic: true,
      priority: validatedData.urgency === 'URGENT' ? 1 : validatedData.urgency === 'HIGH' ? 2 : 3,
    }

    // Add optional fields if provided
    if (validatedData.budget !== undefined) {
      rfqData.minBudget = validatedData.budget * 0.9
      rfqData.maxBudget = validatedData.budget * 1.1
    }
    if (validatedData.deadline) {
      const deadline = typeof validatedData.deadline === 'string' 
        ? new Date(validatedData.deadline) 
        : validatedData.deadline
      rfqData.expiresAt = deadline
      rfqData.timeline = `Deadline: ${deadline.toLocaleDateString()}`
    } else {
      rfqData.timeline = 'Not specified'
    }

    // Create RFQ
    const rfq = await prisma.rFQ.create({
      data: rfqData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            quotes: true,
          },
        },
      },
    })

    return NextResponse.json(
      { success: true, data: rfq, message: 'RFQ created successfully' },
      { status: 201 }
    )

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating RFQ:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

