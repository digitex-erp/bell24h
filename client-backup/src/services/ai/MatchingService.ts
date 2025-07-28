import { RFQ, Supplier } from '../../types/rfq';
import { CategoryConfig } from '../../config/categories';

interface MatchingScore {
  compatibilityScore: number;
  performanceScore: number;
  responseScore: number;
  totalScore: number;
}

interface MatchingCriteria {
  categoryWeight: number;
  subcategoryWeight: number;
  budgetWeight: number;
  timelineWeight: number;
  locationWeight: number;
}

export class MatchingService {
  private defaultCriteria: MatchingCriteria = {
    categoryWeight: 0.3,
    subcategoryWeight: 0.2,
    budgetWeight: 0.2,
    timelineWeight: 0.15,
    locationWeight: 0.15
  };

  async calculateSupplierScore(supplier: Supplier, rfq: RFQ): Promise<MatchingScore> {
    const compatibilityScore = await this.calculateCompatibility(supplier, rfq);
    const performanceScore = await this.calculatePerformance(supplier);
    const responseScore = await this.calculateResponseTime(supplier);

    const totalScore = this.calculateWeightedScore({
      compatibilityScore,
      performanceScore,
      responseScore
    });

    return {
      compatibilityScore,
      performanceScore,
      responseScore,
      totalScore
    };
  }

  private async calculateCompatibility(supplier: Supplier, rfq: RFQ): Promise<number> {
    const categoryMatch = this.calculateCategoryMatch(supplier, rfq);
    const subcategoryMatch = this.calculateSubcategoryMatch(supplier, rfq);
    const budgetMatch = this.calculateBudgetMatch(supplier, rfq);
    const timelineMatch = this.calculateTimelineMatch(supplier, rfq);
    const locationMatch = this.calculateLocationMatch(supplier, rfq);

    return this.calculateWeightedScore({
      categoryMatch: { score: categoryMatch, weight: this.defaultCriteria.categoryWeight },
      subcategoryMatch: { score: subcategoryMatch, weight: this.defaultCriteria.subcategoryWeight },
      budgetMatch: { score: budgetMatch, weight: this.defaultCriteria.budgetWeight },
      timelineMatch: { score: timelineMatch, weight: this.defaultCriteria.timelineWeight },
      locationMatch: { score: locationMatch, weight: this.defaultCriteria.locationWeight }
    });
  }

  private calculateCategoryMatch(supplier: Supplier, rfq: RFQ): number {
    return supplier.categories.includes(rfq.category) ? 1 : 0;
  }

  private calculateSubcategoryMatch(supplier: Supplier, rfq: RFQ): number {
    if (!rfq.subcategory) return 1;
    return supplier.subcategories.includes(rfq.subcategory) ? 1 : 0;
  }

  private calculateBudgetMatch(supplier: Supplier, rfq: RFQ): number {
    if (!rfq.budget || !supplier.priceRange) return 1;
    const [min, max] = supplier.priceRange;
    const budget = parseFloat(rfq.budget);
    return budget >= min && budget <= max ? 1 : 0;
  }

  private calculateTimelineMatch(supplier: Supplier, rfq: RFQ): number {
    if (!rfq.timeline || !supplier.leadTime) return 1;
    return supplier.leadTime <= this.parseTimeline(rfq.timeline) ? 1 : 0;
  }

  private calculateLocationMatch(supplier: Supplier, rfq: RFQ): number {
    if (!rfq.location || !supplier.servingLocations) return 1;
    return supplier.servingLocations.includes(rfq.location) ? 1 : 0;
  }

  private async calculatePerformance(supplier: Supplier): Promise<number> {
    const rating = supplier.rating || 0;
    const responseRate = supplier.responseRate || 0;
    const completionRate = supplier.completionRate || 0;

    return this.calculateWeightedScore({
      rating: { score: rating / 5, weight: 0.4 },
      responseRate: { score: responseRate / 100, weight: 0.3 },
      completionRate: { score: completionRate / 100, weight: 0.3 }
    });
  }

  private async calculateResponseTime(supplier: Supplier): Promise<number> {
    const avgResponseTime = supplier.avgResponseTime || 0;
    const maxResponseTime = 48; // 48 hours
    return Math.max(0, 1 - (avgResponseTime / maxResponseTime));
  }

  private calculateWeightedScore(scores: Record<string, { score: number; weight: number }>): number {
    const totalWeight = Object.values(scores).reduce((sum, { weight }) => sum + weight, 0);
    const weightedSum = Object.values(scores).reduce(
      (sum, { score, weight }) => sum + score * weight,
      0
    );
    return weightedSum / totalWeight;
  }

  private parseTimeline(timeline: string): number {
    // Convert timeline string to hours
    const match = timeline.match(/(\d+)\s*(day|week|month)/i);
    if (!match) return 0;
    const [_, value, unit] = match;
    const multiplier = {
      day: 24,
      week: 168,
      month: 720
    }[unit.toLowerCase()] || 24;
    return parseInt(value) * multiplier;
  }

  async findMatchingSuppliers(rfq: RFQ, suppliers: Supplier[]): Promise<Supplier[]> {
    const scores = await Promise.all(
      suppliers.map(async (supplier) => ({
        supplier,
        score: await this.calculateSupplierScore(supplier, rfq)
      }))
    );

    return scores
      .sort((a, b) => b.score.totalScore - a.score.totalScore)
      .map(({ supplier }) => supplier);
  }
}

export const matchingService = new MatchingService(); 