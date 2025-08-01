import { NextRequest, NextResponse } from 'next/server';

interface RiskFactors {
  financialHealth: number;
  deliveryHistory: number;
  certifications: number;
  marketReputation: number;
  responseTime: number;
  clientSatisfaction: number;
  legalCompliance: number;
  technicalCapability: number;
}

interface RiskScore {
  overallScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: RiskFactors;
  breakdown: {
    [key: string]: {
      score: number;
      weight: number;
      impact: string;
    };
  };
  recommendations: string[];
  lastUpdated: string;
}

export async function POST(request: NextRequest) {
  try {
    const { supplierId } = await request.json();

    // Mock supplier data (in real app, fetch from database)
    const supplierData = {
      id: supplierId,
      name: "Tech Solutions Ltd",
      financialHealth: {
        creditScore: 750,
        paymentHistory: "excellent",
        debtRatio: 0.3,
        cashFlow: "positive"
      },
      deliveryHistory: {
        onTimeDelivery: 0.92,
        totalDeliveries: 150,
        lateDeliveries: 12,
        qualityIssues: 3
      },
      certifications: [
        "ISO 9001:2015",
        "ISO 14001:2015", 
        "CE Marking",
        "ROHS Compliance"
      ],
      marketReputation: {
        rating: 4.8,
        totalReviews: 89,
        positiveReviews: 85,
        yearsInBusiness: 15
      },
      responseTime: {
        averageResponse: "2.5 hours",
        responseRate: 0.98
      },
      clientSatisfaction: {
        score: 96,
        totalClients: 45,
        repeatClients: 38
      },
      legalCompliance: {
        gstCompliance: true,
        taxFiling: "up-to-date",
        legalIssues: 0
      },
      technicalCapability: {
        teamSize: 25,
        certifications: 8,
        patents: 3,
        rndInvestment: "₹50 lakhs/year"
      }
    };

    // Calculate risk scores for each factor
    const riskFactors: RiskFactors = {
      financialHealth: calculateFinancialRisk(supplierData.financialHealth),
      deliveryHistory: calculateDeliveryRisk(supplierData.deliveryHistory),
      certifications: calculateCertificationRisk(supplierData.certifications),
      marketReputation: calculateReputationRisk(supplierData.marketReputation),
      responseTime: calculateResponseRisk(supplierData.responseTime),
      clientSatisfaction: calculateSatisfactionRisk(supplierData.clientSatisfaction),
      legalCompliance: calculateComplianceRisk(supplierData.legalCompliance),
      technicalCapability: calculateTechnicalRisk(supplierData.technicalCapability)
    };

    // Calculate weighted overall score
    const weights = {
      financialHealth: 0.25,
      deliveryHistory: 0.20,
      certifications: 0.15,
      marketReputation: 0.15,
      responseTime: 0.10,
      clientSatisfaction: 0.10,
      legalCompliance: 0.03,
      technicalCapability: 0.02
    };

    const overallScore = Object.keys(riskFactors).reduce((total, factor) => {
      return total + (riskFactors[factor as keyof RiskFactors] * weights[factor as keyof typeof weights]);
    }, 0);

    // Determine risk level
    const riskLevel = getRiskLevel(overallScore);

    // Generate recommendations
    const recommendations = generateRecommendations(riskFactors, overallScore);

    const riskScore: RiskScore = {
      overallScore: Math.round(overallScore * 100) / 100,
      riskLevel,
      factors: riskFactors,
      breakdown: {
        financialHealth: {
          score: riskFactors.financialHealth,
          weight: weights.financialHealth,
          impact: "High impact on payment reliability"
        },
        deliveryHistory: {
          score: riskFactors.deliveryHistory,
          weight: weights.deliveryHistory,
          impact: "Critical for project timelines"
        },
        certifications: {
          score: riskFactors.certifications,
          weight: weights.certifications,
          impact: "Ensures quality standards"
        },
        marketReputation: {
          score: riskFactors.marketReputation,
          weight: weights.marketReputation,
          impact: "Indicates market trust"
        },
        responseTime: {
          score: riskFactors.responseTime,
          weight: weights.responseTime,
          impact: "Affects communication efficiency"
        },
        clientSatisfaction: {
          score: riskFactors.clientSatisfaction,
          weight: weights.clientSatisfaction,
          impact: "Predicts future performance"
        },
        legalCompliance: {
          score: riskFactors.legalCompliance,
          weight: weights.legalCompliance,
          impact: "Reduces legal risks"
        },
        technicalCapability: {
          score: riskFactors.technicalCapability,
          weight: weights.technicalCapability,
          impact: "Ensures technical competence"
        }
      },
      recommendations,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: riskScore
    });

  } catch (error) {
    console.error('Risk score calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate risk score', details: error },
      { status: 500 }
    );
  }
}

