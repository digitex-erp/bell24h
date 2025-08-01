import { NextRequest, NextResponse } from 'next/server';
import { validateGSTNumber, getGSTStateInfo, getEntityTypeInfo } from '@/utils/gst-validator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gstNumber } = body;

    if (!gstNumber) {
      return NextResponse.json(
        { success: false, message: 'GST number is required' },
        { status: 400 }
      );
    }

    // Validate GST number format
    const validationResult = validateGSTNumber(gstNumber);

    if (!validationResult.isValid) {
      return NextResponse.json({
        success: false,
        message: validationResult.message,
        isValid: false
      });
    }

    // In a real implementation, you would also:
    // 1. Check against government GST database
    // 2. Verify business details
    // 3. Check if GST is active/suspended
    // 4. Validate business address

    // For demo purposes, we'll simulate additional verification
    const additionalVerification = await simulateGSTVerification(gstNumber);

    return NextResponse.json({
      success: true,
      message: 'GST number verified successfully',
      isValid: true,
      data: {
        gstNumber: validationResult.gstNumber,
        stateCode: validationResult.stateCode,
        stateName: validationResult.stateName,
        panNumber: validationResult.panNumber,
        entityCode: validationResult.entityCode,
        entityType: validationResult.entityType,
        businessName: additionalVerification.businessName,
        businessAddress: additionalVerification.businessAddress,
        registrationDate: additionalVerification.registrationDate,
        status: additionalVerification.status,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('GST verification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'GST verification failed' 
      },
      { status: 500 }
    );
  }
}

// Simulate additional GST verification
async function simulateGSTVerification(gstNumber: string) {
  // This would be replaced with actual government API calls
  // For demo purposes, we'll return mock data
  
  const mockBusinesses: { [key: string]: any } = {
    '27ABCDE1234F1Z5': {
      businessName: 'Mumbai Textiles Pvt Ltd',
      businessAddress: '123 Textile Street, Andheri East, Mumbai - 400069, Maharashtra',
      registrationDate: '2020-03-15',
      status: 'Active'
    },
    '07FGHIJ5678K1L9': {
      businessName: 'Delhi Manufacturing Co',
      businessAddress: '456 Industrial Area, Okhla Phase 1, New Delhi - 110020, Delhi',
      registrationDate: '2019-08-22',
      status: 'Active'
    },
    '24NOPQR5678S1T9': {
      businessName: 'Ahmedabad Pharma Solutions',
      businessAddress: '789 Pharma Park, Vatva, Ahmedabad - 382445, Gujarat',
      registrationDate: '2021-01-10',
      status: 'Active'
    },
    '33UVWXY5678Z1A9': {
      businessName: 'Chennai IT Services',
      businessAddress: '321 Tech Hub, Tidel Park, Chennai - 600113, Tamil Nadu',
      registrationDate: '2018-11-05',
      status: 'Active'
    }
  };

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return mockBusinesses[gstNumber] || {
    businessName: 'Business Name Not Available',
    businessAddress: 'Address verification pending',
    registrationDate: 'Registration date not available',
    status: 'Verification Pending'
  };
}

// GET endpoint for basic validation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gstNumber = searchParams.get('gst');

    if (!gstNumber) {
      return NextResponse.json(
        { success: false, message: 'GST number parameter is required' },
        { status: 400 }
      );
    }

    const validationResult = validateGSTNumber(gstNumber);

    return NextResponse.json({
      success: true,
      isValid: validationResult.isValid,
      message: validationResult.message,
      data: validationResult.isValid ? {
        stateCode: validationResult.stateCode,
        stateName: validationResult.stateName,
        panNumber: validationResult.panNumber,
        entityType: validationResult.entityType
      } : null
    });

  } catch (error: any) {
    console.error('GST validation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'GST validation failed' 
      },
      { status: 500 }
    );
  }
} 