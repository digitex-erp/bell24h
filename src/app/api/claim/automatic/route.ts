import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const claimData = await request.json();

    // Explicitly type the errors array to fix TypeScript error
    const errors: string[] = [];

    // Validation checks
    if (!claimData.companyName) {
      errors.push('Company name is required');
    }
    if (!claimData.contactEmail) {
      errors.push('Contact email is required');
    }
    if (!claimData.contactPhone) {
      errors.push('Contact phone is required');
    }
    if (!claimData.category) {
      errors.push('Category is required');
    }

    // Return errors if any
    if (errors.length > 0) {
      return NextResponse.json({ 
        success: false,
        errors 
      }, { status: 400 });
    }

    // Mock successful response
    return NextResponse.json({ 
      success: true, 
      message: 'Claim processed successfully',
      claimId: 'mock-claim-' + Date.now()
    });

  } catch (error) {
    console.error('Claim processing error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process claim' 
      },
      { status: 500 }
    );
  }
}
