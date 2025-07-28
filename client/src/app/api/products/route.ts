import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - List products
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const supplierId = searchParams.get('supplierId');

    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (supplierId) {
      where.supplierId = supplierId;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        supplier: {
          select: {
            name: true,
            companyname: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch products',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// POST - Create new product
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const price = parseFloat(formData.get('price') as string);
    const minOrderQuantity = parseInt(formData.get('minOrderQuantity') as string);
    const unit = formData.get('unit') as string;
    const specifications = formData.get('specifications') as string;

    if (!name || !description || !category || !price || !minOrderQuantity || !unit) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // For now, we'll simulate image upload
    // In production, you'd upload to Cloudinary, AWS S3, etc.
    const images: string[] = [];
    for (let i = 0; i < 5; i++) {
      const image = formData.get(`image${i}`) as File;
      if (image) {
        const fileName = `${Date.now()}-${image.name}`;
        images.push(`https://example.com/uploads/${fileName}`);
      }
    }

    // Create product in database
    const product = await prisma.product.create({
      data: {
        name,
        description,
        category,
        price,
        minOrderQuantity,
        unit,
        specifications,
        images: JSON.stringify(images),
        supplierId: 'temp-supplier-id', // You'd get this from session
        status: 'ACTIVE'
      }
    });

    return NextResponse.json({ 
      success: true, 
      product,
      message: 'Product created successfully' 
    });

  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create product',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
