import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const verified = searchParams.get('verified');

    // Mock suppliers data for demonstration
    const mockSuppliers = [
      {
        id: '1',
        name: 'Rajesh Kumar',
        company: 'SteelCo India',
        email: 'rajesh@steelco.com',
        phone: '+91-9876543210',
        location: 'Mumbai, Maharashtra',
        verified: true,
        createdAt: '2024-01-15T10:30:00Z',
        rating: 4.8,
        products: ['Steel Pipes', 'Steel Sheets', 'Steel Rods', 'Steel Plates'],
        category: 'steel',
        rfqCount: 45,
        leadCount: 23
      },
      {
        id: '2',
        name: 'Priya Sharma',
        company: 'Textile Innovations',
        email: 'priya@textileinnovations.com',
        phone: '+91-9876543211',
        location: 'Surat, Gujarat',
        verified: true,
        createdAt: '2024-02-20T14:15:00Z',
        rating: 4.6,
        products: ['Cotton Fabric', 'Silk Fabric', 'Polyester Fabric', 'Blended Fabric'],
        category: 'textiles',
        rfqCount: 32,
        leadCount: 18
      },
      {
        id: '3',
        name: 'Amit Patel',
        company: 'ElectroTech Solutions',
        email: 'amit@electrotech.com',
        phone: '+91-9876543212',
        location: 'Bangalore, Karnataka',
        verified: true,
        createdAt: '2024-03-10T09:45:00Z',
        rating: 4.9,
        products: ['LED Bulbs', 'Electrical Components', 'Power Supplies', 'Cables & Wires'],
        category: 'electronics',
        rfqCount: 67,
        leadCount: 34
      },
      {
        id: '4',
        name: 'Suresh Reddy',
        company: 'ChemPro Industries',
        email: 'suresh@chempro.com',
        phone: '+91-9876543213',
        location: 'Hyderabad, Telangana',
        verified: false,
        createdAt: '2024-04-05T16:20:00Z',
        rating: 4.2,
        products: ['Chemical Raw Materials', 'Industrial Chemicals', 'Laboratory Chemicals'],
        category: 'chemicals',
        rfqCount: 28,
        leadCount: 12
      },
      {
        id: '5',
        name: 'Deepak Singh',
        company: 'Machinery Works',
        email: 'deepak@machineryworks.com',
        phone: '+91-9876543214',
        location: 'Pune, Maharashtra',
        verified: true,
        createdAt: '2024-05-12T11:30:00Z',
        rating: 4.7,
        products: ['Industrial Machinery', 'Machine Parts', 'Tools & Equipment'],
        category: 'machinery',
        rfqCount: 41,
        leadCount: 25
      }
    ];

    // Filter suppliers based on search parameters
    let filteredSuppliers = mockSuppliers;

    if (category) {
      filteredSuppliers = filteredSuppliers.filter(s => s.category === category);
    }

    if (verified === 'true') {
      filteredSuppliers = filteredSuppliers.filter(s => s.verified === true);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredSuppliers = filteredSuppliers.filter(s => 
        s.name.toLowerCase().includes(searchLower) ||
        s.company.toLowerCase().includes(searchLower) ||
        s.location.toLowerCase().includes(searchLower) ||
        s.products.some(p => p.toLowerCase().includes(searchLower))
      );
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedSuppliers = filteredSuppliers.slice(skip, skip + limit);

    const response = {
      suppliers: paginatedSuppliers,
      pagination: {
        page,
        limit,
        total: filteredSuppliers.length,
        pages: Math.ceil(filteredSuppliers.length / limit)
      }
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch suppliers',
      message: 'Please try again later'
    }, { status: 500 });
  }
}
