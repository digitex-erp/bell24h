import { NextRequest, NextResponse } from 'next/server';

interface RiskScoreResponse {
  success: boolean;
  supplierId: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: {
    financial: number;
    operational: number;
    market: number;
    compliance: number;
    reputation: number;
  };
  recommendations: string[];
  lastUpdated: string;
  confidence: number;
}

// Mock supplier data - in production, fetch from database
const getSupplierData = (supplierId: string) => {
  const suppliers = {
    SUP001: {
      name: 'SteelCorp Industries',
      category: 'Steel & Metals',
      location: 'Mumbai',
      yearsInBusiness: 15,
      employeeCount: 250,
      annualRevenue: 50000000,
      creditRating: 'A',
      paymentHistory: 0.95,
      deliveryPerformance: 0.88,
      qualityRating: 4.2,
      complianceScore: 0.92,
      marketPosition: 'established',
      certifications: ['ISO 9001', 'ISO 14001'],
      financialHealth: 'stable',
      recentIncidents: 0,
    },
    SUP002: {
      name: 'TechParts Solutions',
      category: 'Electronics',
      location: 'Bangalore',
      yearsInBusiness: 8,
      employeeCount: 120,
      annualRevenue: 25000000,
      creditRating: 'B+',
      paymentHistory: 0.82,
      deliveryPerformance: 0.75,
      qualityRating: 3.8,
      complianceScore: 0.85,
      marketPosition: 'growing',
      certifications: ['ISO 9001'],
      financialHealth: 'moderate',
      recentIncidents: 2,
    },
    SUP003: {
      name: 'TextileHub Limited',
      category: 'Textiles',
      location: 'Ahmedabad',
      yearsInBusiness: 25,
      employeeCount: 500,
      annualRevenue: 75000000,
      creditRating: 'A+',
      paymentHistory: 0.98,
      deliveryPerformance: 0.95,
      qualityRating: 4.5,
      complianceScore: 0.96,
      marketPosition: 'leader',
      certifications: ['ISO 9001', 'ISO 14001', 'Oeko-Tex'],
      financialHealth: 'excellent',
      recentIncidents: 0,
    },
  };

  return suppliers[supplierId] || suppliers['SUP001']; // Default fallback
};

const calculateRiskScore = (supplier: any): RiskScoreResponse => {
  // Financial Risk (30% weight)
  const financialRisk = calculateFinancialRisk(supplier);

  // Operational Risk (25% weight)
  const operationalRisk = calculateOperationalRisk(supplier);

  // Market Risk (20% weight)
  const marketRisk = calculateMarketRisk(supplier);

  // Compliance Risk (15% weight)
  const complianceRisk = calculateComplianceRisk(supplier);

  // Reputation Risk (10% weight)
  const reputationRisk = calculateReputationRisk(supplier);

  // Calculate weighted risk score
  const riskScore =
    financialRisk * 0.3 +
    operationalRisk * 0.25 +
    marketRisk * 0.2 +
    complianceRisk * 0.15 +
    reputationRisk * 0.1;

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  if (riskScore <= 0.25) riskLevel = 'low';
  else if (riskScore <= 0.5) riskLevel = 'medium';
  else if (riskScore <= 0.75) riskLevel = 'high';
  else riskLevel = 'critical';

  // Generate recommendations
  const recommendations = generateRecommendations(riskScore, supplier);

  return {
    success: true,
    supplierId: supplier.id || 'UNKNOWN',
    riskScore: Math.round(riskScore * 100) / 100,
    riskLevel,
    factors: {
      financial: Math.round(financialRisk * 100) / 100,
      operational: Math.round(operationalRisk * 100) / 100,
      market: Math.round(marketRisk * 100) / 100,
      compliance: Math.round(complianceRisk * 100) / 100,
      reputation: Math.round(reputationRisk * 100) / 100,
    },
    recommendations,
    lastUpdated: new Date().toISOString(),
    confidence: 0.85,
  };
};

const calculateFinancialRisk = (supplier: any): number => {
  let risk = 0.5; // Base risk

  // Credit rating impact
  const creditScores = { 'A+': 0.1, A: 0.2, 'B+': 0.4, B: 0.6, C: 0.8 };
  risk += creditScores[supplier.creditRating] || 0.5;

  // Revenue stability
  if (supplier.annualRevenue > 50000000) risk -= 0.1;
  else if (supplier.annualRevenue < 10000000) risk += 0.2;

  // Years in business
  if (supplier.yearsInBusiness > 10) risk -= 0.1;
  else if (supplier.yearsInBusiness < 3) risk += 0.2;

  return Math.max(0, Math.min(1, risk));
};

