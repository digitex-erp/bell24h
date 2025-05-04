
import { SupplierData, RiskScore, RiskFactor } from '../../types';
import * as tf from '@tensorflow/tfjs-node';

export class SupplierRiskScoring {
  private readonly weightFactors = {
    financialStability: 0.25,
    deliveryReliability: 0.20,
    qualityConsistency: 0.20,
    marketReputation: 0.15,
    complianceScore: 0.10,
    geopoliticalRisk: 0.10
  };

  async calculateRiskScore(supplier: SupplierData): Promise<RiskScore> {
    const riskFactors = await this.analyzeRiskFactors(supplier);
    const overallScore = this.computeWeightedScore(riskFactors);
    
    return {
      score: overallScore,
      riskLevel: this.determineRiskLevel(overallScore),
      factors: riskFactors,
      timestamp: new Date().toISOString(),
      recommendations: this.generateRecommendations(riskFactors)
    };
  }

  private async analyzeRiskFactors(supplier: SupplierData): Promise<RiskFactor[]> {
    const factors: RiskFactor[] = [];
    
    // Financial Stability Analysis
    factors.push({
      name: 'financialStability',
      score: await this.assessFinancialStability(supplier),
      weight: this.weightFactors.financialStability,
      insights: this.getFinancialInsights(supplier)
    });

    // Delivery Reliability
    factors.push({
      name: 'deliveryReliability',
      score: this.calculateDeliveryScore(supplier),
      weight: this.weightFactors.deliveryReliability,
      insights: this.getDeliveryInsights(supplier)
    });

    // Quality Consistency
    factors.push({
      name: 'qualityConsistency',
      score: this.assessQualityMetrics(supplier),
      weight: this.weightFactors.qualityConsistency,
      insights: this.getQualityInsights(supplier)
    });

    // Market Reputation
    factors.push({
      name: 'marketReputation',
      score: await this.analyzeMarketReputation(supplier),
      weight: this.weightFactors.marketReputation,
      insights: this.getReputationInsights(supplier)
    });

    // Compliance Score
    factors.push({
      name: 'complianceScore',
      score: this.evaluateCompliance(supplier),
      weight: this.weightFactors.complianceScore,
      insights: this.getComplianceInsights(supplier)
    });

    // Geopolitical Risk
    factors.push({
      name: 'geopoliticalRisk',
      score: await this.assessGeopoliticalRisk(supplier),
      weight: this.weightFactors.geopoliticalRisk,
      insights: this.getGeopoliticalInsights(supplier)
    });

    return factors;
  }

  private async assessFinancialStability(supplier: SupplierData): Promise<number> {
    const financialMetrics = {
      paymentHistory: supplier.paymentHistory || [],
      creditScore: supplier.creditScore || 0,
      financialReports: supplier.financialReports || []
    };

    // Using TensorFlow for financial pattern analysis
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [3], units: 8, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    const input = tf.tensor2d([[
      this.normalizePaymentHistory(financialMetrics.paymentHistory),
      financialMetrics.creditScore / 100,
      this.analyzeFinancialReports(financialMetrics.financialReports)
    ]]);

    const prediction = model.predict(input) as tf.Tensor;
    const score = await prediction.data();
    return score[0] * 100;
  }

  private normalizePaymentHistory(history: any[]): number {
    if (!history.length) return 0.5;
    const onTimePayments = history.filter(p => p.onTime).length;
    return onTimePayments / history.length;
  }

  private analyzeFinancialReports(reports: any[]): number {
    if (!reports.length) return 0.5;
    // Simplified financial health analysis
    return reports.reduce((acc, report) => acc + (report.healthScore || 0), 0) / reports.length;
  }

  private calculateDeliveryScore(supplier: SupplierData): number {
    const deliveryMetrics = {
      onTimeDelivery: supplier.deliveryStats?.onTimePercentage || 0,
      averageDelay: supplier.deliveryStats?.averageDelay || 0,
      returnRate: supplier.deliveryStats?.returnRate || 0
    };

    return (
      (deliveryMetrics.onTimeDelivery * 0.5) +
      ((100 - Math.min(deliveryMetrics.averageDelay, 100)) * 0.3) +
      ((100 - deliveryMetrics.returnRate) * 0.2)
    );
  }

  private assessQualityMetrics(supplier: SupplierData): number {
    return (
      (supplier.qualityScore || 0) * 0.6 +
      (supplier.customerSatisfaction || 0) * 0.4
    );
  }

  private async analyzeMarketReputation(supplier: SupplierData): Promise<number> {
    // Simplified market reputation scoring
    const reputationFactors = {
      marketPresence: supplier.yearsInBusiness || 0,
      customerReviews: supplier.reviewScore || 0,
      industryRanking: supplier.industryRank || 0
    };

    return (
      (Math.min(reputationFactors.marketPresence, 10) * 10) * 0.3 +
      (reputationFactors.customerReviews) * 0.4 +
      (100 - reputationFactors.industryRanking) * 0.3
    );
  }

