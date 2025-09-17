import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { title, description, category, quantity, budget, deadline, specifications } = await request.json()

    // Validate required fields
    if (!title || !description || !category) {
      return NextResponse.json(
        { message: 'Title, description, and category are required' },
        { status: 400 }
      )
    }

    // Create RFQ object
    const rfq = {
      id: Date.now().toString(),
      title,
      description,
      category,
      quantity: quantity || 1,
      budget: budget || null,
      deadline: deadline || null,
      specifications: specifications || [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // In production, save to database
    // For now, just return the created RFQ

    return NextResponse.json(
      { 
        message: 'RFQ created successfully',
        rfq
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('RFQ creation error:', error)
    return NextResponse.json(
      { message: 'Failed to create RFQ' },
      { status: 500 }
    )
  }
}
