import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ESGData {
  environmental: {
    carbonFootprint: number;
    energyEfficiency: number;
    wasteManagement: number;
    waterConservation: number;
    renewableEnergy: number;
  };
  social: {
    laborRights: number;
    communityEngagement: number;
    diversityInclusion: number;
    healthSafety: number;
    supplyChainEthics: number;
  };
  governance: {
    boardDiversity: number;
    transparency: number;
    antiCorruption: number;
    riskManagement: number;
    stakeholderEngagement: number;
  };
}

interface IndustryBenchmark {
  industry: string;
  environmental: number;
  social: number;
  governance: number;
  overall: number;
}

const INDUSTRY_BENCHMARKS: Record<string, IndustryBenchmark> = {
  'manufacturing': {
    industry: 'Manufacturing',
    environmental: 65,
    social: 70,
    governance: 75,
    overall: 70
  },
  'technology': {
    industry: 'Technology',
    environmental: 75,
    social: 80,
    governance: 85,
    overall: 80
  },
  'retail': {
    industry: 'Retail',
    environmental: 60,
    social: 65,
    governance: 70,
    overall: 65
  },
  'healthcare': {
    industry: 'Healthcare',
    environmental: 70,
    social: 85,
    governance: 80,
    overall: 78
  },
  'finance': {
    industry: 'Finance',
    environmental: 65,
    social: 75,
    governance: 90,
    overall: 77
  }
};

// Calculate ESG Score
function calculateESGScore(data: ESGData, industry: string): {
  environmental: number;
  social: number;
  governance: number;
  overall: number;
  grade: string;
  recommendations: string[];
} {
  // Environmental Score (40% weight)
  const envScore = (
    data.environmental.carbonFootprint * 0.25 +
    data.environmental.energyEfficiency * 0.25 +
    data.environmental.wasteManagement * 0.2 +
    data.environmental.waterConservation * 0.15 +
    data.environmental.renewableEnergy * 0.15
  );

  // Social Score (30% weight)
  const socialScore = (
    data.social.laborRights * 0.25 +
    data.social.communityEngagement * 0.2 +
    data.social.diversityInclusion * 0.2 +
    data.social.healthSafety * 0.2 +
    data.social.supplyChainEthics * 0.15
  );

  // Governance Score (30% weight)
  const govScore = (
    data.governance.boardDiversity * 0.2 +
    data.governance.transparency * 0.25 +
    data.governance.antiCorruption * 0.25 +
    data.governance.riskManagement * 0.15 +
    data.governance.stakeholderEngagement * 0.15
  );

  // Overall Score
  const overallScore = envScore * 0.4 + socialScore * 0.3 + govScore * 0.3;

  // Grade Assignment
  let grade = 'F';
  if (overallScore >= 90) grade = 'A+';
  else if (overallScore >= 85) grade = 'A';
  else if (overallScore >= 80) grade = 'A-';
  else if (overallScore >= 75) grade = 'B+';
  else if (overallScore >= 70) grade = 'B';
  else if (overallScore >= 65) grade = 'B-';
  else if (overallScore >= 60) grade = 'C+';
  else if (overallScore >= 55) grade = 'C';
  else if (overallScore >= 50) grade = 'C-';
  else if (overallScore >= 45) grade = 'D+';
  else if (overallScore >= 40) grade = 'D';
  else if (overallScore >= 35) grade = 'D-';

  // Generate Recommendations
  const recommendations = generateRecommendations(data, industry, {
    environmental: envScore,
    social: socialScore,
    governance: govScore,
    overall: overallScore
  });

  return {
    environmental: Math.round(envScore * 100) / 100,
    social: Math.round(socialScore * 100) / 100,
    governance: Math.round(govScore * 100) / 100,
    overall: Math.round(overallScore * 100) / 100,
    grade,
    recommendations
  };
}

function generateRecommendations(data: ESGData, industry: string, scores: any): string[] {
  const recommendations: string[] = [];
  const benchmark = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS['manufacturing'];

  // Environmental Recommendations
  if (scores.environmental < benchmark.environmental) {
    if (data.environmental.carbonFootprint < 70) {
      recommendations.push('Implement carbon footprint reduction initiatives and set science-based targets');
    }
    if (data.environmental.energyEfficiency < 70) {
      recommendations.push('Adopt energy-efficient technologies and renewable energy sources');
    }
    if (data.environmental.wasteManagement < 70) {
      recommendations.push('Establish comprehensive waste management and recycling programs');
    }
  }

  // Social Recommendations
  if (scores.social < benchmark.social) {
    if (data.social.laborRights < 70) {
      recommendations.push('Strengthen labor rights policies and ensure fair working conditions');
    }
    if (data.social.diversityInclusion < 70) {
      recommendations.push('Implement diversity and inclusion programs with measurable targets');
    }
    if (data.social.healthSafety < 70) {
      recommendations.push('Enhance workplace health and safety protocols');
    }
  }

  // Governance Recommendations
  if (scores.governance < benchmark.governance) {
    if (data.governance.transparency < 70) {
      recommendations.push('Improve transparency in business practices and reporting');
    }
    if (data.governance.antiCorruption < 70) {
      recommendations.push('Strengthen anti-corruption policies and compliance programs');
    }
    if (data.governance.boardDiversity < 70) {
      recommendations.push('Increase board diversity and implement inclusive governance practices');
    }
  }

  // General recommendations based on overall score
  if (scores.overall < 70) {
    recommendations.push('Develop a comprehensive ESG strategy with clear objectives and timelines');
    recommendations.push('Establish ESG reporting and monitoring systems');
    recommendations.push('Engage with stakeholders to understand ESG priorities and concerns');
  }

  return recommendations.slice(0, 5); // Limit to top 5 recommendations
}

// API Routes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { esgData, industry, companyId, userId } = body;

    if (!esgData || !industry) {
      return NextResponse.json(
        { success: false, error: 'ESG data and industry are required' },
        { status: 400 }
      );
    }

    // Calculate ESG Score
    const scoreResult = calculateESGScore(esgData, industry);
    const benchmark = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS['manufacturing'];

    // Save to database
    const esgRecord = await prisma.eSGScore.create({
      data: {
        companyId,
        userId,
        industry,
        environmentalScore: scoreResult.environmental,
        socialScore: scoreResult.social,
        governanceScore: scoreResult.governance,
        overallScore: scoreResult.overall,
        grade: scoreResult.grade,
        recommendations: scoreResult.recommendations,
        esgData: esgData,
        benchmark: benchmark
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...scoreResult,
        benchmark,
        id: esgRecord.id,
        timestamp: esgRecord.createdAt
      }
    });
  } catch (error) {
    console.error('ESG scoring error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate ESG score' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const userId = searchParams.get('userId');
    const industry = searchParams.get('industry');

    if (!companyId && !userId) {
      return NextResponse.json(
        { success: false, error: 'Company ID or User ID is required' },
        { status: 400 }
      );
    }

    // Get ESG scores
    const whereClause: any = {};
    if (companyId) whereClause.companyId = companyId;
    if (userId) whereClause.userId = userId;

    const esgScores = await prisma.eSGScore.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get industry benchmarks
    const benchmarks = Object.values(INDUSTRY_BENCHMARKS);

    return NextResponse.json({
      success: true,
      data: {
        scores: esgScores,
        benchmarks,
        currentIndustry: industry ? INDUSTRY_BENCHMARKS[industry] : null
      }
    });
  } catch (error) {
    console.error('ESG data fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ESG data' },
      { status: 500 }
    );
  }
} 