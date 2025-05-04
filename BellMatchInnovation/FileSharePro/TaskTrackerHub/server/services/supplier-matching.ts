import { Rfq, Supplier, SupplierRecommendation, InsertSupplierRecommendation } from "@shared/schema";
import { log } from "../vite";
import { storage } from '../storage';

/**
 * Advanced Supplier Matching Service
 * 
 * Provides AI-powered supplier matching for RFQs based on multiple criteria:
 * - Industry/category match
 * - Location proximity
 * - Price range compatibility
 * - Past performance
 * - Delivery time requirements
 * - Certification compatibility
 * - Historical success rate
 */
class SupplierMatchingService {
  // Weights for different matching criteria (must sum to 1.0)
  private weights = {
    categoryMatch: 0.25,
    locationProximity: 0.10,
    priceRange: 0.15,
    performance: 0.15,
    deliveryTime: 0.15,
    certifications: 0.10,
    successRate: 0.10
  };
  
  constructor() {
    log("Supplier matching service initialized", "supplier-matching");
    
    // Validate weights sum to 1.0
    const weightSum = Object.values(this.weights).reduce((sum, weight) => sum + weight, 0);
    if (Math.abs(weightSum - 1.0) > 0.001) {
      log(`Warning: Weights don't sum to 1.0 (sum: ${weightSum})`, "supplier-matching");
    }
  }
  