  private evaluateCompliance(supplier: SupplierData): number {
    const complianceFactors = {
      certifications: supplier.certifications || [],
      regulatoryViolations: supplier.violations || [],
      auditScore: supplier.lastAuditScore || 0
    };

    return (
      (complianceFactors.certifications.length * 20) +
      (100 - (complianceFactors.regulatoryViolations.length * 10)) +
      complianceFactors.auditScore
    ) / 3;
  }

  private async assessGeopoliticalRisk(supplier: SupplierData): Promise<number> {
    // Simplified geopolitical risk assessment
    const baseScore = 100;
    const locationRisk = this.getLocationRiskScore(supplier.location);
    const politicalStability = await this.getPoliticalStabilityScore(supplier.location);
    
    return (baseScore - (locationRisk + politicalStability) / 2);
  }

  private getLocationRiskScore(location: string): number {
    // Simplified location risk scoring
    const highRiskLocations = ['Location A', 'Location B'];
    const mediumRiskLocations = ['Location C', 'Location D'];
    
    if (highRiskLocations.includes(location)) return 75;
    if (mediumRiskLocations.includes(location)) return 50;
    return 25;
  }

  private async getPoliticalStabilityScore(location: string): Promise<number> {
    // Simplified political stability scoring
    return 25; // Default moderate risk
  }

  private computeWeightedScore(factors: RiskFactor[]): number {
    return factors.reduce((total, factor) => {
      return total + (factor.score * factor.weight);
    }, 0);
  }

  private determineRiskLevel(score: number): string {
    if (score >= 80) return 'LOW';
    if (score >= 60) return 'MODERATE';
    if (score >= 40) return 'HIGH';
    return 'SEVERE';
  }

  private generateRecommendations(factors: RiskFactor[]): string[] {
    const recommendations: string[] = [];
    
    factors.forEach(factor => {
      if (factor.score < 60) {
        recommendations.push(this.getRecommendationForFactor(factor));
      }
    });

    return recommendations;
  }

  private getRecommendationForFactor(factor: RiskFactor): string {
    const recommendations = {
      financialStability: 'Consider requesting additional financial guarantees or implementing milestone-based payments.',
      deliveryReliability: 'Implement stricter delivery monitoring and establish backup suppliers.',
      qualityConsistency: 'Request additional quality certifications and increase inspection frequency.',
      marketReputation: 'Conduct detailed market research and request references from other clients.',
      complianceScore: 'Schedule compliance audit and review certification requirements.',
      geopoliticalRisk: 'Develop contingency plans and diversify supplier base across regions.'
    };

    return recommendations[factor.name as keyof typeof recommendations] || 
           'Review and monitor performance regularly.';
  }

  private getInsights(type: string, supplier: SupplierData): string[] {
    const insights: Record<string, string[]> = {
      financial: [
        `Payment reliability: ${this.normalizePaymentHistory(supplier.paymentHistory || []) * 100}%`,
        `Credit score: ${supplier.creditScore || 'N/A'}`
      ],
      delivery: [
        `On-time delivery rate: ${supplier.deliveryStats?.onTimePercentage || 0}%`,
        `Average delay: ${supplier.deliveryStats?.averageDelay || 0} days`
      ],
      quality: [
        `Quality score: ${supplier.qualityScore || 0}/100`,
        `Customer satisfaction: ${supplier.customerSatisfaction || 0}%`
      ],
      reputation: [
        `Years in business: ${supplier.yearsInBusiness || 0}`,
        `Industry ranking: ${supplier.industryRank || 'N/A'}`
      ],
      compliance: [
        `Certifications: ${(supplier.certifications || []).length}`,
        `Last audit score: ${supplier.lastAuditScore || 0}/100`
      ],
      geopolitical: [
        `Location risk: ${this.getLocationRiskScore(supplier.location)}%`,
        `Political stability: Moderate`
      ]
    };

    return insights[type] || [];
  }

  private getFinancialInsights = (supplier: SupplierData) => this.getInsights('financial', supplier);
  private getDeliveryInsights = (supplier: SupplierData) => this.getInsights('delivery', supplier);
  private getQualityInsights = (supplier: SupplierData) => this.getInsights('quality', supplier);
  private getReputationInsights = (supplier: SupplierData) => this.getInsights('reputation', supplier);
  private getComplianceInsights = (supplier: SupplierData) => this.getInsights('compliance', supplier);
  private getGeopoliticalInsights = (supplier: SupplierData) => this.getInsights('geopolitical', supplier);
}
