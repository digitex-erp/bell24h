import { log } from "../vite";
import { Rfq, Supplier, Quote } from "@shared/schema";
import { storage } from "../storage";
import * as tf from '@tensorflow/tfjs';
import { RFQData } from './rfq-data';


/**
 * Bid Price Prediction Service
 * 
 * Uses historical data and market trends to predict optimal bid prices
 * for RFQs and detect anomalies in bid pricing.
 */
class BidPredictionService {
  // Feature weights for prediction model
  private weights = {
    marketTrend: 0.25,
    historicalPrices: 0.35,
    supplierReputation: 0.15,
    complexity: 0.15,
    urgency: 0.10,
  };

  private rfqSuccessPredictor: RFQSuccessPredictor;

  constructor() {
    log("Bid price prediction service initialized", "bid-prediction");
    this.rfqSuccessPredictor = new RFQSuccessPredictor();
  }

  /**
   * Predict optimal bid price range for an RFQ
   * @param rfq The RFQ to predict price for
   * @returns Predicted price range and explanation
   */
  public async predictBidPrice(rfq: Rfq): Promise<{
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
    confidence: number;
    explanation: string;
    factors: {
      marketTrend: number;
      historicalPrices: number;
      supplierReputation: number;
      complexity: number;
      urgency: number;
    };
  }> {
    try {
      log(`Predicting bid price for RFQ #${rfq.id}`, "bid-prediction");

      // Extract relevant features from RFQ
      const quantity = this.extractQuantity(rfq.quantity);
      const product = rfq.product;
      const category = rfq.category || "";

      // Calculate individual factors
      const marketTrendFactor = await this.calculateMarketTrendFactor(category);
      const historicalPricesFactor = await this.calculateHistoricalPricesFactor(product, quantity);
      const supplierReputationFactor = await this.calculateSupplierReputationFactor(rfq);
      const complexityFactor = this.calculateComplexityFactor(rfq);
      const urgencyFactor = this.calculateUrgencyFactor(rfq);

      // Aggregate factors with weights
      const factors = {
        marketTrend: marketTrendFactor,
        historicalPrices: historicalPricesFactor,
        supplierReputation: supplierReputationFactor,
        complexity: complexityFactor,
        urgency: urgencyFactor,
      };

      // Calculate base price from budget or historical data
      let basePrice = await this.calculateBasePrice(rfq, factors);

      // Calculate price modifiers
      const marketAdjustment = basePrice * this.weights.marketTrend * marketTrendFactor;
      const historyAdjustment = basePrice * this.weights.historicalPrices * historicalPricesFactor;
      const reputationAdjustment = basePrice * this.weights.supplierReputation * supplierReputationFactor;
      const complexityAdjustment = basePrice * this.weights.complexity * complexityFactor;
      const urgencyAdjustment = basePrice * this.weights.urgency * urgencyFactor;

      // Apply adjustments
      const adjustedPrice = basePrice + 
                           marketAdjustment + 
                           historyAdjustment + 
                           reputationAdjustment + 
                           complexityAdjustment + 
                           urgencyAdjustment;

      // Calculate price range (±15% of adjusted price)
      const minPrice = Math.round(adjustedPrice * 0.85);
      const maxPrice = Math.round(adjustedPrice * 1.15);
      const avgPrice = Math.round(adjustedPrice);

      // Calculate confidence score
      const confidence = this.calculateConfidenceScore(rfq, factors);

      // Generate explanation
      const explanation = this.generatePriceExplanation(
        rfq, 
        avgPrice, 
        factors, 
        [
          marketAdjustment, 
          historyAdjustment, 
          reputationAdjustment, 
          complexityAdjustment, 
          urgencyAdjustment
        ]
      );

      return {
        minPrice,
        maxPrice,
        avgPrice,
        confidence,
        explanation,
        factors
      };
    } catch (error) {
      log(`Error predicting bid price: ${error}`, "bid-prediction");
      throw new Error(`Failed to predict bid price: ${error.message}`);
    }
  }

