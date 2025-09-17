import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock RFQ data for now
    const mockRfqs = [
      {
        id: '1',
        title: 'Steel Pipes for Construction',
        description: 'Looking for high-quality steel pipes for construction project',
        category: 'Steel & Metals',
        quantity: 100,
        budget: 50000,
        status: 'active',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        quotes: 3
      },
      {
        id: '2',
        title: 'Cotton Textiles',
        description: 'Need premium cotton fabrics for garment manufacturing',
        category: 'Textiles & Apparel',
        quantity: 500,
        budget: 25000,
        status: 'completed',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        quotes: 5
      },
      {
        id: '3',
        title: 'Electronic Components',
        description: 'Sourcing electronic components for IoT devices',
        category: 'Electronics & Components',
        quantity: 1000,
        budget: 75000,
        status: 'active',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        quotes: 2
      }
    ]

    return NextResponse.json(
      { 
        rfqs: mockRfqs,
        total: mockRfqs.length
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('RFQ list error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch RFQs' },
      { status: 500 }
    )
  }
}