function calculateFinancialRisk(financial: any): number {
  let score = 0;
  
  // Credit score (0-850 scale)
  if (financial.creditScore >= 750) score += 0.9;
  else if (financial.creditScore >= 650) score += 0.7;
  else if (financial.creditScore >= 550) score += 0.5;
  else score += 0.3;

  // Payment history
  if (financial.paymentHistory === "excellent") score += 0.9;
  else if (financial.paymentHistory === "good") score += 0.7;
  else score += 0.4;

  // Debt ratio
  if (financial.debtRatio <= 0.3) score += 0.9;
  else if (financial.debtRatio <= 0.5) score += 0.7;
  else score += 0.5;

  return score / 3;
}

function calculateDeliveryRisk(delivery: any): number {
  let score = 0;
  
  // On-time delivery rate
  if (delivery.onTimeDelivery >= 0.95) score += 0.9;
  else if (delivery.onTimeDelivery >= 0.90) score += 0.7;
  else if (delivery.onTimeDelivery >= 0.85) score += 0.5;
  else score += 0.3;

  // Quality issues
  const qualityRate = 1 - (delivery.qualityIssues / delivery.totalDeliveries);
  if (qualityRate >= 0.98) score += 0.9;
  else if (qualityRate >= 0.95) score += 0.7;
  else score += 0.5;

  return score / 2;
}

function calculateCertificationRisk(certifications: string[]): number {
  const requiredCerts = ["ISO 9001", "CE Marking"];
  const optionalCerts = ["ISO 14001", "ROHS Compliance", "FDA Approval"];
  
  let score = 0;
  
  // Required certifications
  const requiredCount = requiredCerts.filter(cert => 
    certifications.some(c => c.includes(cert))
  ).length;
  score += (requiredCount / requiredCerts.length) * 0.6;
  
  // Optional certifications
  const optionalCount = optionalCerts.filter(cert => 
    certifications.some(c => c.includes(cert))
  ).length;
  score += (optionalCount / optionalCerts.length) * 0.4;
  
  return score;
}

function calculateReputationRisk(reputation: any): number {
  let score = 0;
  
  // Rating
  if (reputation.rating >= 4.5) score += 0.9;
  else if (reputation.rating >= 4.0) score += 0.7;
  else if (reputation.rating >= 3.5) score += 0.5;
  else score += 0.3;
  
  // Years in business
  if (reputation.yearsInBusiness >= 10) score += 0.9;
  else if (reputation.yearsInBusiness >= 5) score += 0.7;
  else score += 0.5;
  
  return score / 2;
}

function calculateResponseRisk(response: any): number {
  const avgHours = parseFloat(response.averageResponse.split(' ')[0]);
  
  if (avgHours <= 2) return 0.9;
  else if (avgHours <= 4) return 0.7;
  else if (avgHours <= 8) return 0.5;
  else return 0.3;
}

function calculateSatisfactionRisk(satisfaction: any): number {
  if (satisfaction.score >= 95) return 0.9;
  else if (satisfaction.score >= 90) return 0.7;
  else if (satisfaction.score >= 85) return 0.5;
  else return 0.3;
}

function calculateComplianceRisk(compliance: any): number {
  let score = 0;
  
  if (compliance.gstCompliance) score += 0.5;
  if (compliance.taxFiling === "up-to-date") score += 0.3;
  if (compliance.legalIssues === 0) score += 0.2;
  
  return score;
}

function calculateTechnicalRisk(technical: any): number {
  let score = 0;
  
  if (technical.teamSize >= 20) score += 0.3;
  if (technical.certifications >= 5) score += 0.3;
  if (technical.patents > 0) score += 0.2;
  if (technical.rndInvestment.includes("lakhs")) score += 0.2;
  
  return score;
}

function getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= 0.8) return 'LOW';
  else if (score >= 0.6) return 'MEDIUM';
  else if (score >= 0.4) return 'HIGH';
  else return 'CRITICAL';
}

function generateRecommendations(factors: RiskFactors, overallScore: number): string[] {
  const recommendations: string[] = [];
  
  if (factors.financialHealth < 0.7) {
    recommendations.push("Monitor payment terms and request advance payments for large orders");
  }
  
  if (factors.deliveryHistory < 0.8) {
    recommendations.push("Set up milestone-based payments and delivery tracking");
  }
  
  if (factors.certifications < 0.6) {
    recommendations.push("Request additional quality certifications before large orders");
  }
  
  if (overallScore < 0.6) {
    recommendations.push("Consider alternative suppliers for critical projects");
  }
  
  if (recommendations.length === 0) {
    recommendations.push("Supplier shows excellent risk profile - proceed with confidence");
  }
  
  return recommendations;
} 