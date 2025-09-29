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

    // Mock suppliers data
    const mockSuppliers = [
      {
        id: '1',
        name: 'Rajesh Kumar',
        company: 'Tech Solutions India',
        email: 'rajesh@techsolutions.com',
        phone: '+91-9876543210',
        location: 'Mumbai, Maharashtra',
        verified: true,
        rating: 4.5,
        products: ['LED Bulbs', 'Electrical Components', 'Power Supplies'],
        category: 'electronics',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Priya Sharma',
        company: 'Steel Works Ltd',
        email: 'priya@steelworks.com',
        phone: '+91-9876543211',
        location: 'Delhi, NCR',
        verified: true,
        rating: 4.2,
        products: ['Steel Pipes', 'Metal Sheets', 'Construction Materials'],
        category: 'steel',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Amit Patel',
        company: 'Textile Mills',
        email: 'amit@textilemills.com',
        phone: '+91-9876543212',
        location: 'Ahmedabad, Gujarat',
        verified: false,
        rating: 3.8,
        products: ['Cotton Fabric', 'Silk Materials', 'Wool Products'],
        category: 'textiles',
        createdAt: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Sunita Singh',
        company: 'Machinery Hub',
        email: 'sunita@machineryhub.com',
        phone: '+91-9876543213',
        location: 'Pune, Maharashtra',
        verified: true,
        rating: 4.7,
        products: ['Industrial Machines', 'Tools & Equipment', 'Spare Parts'],
        category: 'machinery',
        createdAt: new Date().toISOString()
      },
      {
        id: '5',
        name: 'Vikram Reddy',
        company: 'Chemical Industries',
        email: 'vikram@chemicalind.com',
        phone: '+91-9876543214',
        location: 'Chennai, Tamil Nadu',
        verified: true,
        rating: 4.3,
        products: ['Industrial Chemicals', 'Solvents', 'Raw Materials'],
        category: 'chemicals',
        createdAt: new Date().toISOString()
      }
    ];

    // Filter suppliers based on search criteria
    let filteredSuppliers = mockSuppliers;

    if (category && category !== 'all') {
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
      error: 'Failed to fetch suppliers' 
    }, { status: 500 });
  }
}
