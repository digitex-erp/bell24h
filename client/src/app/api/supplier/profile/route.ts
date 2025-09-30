import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch supplier profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('id');
    const slug = searchParams.get('slug');

    if (!supplierId && !slug) {
      return NextResponse.json(
        { success: false, error: 'Supplier ID or slug required' },
        { status: 400 }
      );
    }

    // Fetch supplier profile
    const supplier = await prisma.company.findFirst({
      where: {
        id: supplierId || undefined
      },
      include: {
        products: true,
        users: true,
        rfqs: true
      }
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        supplier: {
          id: supplier.id,
          name: supplier.name,
          description: supplier.description,
          logo: supplier.logo,
          website: supplier.website,
          phone: supplier.phone,
          email: supplier.email,
          address: supplier.address,
          city: supplier.city,
          state: supplier.state,
          pincode: supplier.pincode,
          category: supplier.category,
          subcategory: supplier.subcategory,
          annualTurnover: supplier.annualTurnover,
          employeeCount: supplier.employeeCount,
          size: supplier.size,
          type: supplier.type,
          establishedYear: supplier.establishedYear,
          gstNumber: supplier.gstNumber,
          panNumber: supplier.panNumber,
          isVerified: supplier.isVerified,
          isActive: supplier.isActive,
          products: supplier.products,
          users: supplier.users,
          rfqs: supplier.rfqs,
          createdAt: supplier.createdAt,
          updatedAt: supplier.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('❌ Fetch supplier profile error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch supplier profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update supplier profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { supplierId, updates } = body;

    if (!supplierId) {
      return NextResponse.json(
        { success: false, error: 'Supplier ID required' },
        { status: 400 }
      );
    }

    // Validate required fields
    const allowedFields = [
      'name', 'description', 'logo', 'website', 'phone', 'email',
      'address', 'city', 'state', 'pincode', 'category', 'subcategory',
      'turnover', 'employees', 'establishedYear', 'gstNumber', 'panNumber',
      'msmeNumber', 'services', 'capabilities', 'gallery'
    ];

    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as any);

    // Update supplier profile
    const updatedSupplier = await prisma.company.update({
      where: { id: supplierId },
      data: {
        ...filteredUpdates,
        updatedAt: new Date()
      }
    });

    console.log(`✅ Supplier profile updated: ${updatedSupplier.name}`);

    return NextResponse.json({
      success: true,
      message: 'Supplier profile updated successfully',
      data: {
        supplier: updatedSupplier
      }
    });

  } catch (error) {
    console.error('❌ Update supplier profile error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update supplier profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Create new supplier profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      category, 
      subcategory, 
      phone, 
      email, 
      address, 
      city, 
      state, 
      pincode,
      gstNumber,
      panNumber,
      userId 
    } = body;

    // Validate required fields
    if (!name || !category || !phone || !email || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Create supplier profile
    const newSupplier = await prisma.company.create({
      data: {
        name,
        slug,
        description: description || '',
        category,
        subcategory: subcategory || '',
        phone,
        email,
        address: address || '',
        city: city || '',
        state: state || '',
        pincode: pincode || '',
        gstNumber: gstNumber || '',
        panNumber: panNumber || '',
        userId,
        rating: 0,
        reviewCount: 0,
        isVerified: false,
        isPremium: false,
        services: [],
        capabilities: [],
        gallery: []
      }
    });

    console.log(`✅ New supplier profile created: ${newSupplier.name}`);

    return NextResponse.json({
      success: true,
      message: 'Supplier profile created successfully',
      data: {
        supplier: newSupplier
      }
    });

  } catch (error) {
    console.error('❌ Create supplier profile error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create supplier profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