const calculateOperationalRisk = (supplier: any): number => {
  let risk = 0.5;

  // Delivery performance
  risk += (1 - supplier.deliveryPerformance) * 0.4;

  // Quality rating
  risk += (5 - supplier.qualityRating) * 0.1;

  // Employee count (proxy for capacity)
  if (supplier.employeeCount < 50) risk += 0.2;
  else if (supplier.employeeCount > 200) risk -= 0.1;

  // Recent incidents
  risk += supplier.recentIncidents * 0.1;

  return Math.max(0, Math.min(1, risk));
};

const calculateMarketRisk = (supplier: any): number => {
  let risk = 0.5;

  // Market position
  const positionScores = { leader: 0.2, established: 0.3, growing: 0.5, new: 0.7 };
  risk += positionScores[supplier.marketPosition] || 0.5;

  // Industry volatility (simplified)
  const volatileIndustries = ['Electronics', 'Technology'];
  if (volatileIndustries.includes(supplier.category)) risk += 0.2;

  return Math.max(0, Math.min(1, risk));
};

const calculateComplianceRisk = (supplier: any): number => {
  let risk = 0.5;

  // Compliance score
  risk += (1 - supplier.complianceScore) * 0.6;

  // Certifications
  const certificationCount = supplier.certifications?.length || 0;
  risk -= certificationCount * 0.1;

  return Math.max(0, Math.min(1, risk));
};

const calculateReputationRisk = (supplier: any): number => {
  let risk = 0.5;

  // Payment history
  risk += (1 - supplier.paymentHistory) * 0.5;

  // Quality rating
  risk += (5 - supplier.qualityRating) * 0.1;

  // Years in business (reputation factor)
  if (supplier.yearsInBusiness > 15) risk -= 0.2;
  else if (supplier.yearsInBusiness < 5) risk += 0.2;

  return Math.max(0, Math.min(1, risk));
};

const generateRecommendations = (riskScore: number, supplier: any): string[] => {
  const recommendations = [];

  if (riskScore > 0.7) {
    recommendations.push('Consider alternative suppliers for critical orders');
    recommendations.push('Implement additional due diligence measures');
    recommendations.push('Request financial guarantees or advance payments');
  } else if (riskScore > 0.5) {
    recommendations.push('Monitor supplier performance closely');
    recommendations.push('Consider shorter payment terms');
    recommendations.push('Request regular financial updates');
  } else if (riskScore > 0.3) {
    recommendations.push('Standard monitoring procedures sufficient');
    recommendations.push('Consider long-term partnership opportunities');
  } else {
    recommendations.push('Excellent supplier - consider preferred partner status');
    recommendations.push('Explore volume discount opportunities');
  }

  // Specific recommendations based on factors
  if (supplier.paymentHistory < 0.9) {
    recommendations.push('Implement stricter payment monitoring');
  }

  if (supplier.deliveryPerformance < 0.8) {
    recommendations.push('Set up delivery tracking and alerts');
  }

  if (supplier.qualityRating < 4.0) {
    recommendations.push('Implement quality control measures');
  }

  return recommendations;
};

export async function GET(request: NextRequest, { params }: { params: { supplierId: string } }) {
  try {
    console.log(`🛡️ Risk score requested for supplier: ${params.supplierId}`);

    const supplierId = params.supplierId;
    const supplier = getSupplierData(supplierId);

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    const riskAssessment = calculateRiskScore({
      id: supplierId,
      ...supplier,
    });

    console.log(`✅ Risk assessment completed for ${supplierId}: ${riskAssessment.riskLevel}`);

    return NextResponse.json(riskAssessment);
  } catch (error) {
    console.error('❌ Risk score calculation failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Risk score calculation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: { supplierId: string } }) {
  try {
    const { action, data } = await request.json();
    const supplierId = params.supplierId;

    switch (action) {
      case 'update-risk-data':
        // In production, update supplier risk data in database
        console.log(`📊 Updating risk data for supplier: ${supplierId}`);

        return NextResponse.json({
          success: true,
          message: 'Risk data updated successfully',
          supplierId,
        });

      case 'recalculate':
        // Force recalculation of risk score
        const supplier = getSupplierData(supplierId);
        const riskAssessment = calculateRiskScore({
          id: supplierId,
          ...supplier,
        });

        return NextResponse.json({
          success: true,
          message: 'Risk score recalculated',
          riskAssessment,
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Risk score update failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Risk score update failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