  /**
   * Find matching suppliers for an RFQ
   * @param rfq The RFQ to find suppliers for
   * @param limit Maximum number of suppliers to return
   * @returns Array of supplier recommendations with match scores
   */
  public async findMatchingSuppliers(
    rfq: Rfq,
    limit: number = 5
  ): Promise<SupplierRecommendation[]> {
    try {
      log(`Finding matching suppliers for RFQ #${rfq.id}`, "supplier-matching");
      
      // Get all suppliers from the database
      const suppliers = await storage.getSuppliers();
      
      if (suppliers.length === 0) {
        log("No suppliers found in database", "supplier-matching");
        return [];
      }
      
      // Calculate match scores for each supplier
      const scoredSuppliers = await Promise.all(
        suppliers.map(async (supplier) => {
          const score = await this.calculateMatchScore(rfq, supplier);
          
          // Create a supplier recommendation
          const recommendation: InsertSupplierRecommendation = {
            rfqId: rfq.id,
            supplierId: supplier.id,
            matchScore: score,
            matchReason: this.generateMatchReason(rfq, supplier, score),
            recommended: score >= 0.7, // Recommend if score is at least 70%
          };
          
          return recommendation;
        })
      );
      
      // Sort by score (descending) and take the top matches
      const topSuppliers = scoredSuppliers
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);
      
      // Store recommendations in the database
      const storedRecommendations = await Promise.all(
        topSuppliers.map(async (recommendation) => {
          // Skip if this recommendation already exists
          const existingRecommendations = await storage.getSupplierRecommendations(rfq.id);
          const exists = existingRecommendations.some(
            rec => rec.supplierId === recommendation.supplierId
          );
          
          if (!exists) {
            return await storage.createSupplierRecommendation(recommendation);
          } else {
            // Find the existing recommendation
            return existingRecommendations.find(
              rec => rec.supplierId === recommendation.supplierId
            ) as SupplierRecommendation;
          }
        })
      );
      
      return storedRecommendations.filter(Boolean) as SupplierRecommendation[];
    } catch (error) {
      log(`Error finding matching suppliers: ${error}`, "supplier-matching");
      return [];
    }
  }
  
  /**
   * Calculate the match score between an RFQ and a supplier
   * @param rfq The RFQ to match
   * @param supplier The supplier to evaluate
   * @returns Match score (0-1)
   */
  private async calculateMatchScore(rfq: Rfq, supplier: Supplier): Promise<number> {
    try {
      // Initialize score contributions for each criterion
      const scores = {
        categoryMatch: this.calculateCategoryMatch(rfq, supplier),
        locationProximity: this.calculateLocationProximity(rfq, supplier),
        priceRange: this.calculatePriceRangeCompatibility(rfq, supplier),
        performance: this.calculatePerformanceScore(supplier),
        deliveryTime: this.calculateDeliveryTimeMatch(rfq, supplier),
        certifications: this.calculateCertificationMatch(rfq, supplier),
        successRate: this.calculateSuccessRateScore(supplier)
      };
      
      // Apply weights to each score component
      let weightedScore = 0;
      for (const [criterion, score] of Object.entries(scores)) {
        weightedScore += score * this.weights[criterion];
      }
      
      return Math.min(1, Math.max(0, weightedScore));
    } catch (error) {
      log(`Error calculating match score: ${error}`, "supplier-matching");
      return 0;
    }
  }
  
  /**
   * Calculate category match score
   * @param rfq The RFQ
   * @param supplier The supplier
   * @returns Match score (0-1)
   */
  private calculateCategoryMatch(rfq: Rfq, supplier: Supplier): number {
    // Extract categories from RFQ and supplier
    const rfqCategories = (rfq.category || '').toLowerCase().split(',').map(c => c.trim());
    const supplierCategories = (supplier.categories || '').toLowerCase().split(',').map(c => c.trim());
    
    if (rfqCategories.length === 0 || supplierCategories.length === 0) {
      return 0.3; // Default match when data is missing
    }
    
    // Count exact matches
    const exactMatches = rfqCategories.filter(cat => 
      supplierCategories.some(sCat => sCat === cat)
    ).length;
    
    // Count partial matches (substring)
    const partialMatches = rfqCategories.filter(cat => 
      !supplierCategories.some(sCat => sCat === cat) && // Not an exact match
      supplierCategories.some(sCat => 
        sCat.includes(cat) || cat.includes(sCat)
      )
    ).length;
    
    // Calculate score: exact matches are weighted higher than partial matches
    const matchScore = (exactMatches * 1.0 + partialMatches * 0.4) / rfqCategories.length;
    
    return Math.min(1, matchScore);
  }
  
  /**
   * Calculate location proximity score
   * @param rfq The RFQ
   * @param supplier The supplier
   * @returns Match score (0-1)
   */
  private calculateLocationProximity(rfq: Rfq, supplier: Supplier): number {
    // Extract locations
    const rfqLocation = (rfq.location || '').toLowerCase();
    const supplierLocation = (supplier.location || '').toLowerCase();
    
    if (!rfqLocation || !supplierLocation) {
      return 0.5; // Default score when data is missing
    }
    
    // Check for exact state match
    const indiaStates = [
      'andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh',
      'goa', 'gujarat', 'haryana', 'himachal pradesh', 'jharkhand', 'karnataka',
      'kerala', 'madhya pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram',
      'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim', 'tamil nadu', 'telangana',
      'tripura', 'uttar pradesh', 'uttarakhand', 'west bengal',
      'delhi', 'jammu and kashmir', 'puducherry', 'ladakh', 'chandigarh'
    ];
    
    // Extract state from locations
    const rfqState = indiaStates.find(state => rfqLocation.includes(state));
    const supplierState = indiaStates.find(state => supplierLocation.includes(state));
    
    if (rfqState && supplierState) {
      if (rfqState === supplierState) {
        return 1.0; // Same state = perfect match
      }
      
      // Adjacent state map (simplified)
      const adjacentStates: Record<string, string[]> = {
        'maharashtra': ['gujarat', 'madhya pradesh', 'chhattisgarh', 'telangana', 'karnataka', 'goa'],
        'gujarat': ['maharashtra', 'madhya pradesh', 'rajasthan'],
        'karnataka': ['maharashtra', 'goa', 'telangana', 'andhra pradesh', 'tamil nadu', 'kerala'],
        'delhi': ['haryana', 'uttar pradesh'],
        'uttar pradesh': ['uttarakhand', 'haryana', 'delhi', 'rajasthan', 'madhya pradesh', 'bihar', 'jharkhand'],
        'tamil nadu': ['kerala', 'karnataka', 'andhra pradesh'],
        // Add more as needed
      };
      
      // Check if states are adjacent
      if (adjacentStates[rfqState]?.includes(supplierState) || 
          adjacentStates[supplierState]?.includes(rfqState)) {
        return 0.8; // Adjacent states
      }
      
      return 0.5; // Different, non-adjacent states
    }
    
    // Fall back to string similarity if state extraction failed
    if (rfqLocation === supplierLocation) {
      return 1.0; // Exact location match
    }
    
    if (rfqLocation.includes(supplierLocation) || supplierLocation.includes(rfqLocation)) {
      return 0.8; // Partial location match
    }
    
    // Check if any city/locality matches
    const rfqCities = rfqLocation.split(/[,\s]+/);
    const supplierCities = supplierLocation.split(/[,\s]+/);
    
    const commonCities = rfqCities.filter(city => 
      supplierCities.includes(city) && city.length > 3
    ).length;
    
    if (commonCities > 0) {
      return 0.7;
    }
    
    return 0.3; // Different locations
  }
  
  /**
   * Calculate price range compatibility score
   * @param rfq The RFQ
   * @param supplier The supplier
   * @returns Match score (0-1)
   */
  private calculatePriceRangeCompatibility(rfq: Rfq, supplier: Supplier): number {
    // Check for missing data
    if (!rfq.budget || !supplier.priceRange) {
      return 0.5; // Default score when data is missing
    }
    
    const budget = parseFloat(rfq.budget);
    
    // Parse supplier price range (format: "min-max" or "min+")
    let minPrice = 0;
    let maxPrice = Infinity;
    
    if (supplier.priceRange.includes('-')) {
      [minPrice, maxPrice] = supplier.priceRange.split('-').map(p => parseFloat(p));
    } else if (supplier.priceRange.includes('+')) {
      minPrice = parseFloat(supplier.priceRange);
    } else {
      // Assume single value is average price
      const avgPrice = parseFloat(supplier.priceRange);
      minPrice = avgPrice * 0.7;
      maxPrice = avgPrice * 1.3;
    }
    
    // If budget falls within the supplier's range, perfect match
    if (budget >= minPrice && budget <= maxPrice) {
      return 1.0;
    }
    
    // If budget is below minimum, check how far below
    if (budget < minPrice) {
      const ratio = budget / minPrice;
      if (ratio >= 0.8) {
        return 0.8; // Within 20% below minimum
      } else if (ratio >= 0.6) {
        return 0.6; // Within 40% below minimum
      } else {
        return 0.3; // Way below minimum
      }
    }
    
    // If budget is above maximum, check how far above
    if (budget > maxPrice && maxPrice < Infinity) {
      const ratio = maxPrice / budget;
      if (ratio >= 0.8) {
        return 0.7; // Within 20% above maximum
      } else if (ratio >= 0.6) {
        return 0.5; // Within 40% above maximum
      } else {
        return 0.3; // Way above maximum
      }
    }
    
    return 0.5; // Fallback
  }
  
  /**
   * Calculate performance score based on supplier metrics
   * @param supplier The supplier
   * @returns Performance score (0-1)
   */
  private calculatePerformanceScore(supplier: Supplier): number {
    // Check if risk score is available (lower is better)
    if (supplier.riskScore !== null && supplier.riskScore !== undefined) {
      const riskScore = supplier.riskScore;
      
      // Convert risk score (0-100 scale where lower is better)
      // to performance score (0-1 scale where higher is better)
      return Math.max(0, Math.min(1, 1 - (riskScore / 100)));
    }
    
    // Calculate based on performance metrics if available
    const deliveryRating = supplier.deliveryRating || 3;
    const qualityRating = supplier.qualityRating || 3;
    const communicationRating = supplier.communicationRating || 3;
    
    // Normalize ratings to 0-1 scale (assuming ratings are 1-5)
    const normalizedDelivery = (deliveryRating - 1) / 4;
    const normalizedQuality = (qualityRating - 1) / 4;
    const normalizedCommunication = (communicationRating - 1) / 4;
    
    // Weighted average of ratings
    return (normalizedDelivery * 0.4) + 
           (normalizedQuality * 0.4) + 
           (normalizedCommunication * 0.2);
  }
  
  /**
   * Calculate delivery time match score
   * @param rfq The RFQ
   * @param supplier The supplier
   * @returns Match score (0-1)
   */
  private calculateDeliveryTimeMatch(rfq: Rfq, supplier: Supplier): number {
    // Check for missing data
    if (!rfq.deliveryDeadline || !supplier.averageDeliveryTime) {
      return 0.5; // Default score when data is missing
    }
    
    // Convert delivery deadline to days
    let deadlineDays: number;
    
    if (typeof rfq.deliveryDeadline === 'number') {
      deadlineDays = rfq.deliveryDeadline;
    } else {
      // Try to parse deadline (assuming format is "X days" or a date)
      const deadlineMatch = rfq.deliveryDeadline.match(/(\d+)\s*days?/i);
      
      if (deadlineMatch) {
        deadlineDays = parseInt(deadlineMatch[1]);
      } else {
        try {
          // Assume it's a date string
          const deadlineDate = new Date(rfq.deliveryDeadline);
          const currentDate = new Date();
          
          const timeDiff = deadlineDate.getTime() - currentDate.getTime();
          deadlineDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        } catch (e) {
          return 0.5; // Can't parse deadline
        }
      }
    }
    
    // Parse supplier delivery time
    let supplierDays: number;
    
    if (typeof supplier.averageDeliveryTime === 'number') {
      supplierDays = supplier.averageDeliveryTime;
    } else {
      // Try to parse (assuming format is "X days")
      const deliveryMatch = supplier.averageDeliveryTime.match(/(\d+)\s*days?/i);
      
      if (deliveryMatch) {
        supplierDays = parseInt(deliveryMatch[1]);
      } else {
        return 0.5; // Can't parse delivery time
      }
    }
    
    // If supplier can deliver before deadline, perfect match
    if (supplierDays <= deadlineDays) {
      // Even better if not cutting it too close
      if (supplierDays <= deadlineDays * 0.8) {
        return 1.0; // Plenty of room
      }
      return 0.9; // Can meet deadline, but cutting it close
    }
    
    // How much does supplier exceed deadline?
    const ratio = deadlineDays / supplierDays;
    
    if (ratio >= 0.9) {
      return 0.8; // Just slightly over deadline
    } else if (ratio >= 0.7) {
      return 0.6; // Moderately over deadline
    } else if (ratio >= 0.5) {
      return 0.4; // Significantly over deadline
    } else {
      return 0.2; // Way over deadline
    }
  }
  
  /**
   * Calculate certification match score
   * @param rfq The RFQ
   * @param supplier The supplier
   * @returns Match score (0-1)
   */
  private calculateCertificationMatch(rfq: Rfq, supplier: Supplier): number {
    // Check if RFQ has required certifications
    if (!rfq.requiredCertifications || rfq.requiredCertifications.length === 0) {
      return 0.8; // No specific requirements, good match by default
    }
    
    // Check if supplier has certifications listed
    if (!supplier.certifications || supplier.certifications.length === 0) {
      return 0.3; // No certifications listed, poor match
    }
    
    // Parse certifications
    const requiredCerts = rfq.requiredCertifications.split(',').map(c => c.trim().toLowerCase());
    const supplierCerts = supplier.certifications.split(',').map(c => c.trim().toLowerCase());
    
    // Count matches
    const matches = requiredCerts.filter(cert => 
      supplierCerts.some(sCert => 
        sCert.includes(cert) || cert.includes(sCert)
      )
    ).length;
    
    // Calculate match ratio
    const matchRatio = matches / requiredCerts.length;
    
    // Scale score - 100% match gets 1.0, no matches gets 0.2
    return 0.2 + (matchRatio * 0.8);
  }
  
  /**
   * Calculate success rate score
   * @param supplier The supplier
   * @returns Success rate score (0-1)
   */
  private calculateSuccessRateScore(supplier: Supplier): number {
    // Success rate should be between 0-100
    const successRate = supplier.successRate !== null && supplier.successRate !== undefined
      ? supplier.successRate
      : 75; // Default to moderate success if not specified
      
    // Normalize to 0-1 scale
    return Math.max(0, Math.min(1, successRate / 100));
  }
  
  /**
   * Generate human-readable match reason
   * @param rfq The RFQ
   * @param supplier The supplier
   * @param score The match score
   * @returns Match reason string
   */
  private generateMatchReason(rfq: Rfq, supplier: Supplier, score: number): string {
    const reasons = [];
    
    // Category match
    if (rfq.category && supplier.categories) {
      const categoryMatch = this.calculateCategoryMatch(rfq, supplier);
      if (categoryMatch >= 0.8) {
        reasons.push("Strong category match");
      } else if (categoryMatch >= 0.5) {
        reasons.push("Partial category match");
      }
    }
    
    // Location
    if (rfq.location && supplier.location) {
      const locationMatch = this.calculateLocationProximity(rfq, supplier);
      if (locationMatch >= 0.8) {
        reasons.push("Location proximity");
      }
    }
    
    // Price range
    if (rfq.budget && supplier.priceRange) {
      const priceMatch = this.calculatePriceRangeCompatibility(rfq, supplier);
      if (priceMatch >= 0.8) {
        reasons.push("Budget compatibility");
      }
    }
    
    // Delivery time
    if (rfq.deliveryDeadline && supplier.averageDeliveryTime) {
      const deliveryMatch = this.calculateDeliveryTimeMatch(rfq, supplier);
      if (deliveryMatch >= 0.8) {
        reasons.push("Can meet delivery deadline");
      }
    }
    
    // Success rate
    if (supplier.successRate !== null && supplier.successRate !== undefined && supplier.successRate >= 80) {
      reasons.push(`${supplier.successRate}% success rate`);
    }
    
    // Performance
    const performanceScore = this.calculatePerformanceScore(supplier);
    if (performanceScore >= 0.8) {
      reasons.push("High performance rating");
    }
    
    // Certifications
    if (rfq.requiredCertifications && supplier.certifications) {
      const certMatch = this.calculateCertificationMatch(rfq, supplier);
      if (certMatch >= 0.8) {
        reasons.push("Has required certifications");
      }
    }
    
    // Risk score (if low)
    if (supplier.riskScore !== null && supplier.riskScore !== undefined && supplier.riskScore <= 30) {
      reasons.push("Low risk score");
    }
    
    // Generate final reason text
    if (reasons.length === 0) {
      if (score >= 0.7) {
        return "Good overall match based on multiple factors";
      } else if (score >= 0.5) {
        return "Moderate match, may need further evaluation";
      } else {
        return "Low compatibility match";
      }
    } else if (reasons.length === 1) {
      return reasons[0];
    } else if (reasons.length === 2) {
      return `${reasons[0]} and ${reasons[1]}`;
    } else {
      const lastReason = reasons.pop();
      return `${reasons.join(", ")}, and ${lastReason}`;
    }
  }
}

// Export singleton
const supplierMatchingService = new SupplierMatchingService();
export default supplierMatchingService;