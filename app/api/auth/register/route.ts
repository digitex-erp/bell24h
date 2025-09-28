import { NextRequest, NextResponse } from 'next/server';

// Mock user database (in production, use real database)
const users = new Map<string, any>([
  ['9876543210', {
    id: '1',
    mobile: '9876543210',
    name: 'Test User',
    companyName: 'Test Company',
    businessType: 'manufacturer',
    verified: true
  }]
]);

export async function POST(request: NextRequest) {
  try {
    const { mobile, name, companyName, businessType } = await request.json();

    // Validate required fields
    if (!mobile || !name || !companyName) {
      return NextResponse.json(
        { success: false, error: 'Mobile number, name, and company name are required' },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        { success: false, error: 'Invalid mobile number format' },
        { status: 400 }
      );
    }

    // Check if user already exists
    if (users.has(mobile)) {
      return NextResponse.json(
        { success: false, error: 'User with this mobile number already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(), // Simple ID generation
      mobile,
      name: name.trim(),
      companyName: companyName.trim(),
      businessType: businessType || 'manufacturer',
      verified: true,
      createdAt: new Date().toISOString(),
      profile: {
        avatar: null,
        description: '',
        location: '',
        website: '',
        gstNumber: '',
        panNumber: ''
      },
      preferences: {
        notifications: true,
        emailUpdates: false,
        smsUpdates: true
      },
      subscription: {
        plan: 'free',
        features: ['basic_rfq', 'supplier_search', 'messaging']
      }
    };

    // Save user (in production, save to database)
    users.set(mobile, newUser);

    console.log(`✅ New user registered: ${name} (${mobile})`);

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: newUser,
      redirectUrl: '/dashboard'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}

// Get user by mobile number
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mobile = searchParams.get('mobile');

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        { success: false, error: 'Valid mobile number required' },
        { status: 400 }
      );
    }

    const user = users.get(mobile);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        mobile: user.mobile,
        name: user.name,
        companyName: user.companyName,
        businessType: user.businessType,
        verified: user.verified
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get user' },
      { status: 500 }
    );
  }
}