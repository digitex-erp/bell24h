import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const claimData = await request.json();

    // EXPLICIT TYPING - this fixes the TypeScript error
    const errors: string[] = [];

    if (!claimData.companyName) errors.push('Company name is required');
    if (!claimData.contactEmail) errors.push('Contact email is required');
    if (!claimData.contactPhone) errors.push('Contact phone is required');
    if (!claimData.category) errors.push('Category is required');

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Claim processed successfully',
      claimId: 'mock-claim-id'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process claim' },
      { status: 500 }
    );
  }
}
