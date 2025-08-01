import { NextRequest, NextResponse } from 'next/server';
import { validators, validateFormData } from '@/utils/validation';

// Handle GET requests (prevent 405 errors)
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Method not allowed',
      message: 'Please use POST method for registration',
      allowedMethods: ['POST'],
    },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using our validation utilities
    const validationResult = validateFormData(body, {
      email: validators.email,
      password: validators.password,
      companyName: validators.companyName,
      name: validators.name,
      phone: validators.phone,
      city: validators.city,
      state: validators.state,
      gstin: validators.gstin,
      pan: validators.pan
    });

    if (!validationResult.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validationResult.errors 
        },
        { status: 400 }
      );
    }

    const { 
      email, 
      password, 
      companyName, 
      businessType = 'supplier',
      name, 
      phone, 
      city,
      state,
      gstin, 
      pan 
    } = validationResult.data;

    // Create user object
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      password, // In production, this should be hashed
      companyName,
      businessType,
      name,
      phone,
      city,
      state,
      gstin,
      pan,
      createdAt: new Date().toISOString(),
      isActive: true,
      isEmailVerified: false
    };

    // In a real application, this would be stored in a database
    // For now, we'll simulate the storage
    console.log('Registration successful for:', email);

    return NextResponse.json({
      success: true,
      message: 'Registration successful! You can now login with your credentials.',
      user: {
        id: newUser.id,
        email: newUser.email,
        companyName: newUser.companyName,
        businessType: newUser.businessType,
        name: newUser.name
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