  /**
   * Detect anomalies in a bid (quote) price
   * @param quote The quote to analyze
   * @param rfq The associated RFQ
   * @param supplier The supplier who submitted the quote
   * @returns Anomaly detection result
   */
  public async detectPriceAnomaly(
    quote: Quote,
    rfq: Rfq,
    supplier: Supplier
  ): Promise<{
    isAnomaly: boolean;
    anomalyScore: number;
    recommendedPrice: number;
    explanation: string;
  }> {
    try {
      log(`Detecting price anomalies for Quote #${quote.id}`, "bid-prediction");

      // Get price prediction for the RFQ
      const prediction = await this.predictBidPrice(rfq);

      // Extract quote price
      const quotePrice = parseFloat(quote.price);

      // Calculate deviation from predicted range
      const minPrice = prediction.minPrice;
      const maxPrice = prediction.maxPrice;

      // Quote is within predicted range
      if (quotePrice >= minPrice && quotePrice <= maxPrice) {
        return {
          isAnomaly: false,
          anomalyScore: 0,
          recommendedPrice: prediction.avgPrice,
          explanation: "Quote price is within the expected range."
        };
      }

      // Calculate how far outside the range the quote is
      let deviation: number;
      if (quotePrice < minPrice) {
        deviation = (minPrice - quotePrice) / minPrice;
      } else {
        deviation = (quotePrice - maxPrice) / maxPrice;
      }

      // Adjust anomaly score based on supplier reputation
      const reputationFactor = await this.calculateSupplierReputationScore(supplier);
      const anomalyScore = Math.min(1, deviation * (1 + (1 - reputationFactor)));

      // Determine if this is an anomaly (score > 0.3 is considered anomalous)
      const isAnomaly = anomalyScore > 0.3;

      // Generate explanation
      let explanation: string;

      if (quotePrice < minPrice) {
        if (isAnomaly) {
          explanation = `The quote price is ${Math.round(deviation * 100)}% below the expected minimum price, which could indicate underbidding or missing requirements.`;
        } else {
          explanation = "The quote price is slightly below the expected range but may still be reasonable.";
        }
      } else {
        if (isAnomaly) {
          explanation = `The quote price is ${Math.round(deviation * 100)}% above the expected maximum price, which may indicate overfitting or unaccounted costs.`;
        } else {
          explanation = "The quote price is slightly above the expected range but may still be reasonable.";
        }
      }

      return {
        isAnomaly,
        anomalyScore,
        recommendedPrice: prediction.avgPrice,
        explanation
      };
    } catch (error) {
      log(`Error detecting price anomaly: ${error}`, "bid-prediction");
      return {
        isAnomaly: false,
        anomalyScore: 0,
        recommendedPrice: 0,
        explanation: "Unable to determine if the quote price is anomalous due to insufficient data."
      };
    }
  }

  /**
   * Extract numeric quantity from quantity string
   * @param quantityStr Quantity string
   * @returns Numeric quantity
   */
  private extractQuantity(quantityStr: string): number {
    if (!quantityStr) return 1;

    // Extract numeric part
    const match = quantityStr.match(/\d+/);
    if (match) {
      return parseInt(match[0]);
    }

    return 1;
  }

  /**
   * Calculate base price from historical data or budget
   * @param rfq The RFQ
   * @param factors Prediction factors
   * @returns Base price
   */
  private async calculateBasePrice(rfq: Rfq, factors: any): Promise<number> {
    // If budget is specified, use it as a starting point
    if (rfq.budget && !isNaN(parseFloat(rfq.budget))) {
      return parseFloat(rfq.budget);
    }

    // Otherwise, estimate from historical data
    const product = rfq.product;
    const quantity = this.extractQuantity(rfq.quantity);

    // Get historical quotes for similar products
    const allRfqs = await storage.getRfqs();
    const similarRfqs = allRfqs.filter(r => 
      r.product.toLowerCase().includes(product.toLowerCase()) ||
      product.toLowerCase().includes(r.product.toLowerCase())
    );

    if (similarRfqs.length === 0) {
      // Default estimation if no historical data
      return 10000 * factors.complexity;
    }

    // Get quotes for similar RFQs
    const quotesPromises = similarRfqs.map(r => storage.getQuotesByRfqId(r.id));
    const quotesArrays = await Promise.all(quotesPromises);
    const allQuotes = quotesArrays.flat();

    if (allQuotes.length === 0) {
      return 10000 * factors.complexity;
    }

    // Calculate average price per unit
    const prices = allQuotes.map(q => parseFloat(q.price));
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    // Scale by quantity with volume discount
    const volumeDiscountFactor = Math.pow(quantity, 0.9) / quantity; // Apply slight economy of scale
    return avgPrice * quantity * volumeDiscountFactor;
  }

