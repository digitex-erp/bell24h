import { RFQ, Supplier, Document } from '../../types/rfq';

interface QualityCheck {
  type: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
  recommendations: string[];
}

interface ComplianceCheck {
  standard: string;
  status: 'compliant' | 'non-compliant' | 'partial';
  requirements: {
    requirement: string;
    status: 'met' | 'not-met' | 'partial';
    evidence: string;
  }[];
}

interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  categories: {
    category: string;
    risk: 'low' | 'medium' | 'high';
    factors: string[];
  }[];
  mitigationStrategies: string[];
}

interface FraudDetection {
  riskScore: number;
  indicators: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }[];
  recommendations: string[];
}

export class QualityAssuranceService {
  async performQualityCheck(rfq: RFQ): Promise<QualityCheck[]> {
    const checks: QualityCheck[] = [];

    // Check RFQ completeness
    checks.push(await this.checkRFQCompleteness(rfq));

    // Check specification clarity
    checks.push(await this.checkSpecificationClarity(rfq));

    // Check budget合理性
    checks.push(await this.checkBudgetReasonableness(rfq));

    // Check timeline feasibility
    checks.push(await this.checkTimelineFeasibility(rfq));

    return checks;
  }

  async verifyCompliance(rfq: RFQ, standards: string[]): Promise<ComplianceCheck[]> {
    const checks: ComplianceCheck[] = [];

    for (const standard of standards) {
      checks.push(await this.checkStandardCompliance(rfq, standard));
    }

    return checks;
  }

  async assessRisk(rfq: RFQ, supplier: Supplier): Promise<RiskAssessment> {
    const categories = await this.assessRiskCategories(rfq, supplier);
    const overallRisk = this.calculateOverallRisk(categories);

    return {
      overallRisk,
      categories,
      mitigationStrategies: this.generateMitigationStrategies(categories)
    };
  }

  async detectFraud(rfq: RFQ, supplier: Supplier): Promise<FraudDetection> {
    const indicators = await this.analyzeFraudIndicators(rfq, supplier);
    const riskScore = this.calculateFraudRiskScore(indicators);

    return {
      riskScore,
      indicators,
      recommendations: this.generateFraudRecommendations(indicators)
    };
  }

  private async checkRFQCompleteness(rfq: RFQ): Promise<QualityCheck> {
    const requiredFields = [
      'title',
      'description',
      'category',
      'budget',
      'timeline'
    ];

    const missingFields = requiredFields.filter(field => !rfq[field]);
    const status = missingFields.length === 0 ? 'pass' : 'fail';

    return {
      type: 'completeness',
      status,
      details: status === 'pass' 
        ? 'All required fields are present'
        : `Missing fields: ${missingFields.join(', ')}`,
      recommendations: missingFields.map(field => `Add ${field} to the RFQ`)
    };
  }

  private async checkSpecificationClarity(rfq: RFQ): Promise<QualityCheck> {
    const description = rfq.description || '';
    const clarityScore = this.calculateClarityScore(description);
    const status = clarityScore > 0.7 ? 'pass' : clarityScore > 0.4 ? 'warning' : 'fail';

    return {
      type: 'clarity',
      status,
      details: `Specification clarity score: ${(clarityScore * 100).toFixed(0)}%`,
      recommendations: this.generateClarityRecommendations(description)
    };
  }

  private async checkBudgetReasonableness(rfq: RFQ): Promise<QualityCheck> {
    if (!rfq.budget) {
      return {
        type: 'budget',
        status: 'fail',
        details: 'No budget specified',
        recommendations: ['Add budget information']
      };
    }

    const budget = parseFloat(rfq.budget);
    const marketAverage = await this.getMarketAverage(rfq.category);
    const deviation = Math.abs(budget - marketAverage) / marketAverage;

    const status = deviation < 0.2 ? 'pass' : deviation < 0.5 ? 'warning' : 'fail';

    return {
      type: 'budget',
      status,
      details: `Budget deviation from market average: ${(deviation * 100).toFixed(0)}%`,
      recommendations: this.generateBudgetRecommendations(budget, marketAverage)
    };
  }

  private async checkTimelineFeasibility(rfq: RFQ): Promise<QualityCheck> {
    if (!rfq.timeline) {
      return {
        type: 'timeline',
        status: 'fail',
        details: 'No timeline specified',
        recommendations: ['Add timeline information']
      };
    }

    const timeline = this.parseTimeline(rfq.timeline);
    const averageTimeline = await this.getAverageTimeline(rfq.category);
    const feasibility = this.assessTimelineFeasibility(timeline, averageTimeline);

    return {
      type: 'timeline',
      status: feasibility.status,
      details: feasibility.details,
      recommendations: feasibility.recommendations
    };
  }

  private async checkStandardCompliance(rfq: RFQ, standard: string): Promise<ComplianceCheck> {
    const requirements = await this.getStandardRequirements(standard);
    const complianceResults = await this.checkRequirements(rfq, requirements);

    return {
      standard,
      status: this.determineComplianceStatus(complianceResults),
      requirements: complianceResults
    };
  }

  private async assessRiskCategories(rfq: RFQ, supplier: Supplier): Promise<{
    category: string;
    risk: 'low' | 'medium' | 'high';
    factors: string[];
  }[]> {
    const categories = [
      {
        category: 'financial',
        risk: await this.assessFinancialRisk(rfq, supplier),
        factors: await this.getFinancialRiskFactors(rfq, supplier)
      },
      {
        category: 'operational',
        risk: await this.assessOperationalRisk(rfq, supplier),
        factors: await this.getOperationalRiskFactors(rfq, supplier)
      },
      {
        category: 'compliance',
        risk: await this.assessComplianceRisk(rfq, supplier),
        factors: await this.getComplianceRiskFactors(rfq, supplier)
      }
    ];

    return categories;
  }

