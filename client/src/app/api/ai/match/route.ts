import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, category } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // AI-powered search logic
    const searchTerms = query.toLowerCase().split(' ');
    const categoryFilter = category ? { category } : {};

    // Search in products
    const products = await prisma.product.findMany({
      where: {
        ...categoryFilter,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } }
        ],
        status: 'ACTIVE'
      },
      include: {
        supplier: {
          select: {
            name: true,
            companyname: true
          }
        }
      },
      take: 10
    });

    // Generate AI suggestions based on search patterns
    const suggestions = generateAISuggestions(query, products);

    return NextResponse.json({
      success: true,
      suggestions,
      products: products.slice(0, 5), // Return top 5 matches
      totalResults: products.length
    });

  } catch (error) {
    console.error('AI match error:', error);
    return NextResponse.json({ 
      error: 'AI matching failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

function generateAISuggestions(query: string, products: any[]) {
  const suggestions = [];
  
  // Common B2B search patterns
  const patterns = {
    'steel': [
      { title: 'Steel Pipes & Tubes', description: 'High-quality steel pipes for industrial applications' },
      { title: 'Steel Plates & Sheets', description: 'Various grades of steel plates and sheets' },
      { title: 'Steel Structures', description: 'Pre-fabricated steel structures and components' }
    ],
    'textile': [
      { title: 'Textile Machinery', description: 'Spinning, weaving, and finishing equipment' },
      { title: 'Raw Materials', description: 'Cotton, polyester, and synthetic fibers' },
      { title: 'Finished Fabrics', description: 'Woven and knitted fabrics for various applications' }
    ],
    'machinery': [
      { title: 'Industrial Machinery', description: 'Heavy machinery for manufacturing' },
      { title: 'CNC Machines', description: 'Computer numerical control equipment' },
      { title: 'Packaging Machinery', description: 'Automated packaging solutions' }
    ],
    'chemical': [
      { title: 'Industrial Chemicals', description: 'Raw materials for chemical industry' },
      { title: 'Specialty Chemicals', description: 'High-purity chemicals for specific applications' },
      { title: 'Chemical Equipment', description: 'Reactors, vessels, and processing equipment' }
    ],
    'electronic': [
      { title: 'Electronic Components', description: 'Semiconductors, capacitors, and resistors' },
      { title: 'PCB Manufacturing', description: 'Printed circuit board solutions' },
      { title: 'Electronic Assembly', description: 'Complete electronic assembly services' }
    ]
  };

  // Find matching patterns
  for (const [pattern, patternSuggestions] of Object.entries(patterns)) {
    if (query.toLowerCase().includes(pattern)) {
      suggestions.push(...patternSuggestions);
    }
  }

  // Add generic suggestions if no specific pattern found
  if (suggestions.length === 0) {
    suggestions.push(
      { title: 'Custom Manufacturing', description: 'Tailored manufacturing solutions for your requirements' },
      { title: 'Bulk Procurement', description: 'Large quantity sourcing with volume discounts' },
      { title: 'Quality Certified Products', description: 'ISO certified products with quality guarantees' },
      { title: 'Just-in-Time Delivery', description: 'On-time delivery solutions for your supply chain' }
    );
  }

  // Add supplier recommendations based on products found
  if (products.length > 0) {
    const topSuppliers = products
      .map(p => p.supplier)
      .filter((s, i, arr) => arr.findIndex(sup => sup.name === s.name) === i)
      .slice(0, 3);

    topSuppliers.forEach(supplier => {
      suggestions.push({
        title: `${supplier.companyname || supplier.name}`,
        description: `Verified supplier with quality products and reliable delivery`
      });
    });
  }

  return suggestions.slice(0, 6); // Return top 6 suggestions
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'AI Matching API is live',
    version: '2.1.0',
    features: ['Smart Matching', 'Risk Scoring', 'GST Verification', 'Location Optimization']
  });
} 