  /**
   * Calculate market trend factor
   * @param category Product category
   * @returns Market trend factor
   */
  private async calculateMarketTrendFactor(category: string): Promise<number> {
    try {
      // Get market trends for the category
      const trendData = await storage.getMarketTrends(category);

      if (!trendData) {
        return 0; // Neutral impact if no trend data available
      }

      // Extract trend direction and magnitude from insights
      const insights = trendData.insights || "";

      if (insights.toLowerCase().includes("rising") || insights.toLowerCase().includes("increase")) {
        return 0.1; // Upward trend, increase price
      } else if (insights.toLowerCase().includes("falling") || insights.toLowerCase().includes("decrease")) {
        return -0.1; // Downward trend, decrease price
      } else if (insights.toLowerCase().includes("volatile")) {
        return 0.05; // Volatile market, slight increase for risk
      } else if (insights.toLowerCase().includes("stable")) {
        return 0; // Stable market, no adjustment
      }

      return 0; // Default neutral factor
    } catch (error) {
      return 0; // Default neutral factor
    }
  }

  /**
   * Calculate historical prices factor
   * @param product Product name/description
   * @param quantity Quantity
   * @returns Historical prices factor
   */
  private async calculateHistoricalPricesFactor(product: string, quantity: number): Promise<number> {
    try {
      // Get all RFQs
      const allRfqs = await storage.getRfqs();

      // Filter for similar products
      const similarRfqs = allRfqs.filter(rfq => 
        rfq.product.toLowerCase().includes(product.toLowerCase()) ||
        product.toLowerCase().includes(rfq.product.toLowerCase())
      );

      if (similarRfqs.length === 0) {
        return 0; // Neutral if no similar RFQs
      }

      // Get quotes for each similar RFQ
      const quotesPromises = similarRfqs.map(rfq => storage.getQuotesByRfqId(rfq.id));
      const quotesArrays = await Promise.all(quotesPromises);

      // Flatten quotes and filter out null/undefined
      const allQuotes = quotesArrays.flat().filter(Boolean);

      if (allQuotes.length === 0) {
        return 0; // Neutral if no quotes
      }

      // Calculate price trends over time
      allQuotes.sort((a, b) => 
        new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      );

      // Split quotes into two time periods
      const halfwayPoint = Math.floor(allQuotes.length / 2);
      const olderQuotes = allQuotes.slice(0, halfwayPoint);
      const newerQuotes = allQuotes.slice(halfwayPoint);

      if (olderQuotes.length === 0 || newerQuotes.length === 0) {
        return 0; // Not enough data for trend analysis
      }

      // Calculate average prices for each period
      const avgOlderPrice = olderQuotes.reduce((sum, q) => sum + parseFloat(q.price), 0) / olderQuotes.length;
      const avgNewerPrice = newerQuotes.reduce((sum, q) => sum + parseFloat(q.price), 0) / newerQuotes.length;

      // Calculate price trend
      const priceTrend = (avgNewerPrice - avgOlderPrice) / avgOlderPrice;

      // Normalize trend to a factor between -0.2 and 0.2
      return Math.max(-0.2, Math.min(0.2, priceTrend));
    } catch (error) {
      return 0; // Default neutral factor
    }
  }

  /**
   * Calculate supplier reputation factor
   * @param rfq The RFQ
   * @returns Supplier reputation factor
   */
  private async calculateSupplierReputationFactor(rfq: Rfq): Promise<number> {
    try {
      // Get recommendations for this RFQ
      const recommendations = await storage.getSupplierRecommendations(rfq.id);

      if (recommendations.length === 0) {
        return 0; // Neutral if no recommendations
      }

      // Calculate average match score
      const avgMatchScore = recommendations.reduce((sum, rec) => sum + rec.matchScore, 0) / recommendations.length;

      // Transform to a factor between -0.15 and 0.15
      // Higher match scores lead to lower prices (better suppliers can charge less)
      return (avgMatchScore - 0.5) * -0.3;
    } catch (error) {
      return 0; // Default neutral factor
    }
  }

