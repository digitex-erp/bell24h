import { NextRequest, NextResponse } from 'next/server';

// Automatic Company Claim API
// Handles automatic claim processing with early user benefits

export async function POST(request: NextRequest) {
  try {
    const { companyId, claimData } = await request.json();

    console.log(`🎯 Processing automatic claim for company: ${companyId}`);

    // Validate claim data
    const validation = await validateClaimData(claimData);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid claim data', details: validation.errors },
        { status: 400 }
      );
    }

    // Process claim with early user benefits
    const claimResult = await processClaimWithBenefits(companyId, claimData);

    // Send welcome package
    await sendWelcomePackage(claimResult);

    // Update analytics
    await updateClaimAnalytics(claimResult);

    return NextResponse.json({
      success: true,
      message: 'Claim processed successfully with early user benefits!',
      data: {
        claimId: claimResult.claimId,
        companyId,
        benefits: claimResult.benefits,
        status: 'ACTIVE',
        welcomePackage: claimResult.welcomePackage,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Automatic Claim Processing Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process claim',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Validate claim data
async function validateClaimData(claimData: any) {
  const errors: string[] = [];  // ⭐️ CORRECT TYPE HERE

  if (!claimData.companyName) errors.push('Company name is required');
  if (!claimData.contactEmail) errors.push('Contact email is required');
  if (!claimData.contactPhone) errors.push('Contact phone is required');
  if (!claimData.category) errors.push('Category is required');

  return {
    isValid: errors.length === 0,
    errors
  };
}

// ... rest of file unchanged ...
// You can keep all your other functions as they are
// The key line is:   const errors: string[] = [];