  private async analyzeFraudIndicators(rfq: RFQ, supplier: Supplier): Promise<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }[]> {
    const indicators = [];

    // Check for unusual patterns
    const patterns = await this.checkUnusualPatterns(rfq, supplier);
    indicators.push(...patterns);

    // Check for inconsistencies
    const inconsistencies = await this.checkInconsistencies(rfq, supplier);
    indicators.push(...inconsistencies);

    // Check for red flags
    const redFlags = await this.checkRedFlags(rfq, supplier);
    indicators.push(...redFlags);

    return indicators;
  }

  private calculateClarityScore(text: string): number {
    // Implement clarity score calculation
    return 0.8;
  }

  private generateClarityRecommendations(text: string): string[] {
    const recommendations = [];

    if (text.length < 100) {
      recommendations.push('Add more detailed specifications');
    }

    if (!text.includes('requirements')) {
      recommendations.push('Clearly state requirements');
    }

    if (!text.includes('deliverables')) {
      recommendations.push('Specify expected deliverables');
    }

    return recommendations;
  }

  private async getMarketAverage(category: string): Promise<number> {
    // Implement market average calculation
    return 1000;
  }

  private generateBudgetRecommendations(budget: number, marketAverage: number): string[] {
    const recommendations = [];

    if (budget < marketAverage * 0.5) {
      recommendations.push('Consider increasing budget to meet market standards');
    } else if (budget > marketAverage * 2) {
      recommendations.push('Consider reducing budget to align with market standards');
    }

    return recommendations;
  }

  private parseTimeline(timeline: string): number {
    // Convert timeline string to days
    const match = timeline.match(/(\d+)\s*(day|week|month)/i);
    if (!match) return 0;
    const [_, value, unit] = match;
    const multiplier = {
      day: 1,
      week: 7,
      month: 30
    }[unit.toLowerCase()] || 1;
    return parseInt(value) * multiplier;
  }

  private async getAverageTimeline(category: string): Promise<number> {
    // Implement average timeline calculation
    return 30;
  }

  private assessTimelineFeasibility(timeline: number, averageTimeline: number): {
    status: 'pass' | 'fail' | 'warning';
    details: string;
    recommendations: string[];
  } {
    const ratio = timeline / averageTimeline;
    let status: 'pass' | 'fail' | 'warning';
    let details: string;
    let recommendations: string[] = [];

    if (ratio < 0.5) {
      status = 'fail';
      details = 'Timeline is too short for the category';
      recommendations.push('Consider extending the timeline');
    } else if (ratio > 2) {
      status = 'warning';
      details = 'Timeline is longer than average';
      recommendations.push('Consider if the timeline can be shortened');
    } else {
      status = 'pass';
      details = 'Timeline is reasonable';
    }

    return { status, details, recommendations };
  }

  private async getStandardRequirements(standard: string): Promise<{
    requirement: string;
    status: 'met' | 'not-met' | 'partial';
    evidence: string;
  }[]> {
    // Implement standard requirements retrieval
    return [];
  }

  private async checkRequirements(rfq: RFQ, requirements: any[]): Promise<{
    requirement: string;
    status: 'met' | 'not-met' | 'partial';
    evidence: string;
  }[]> {
    // Implement requirements checking
    return [];
  }

  private determineComplianceStatus(results: any[]): 'compliant' | 'non-compliant' | 'partial' {
    const met = results.filter(r => r.status === 'met').length;
    const total = results.length;

    if (met === total) return 'compliant';
    if (met === 0) return 'non-compliant';
    return 'partial';
  }

  private calculateOverallRisk(categories: any[]): 'low' | 'medium' | 'high' {
    const riskScores = {
      low: 0,
      medium: 1,
      high: 2
    };

    const totalScore = categories.reduce((sum, cat) => sum + riskScores[cat.risk], 0);
    const averageScore = totalScore / categories.length;

    if (averageScore < 0.5) return 'low';
    if (averageScore < 1.5) return 'medium';
    return 'high';
  }

  private generateMitigationStrategies(categories: any[]): string[] {
    const strategies = [];

    categories.forEach(category => {
      if (category.risk === 'high') {
        strategies.push(`Implement strict controls for ${category.category} risks`);
      }
      if (category.risk === 'medium') {
        strategies.push(`Monitor ${category.category} risks closely`);
      }
    });

    return strategies;
  }

  private calculateFraudRiskScore(indicators: any[]): number {
    const severityScores = {
      low: 0.3,
      medium: 0.6,
      high: 0.9
    };

    const totalScore = indicators.reduce((sum, ind) => sum + severityScores[ind.severity], 0);
    return totalScore / indicators.length;
  }

  private generateFraudRecommendations(indicators: any[]): string[] {
    const recommendations = [];

    indicators.forEach(indicator => {
      if (indicator.severity === 'high') {
        recommendations.push(`Investigate ${indicator.type} immediately`);
      } else if (indicator.severity === 'medium') {
        recommendations.push(`Monitor ${indicator.type} closely`);
      }
    });

    return recommendations;
  }

  private async checkUnusualPatterns(rfq: RFQ, supplier: Supplier): Promise<any[]> {
    // Implement unusual pattern detection
    return [];
  }

  private async checkInconsistencies(rfq: RFQ, supplier: Supplier): Promise<any[]> {
    // Implement inconsistency detection
    return [];
  }

  private async checkRedFlags(rfq: RFQ, supplier: Supplier): Promise<any[]> {
    // Implement red flag detection
    return [];
  }
}

export const qualityAssuranceService = new QualityAssuranceService(); 