  /**
   * Calculate complexity factor
   * @param rfq The RFQ
   * @returns Complexity factor
   */
  private calculateComplexityFactor(rfq: Rfq): number {
    try {
      // Calculate complexity based on description length and specific keywords
      const description = rfq.description || "";

      // Baseline complexity
      let complexity = 0;

      // Add complexity based on description length
      if (description.length > 500) {
        complexity += 0.1;
      } else if (description.length > 200) {
        complexity += 0.05;
      }

      // Add complexity based on specific keywords
      const complexityKeywords = [
        "custom", "specialized", "proprietary", "high-precision", 
        "certified", "compliance", "regulatory", "high-quality", 
        "expedited", "rush", "emergency", "safety", "critical"
      ];

      const lowercaseDesc = description.toLowerCase();

      for (const keyword of complexityKeywords) {
        if (lowercaseDesc.includes(keyword)) {
          complexity += 0.02;
        }
      }

      // Cap complexity factor
      return Math.min(0.3, complexity);
    } catch (error) {
      return 0; // Default neutral factor
    }
  }

  /**
   * Calculate urgency factor
   * @param rfq The RFQ
   * @returns Urgency factor
   */
  private calculateUrgencyFactor(rfq: Rfq): number {
    try {
      // No due date means no urgency
      if (!rfq.dueDate) {
        return 0;
      }

      // Calculate days until due date
      const dueDate = new Date(rfq.dueDate);
      const currentDate = new Date();
      const daysDifference = Math.ceil((dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

      // Urgency increases as deadline approaches
      if (daysDifference < 0) {
        return 0; // Past due, no urgency factor
      } else if (daysDifference < 3) {
        return 0.2; // Very urgent (< 3 days)
      } else if (daysDifference < 7) {
        return 0.15; // Urgent (< 1 week)
      } else if (daysDifference < 14) {
        return 0.1; // Somewhat urgent (< 2 weeks)
      } else if (daysDifference < 30) {
        return 0.05; // Slightly urgent (< 1 month)
      } else {
        return 0; // Not urgent
      }
    } catch (error) {
      return 0; // Default neutral factor
    }
  }

  /**
   * Calculate confidence score for prediction
   * @param rfq The RFQ
   * @param factors Prediction factors
   * @returns Confidence score (0-1)
   */
  private calculateConfidenceScore(rfq: Rfq, factors: any): number {
    try {
      let confidence = 0.5; // Base confidence

      // More confidence if we have clear market trends
      if (factors.marketTrend !== 0) {
        confidence += 0.1;
      }

      // More confidence if we have historical price data
      if (factors.historicalPrices !== 0) {
        confidence += 0.2;
      }

      // More confidence if budget is specified
      if (rfq.budget) {
        confidence += 0.1;
      }

      // Less confidence for very complex RFQs
      if (factors.complexity > 0.2) {
        confidence -= 0.1;
      }

      // Normalize confidence to 0-1 range
      return Math.max(0, Math.min(1, confidence));
    } catch (error) {
      return 0.4; // Default moderate confidence
    }
  }

  /**
   * Calculate supplier reputation score
   * @param supplier The supplier
   * @returns Reputation score (0-1)
   */
  private async calculateSupplierReputationScore(supplier: Supplier): Promise<number> {
    try {
      // Use risk score (inversed, since lower risk means higher reputation)
      if (supplier.riskScore !== null && supplier.riskScore !== undefined) {
        return 1 - (supplier.riskScore / 100);
      }

      // Use success rate if available
      if (supplier.successRate !== null && supplier.successRate !== undefined) {
        return supplier.successRate / 100;
      }

      // Default moderate reputation
      return 0.5;
    } catch (error) {
      return 0.5; // Default moderate reputation
    }
  }

  /**
   * Generate human-readable price explanation
   * @param rfq The RFQ
   * @param predictedPrice Predicted price
   * @param factors Prediction factors
   * @param adjustments Price adjustments
   * @returns Explanation string
   */
  private generatePriceExplanation(
    rfq: Rfq, 
    predictedPrice: number, 
    factors: any,
    adjustments: number[]
  ): string {
    try {
      // Create base explanation
      let explanation = `The predicted bid price for ${rfq.product} (${rfq.quantity}) is ₹${predictedPrice.toLocaleString()}. `;

      // Add factor-specific explanations
      const factorExplanations = [];

      // Market trend explanation
      if (Math.abs(factors.marketTrend) > 0.01) {
        const direction = factors.marketTrend > 0 ? "upward" : "downward";
        factorExplanations.push(`Market trends show a ${direction} price movement (₹${Math.abs(Math.round(adjustments[0])).toLocaleString()} impact)`);
      }

      // Historical prices explanation
      if (Math.abs(factors.historicalPrices) > 0.01) {
        const direction = factors.historicalPrices > 0 ? "increasing" : "decreasing";
        factorExplanations.push(`Historical prices are ${direction} (₹${Math.abs(Math.round(adjustments[1])).toLocaleString()} impact)`);
      }

      // Supplier reputation explanation
      if (Math.abs(factors.supplierReputation) > 0.01) {
        const quality = factors.supplierReputation < 0 ? "high" : "variable";
        factorExplanations.push(`Supplier reputation is ${quality} (₹${Math.abs(Math.round(adjustments[2])).toLocaleString()} impact)`);
      }

      // Complexity explanation
      if (factors.complexity > 0.01) {
        factorExplanations.push(`Request complexity adds ₹${Math.round(adjustments[3]).toLocaleString()}`);
      }

      // Urgency explanation
      if (factors.urgency > 0.01) {
        factorExplanations.push(`Delivery urgency adds ₹${Math.round(adjustments[4]).toLocaleString()}`);
      }

      // Combine explanations
      if (factorExplanations.length > 0) {
        explanation += "This considers: " + factorExplanations.join(", ") + ".";
      }

      return explanation;
    } catch (error) {
      return `The predicted bid price for this RFQ is ₹${predictedPrice.toLocaleString()}.`;
    }
  }
}

// Export singleton
const bidPredictionService = new BidPredictionService();
export default bidPredictionService;


// Added RFQSuccessPredictor class
class RFQSuccessPredictor {
  private model: tf.LayersModel;
  private successRateCache: Map<string, number>;

  constructor() {
    this.model = this.buildModel();
    this.successRateCache = new Map();
  }

  public async predictRFQSuccessRate(rfq: RFQData): Promise<{
    successRate: number;
    factors: string[];
    confidence: number;
  }> {
    const cacheKey = `rfq-${rfq.id}`;
    if (this.successRateCache.has(cacheKey)) {
      return {
        successRate: this.successRateCache.get(cacheKey)!,
        factors: ['Cached prediction'],
        confidence: 0.9
      };
    }

    const features = this.extractRFQFeatures(rfq);
    const prediction = await this.model.predict(features) as tf.Tensor;
    const successRate = (await prediction.data())[0];

    const factors = this.analyzeSuccessFactors(rfq);
    const confidence = this.calculateConfidence(rfq);

    this.successRateCache.set(cacheKey, successRate);

    return {
      successRate,
      factors,
      confidence
    };
  }

  private extractRFQFeatures(rfq: RFQData): tf.Tensor {
    return tf.tensor2d([
      [
        rfq.estimatedValue || 0,
        rfq.complexity || 0,
        rfq.urgency || 0,
        rfq.categories.length,
        this.calculateMarketDemand(rfq),
        this.calculateSeasonalFactor(rfq)
      ]
    ]);
  }

  private calculateConfidence(rfq: RFQData): number {
    return 0.7 + (rfq.categories.length * 0.05);
  }

  private analyzeSuccessFactors(rfq: RFQData): string[] {
    const factors = [];
    if (rfq.estimatedValue > 100000) factors.push('High value RFQ');
    if (rfq.urgency > 0.7) factors.push('High urgency');
    if (rfq.categories.length > 2) factors.push('Multi-category RFQ');
    return factors;
  }

  private calculateMarketDemand(rfq: RFQData): number {
    return 0.6; // Default market demand score
  }

  private calculateSeasonalFactor(rfq: RFQData): number {
    const month = new Date().getMonth();
    return 0.5 + (Math.sin(month / 12 * Math.PI) * 0.2);
  }

  private buildModel(): tf.LayersModel {
    // Placeholder - needs actual model building logic.  This is a simple example
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [6] }));
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
    model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy' });
    return model;
  }
}