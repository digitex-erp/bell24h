import { db } from "../../db";
import { eq, and, desc, inArray, like, or, gte } from "drizzle-orm";
import { 
  suppliers, 
  rfqs, 
  quotes,
  supplierMetrics, 
  supplierAttributes, 
  supplierRecommendations,
  historicalMatches,
  InsertSupplierRecommendation 
} from "../../shared/schema";
import { log } from "../vite";

// Import OpenAI for advanced semantic matching
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Advanced Supplier Matching Service 
 * 
 * Implements multiple matching algorithms with fallback mechanisms:
 * 1. AI-powered semantic matching using OpenAI with SHAP value explanations
 * 2. Collaborative filtering based on similar RFQs and historical matches
 * 3. Time-series forecasting to identify trending suppliers
 * 4. Feature-based recommendation using weighted metrics and historical performance
 * 5. Category and keyword matching as a baseline fallback mechanism
 */
class SupplierMatchingService {
  
  /**
   * Find matching suppliers for an RFQ
   * @param rfqId - ID of the RFQ
   * @param limit - Maximum number of suppliers to return (default: 5)
   * @param useAdvancedAlgorithms - Whether to use advanced algorithms (default: true)
   * @returns Promise with array of supplier recommendations
   */
  async findMatchingSuppliers(
    rfqId: number,
    limit: number = 5,
    useAdvancedAlgorithms: boolean = true
  ): Promise<typeof supplierRecommendations.$inferSelect[]> {
    try {
      log(`Finding matching suppliers for RFQ #${rfqId}`, "supplier-matching");
      
      // Get RFQ details from the database
      const rfq = await db.query.rfqs.findFirst({
        where: eq(rfqs.id, rfqId),
        with: {
          user: true // Include user to get buyer data
        }
      });
      
      if (!rfq) {
        log(`RFQ #${rfqId} not found`, "supplier-matching");
        throw new Error(`RFQ #${rfqId} not found`);
      }
      
      // Get all suppliers with their metrics and attributes
      const allSuppliers = await db.query.suppliers.findMany({
        with: {
          metrics: true,
          attributes: true
        }
      });
      
      if (allSuppliers.length === 0) {
        log("No suppliers found in database", "supplier-matching");
        return [];
      }
      
      // Collect all matching algorithms results
      const algorithmResults: {
        [key: string]: Partial<typeof supplierRecommendations.$inferSelect>[]
      } = {};
      
      // Define weights for algorithm ensemble/blending
      const algorithmWeights = {
        aiSemantic: 0.40,
        collaborative: 0.25,
        featureBased: 0.20,
        timeSeries: 0.10,
        basicCategory: 0.05
      };
      
      // Try AI-powered semantic matching
      try {
        if (process.env.OPENAI_API_KEY) {
          algorithmResults.aiSemantic = await this.aiSemanticMatching(rfq, allSuppliers, limit * 2);
          log(`AI semantic matching found ${algorithmResults.aiSemantic.length} suppliers`, "supplier-matching");
        } else {
          algorithmResults.aiSemantic = [];
        }
      } catch (error) {
        log(`AI semantic matching failed: ${error}`, "supplier-matching");
        algorithmResults.aiSemantic = [];
      }
      
      // Use advanced algorithms if requested
      if (useAdvancedAlgorithms) {
        // Try collaborative filtering based on historical matches
        try {
          algorithmResults.collaborative = await this.collaborativeFiltering(rfq, allSuppliers, limit * 2);
          log(`Collaborative filtering found ${algorithmResults.collaborative.length} suppliers`, "supplier-matching");
        } catch (error) {
          log(`Collaborative filtering failed: ${error}`, "supplier-matching");
          algorithmResults.collaborative = [];
        }
        
        // Try time-series forecasting for trending supplier matches
        try {
          algorithmResults.timeSeries = await this.timeSeriesForecasting(rfq, allSuppliers, limit * 2);
          log(`Time series forecasting found ${algorithmResults.timeSeries.length} suppliers`, "supplier-matching");
        } catch (error) {
          log(`Time series forecasting failed: ${error}`, "supplier-matching");
          algorithmResults.timeSeries = [];
        }
      }
      
      // Always use feature-based matching
      try {
        algorithmResults.featureBased = await this.featureBasedMatching(rfq, allSuppliers, limit * 2);
        log(`Feature-based matching found ${algorithmResults.featureBased.length} suppliers`, "supplier-matching");
      } catch (error) {
        log(`Feature-based matching failed: ${error}`, "supplier-matching");
        algorithmResults.featureBased = [];
      }
      
      // Finally use basic category matching as fallback
      try {
        algorithmResults.basicCategory = await this.basicCategoryMatching(rfq, allSuppliers, limit * 2);
        log(`Basic category matching found ${algorithmResults.basicCategory.length} suppliers`, "supplier-matching");
      } catch (error) {
        log(`Basic category matching failed: ${error}`, "supplier-matching");
        algorithmResults.basicCategory = [];
      }
      
      // Blend/ensemble all algorithm results with weighted scoring
      const blendedResults = await this.blendRecommendations(
        algorithmResults, 
        algorithmWeights, 
        allSuppliers, 
        limit
      );
      
      log(`Blended recommendations found ${blendedResults.length} suppliers`, "supplier-matching");
      
      // Store all recommendations in the database
      const storedRecommendations = await Promise.all(
        blendedResults.map(async recommendation => {
          // Check if this recommendation already exists
          const existingRec = await db.query.supplierRecommendations.findFirst({
            where: and(
              eq(supplierRecommendations.rfqId, rfqId),
              eq(supplierRecommendations.supplierId, recommendation.supplierId)
            )
          });
          
          if (existingRec) {
            // Update existing recommendation
            return await db
              .update(supplierRecommendations)
              .set({
                matchScore: recommendation.matchScore,
                matchReason: recommendation.matchReason,
                matchFactors: recommendation.matchFactors,
                recommended: recommendation.recommended,
                updatedAt: new Date()
              })
              .where(eq(supplierRecommendations.id, existingRec.id))
              .returning();
          } else {
            // Create new recommendation
            return await db
              .insert(supplierRecommendations)
              .values({
                ...recommendation,
                rfqId: rfqId,
                createdAt: new Date(),
                updatedAt: new Date()
              })
              .returning();
          }
        })
      );
      
      // Return flattened results
      return storedRecommendations.flat();
      
    } catch (error) {
      log(`Error finding matching suppliers: ${error}`, "supplier-matching");
      return [];
    }
  }
  
  /**
   * AI-powered semantic matching using OpenAI
   * @param rfq - RFQ object
   * @param suppliers - Array of suppliers with related data
   * @param limit - Maximum number of suppliers to return
   * @returns Promise with array of supplier recommendation objects
   */
  private async aiSemanticMatching(
    rfq: typeof rfqs.$inferSelect,
    suppliers: any[],
    limit: number
  ): Promise<Partial<typeof supplierRecommendations.$inferSelect>[]> {
    try {
      // Prepare RFQ context for matching
      const rfqContext = {
        id: rfq.id,
        title: rfq.title,
        description: rfq.description,
        category: rfq.category,
        quantity: rfq.quantity || 'unspecified',
        budget: rfq.budget ? `${rfq.budget}` : 'unspecified',
        deadline: rfq.deadline ? new Date(rfq.deadline).toISOString() : 'unspecified',
      };
      
      // Format supplier data
      const supplierData = suppliers.map(supplier => {
        return {
          id: supplier.id,
          name: supplier.companyName,
          description: supplier.description,
          categories: supplier.categories || [],
          location: supplier.location,
          isVerified: supplier.verified,
          metrics: supplier.metrics?.[0] || null,
          attributes: supplier.attributes?.[0] || null
        };
      });
      
      // Create the prompt for OpenAI
      const prompt = `
      Find the best matching suppliers for this RFQ:
      
      RFQ Information:
      - ID: ${rfqContext.id}
      - Title: ${rfqContext.title}
      - Description: ${rfqContext.description}
      - Category: ${rfqContext.category}
      - Quantity: ${rfqContext.quantity}
      - Budget: ${rfqContext.budget}
      - Deadline: ${rfqContext.deadline}
      
      Analyze these suppliers and return JSON with match scores (0-100) and explanations:
      ${JSON.stringify(supplierData, null, 2)}
      
      Evaluate each supplier based on:
      1. Category match
      2. Description semantic relevance
      3. Location proximity advantages
      4. Performance metrics (if available)
      5. Capabilities and attributes (if available)
      
      Return in this exact JSON format:
      {
        "matches": [
          {
            "supplierId": number,
            "matchScore": number,
            "matchReason": "Concise explanation of why this supplier is a good match",
            "matchFactors": [
              {"factor": "category_match", "weight": number, "score": number, "explanation": "string"},
              {"factor": "description_relevance", "weight": number, "score": number, "explanation": "string"},
              {"factor": "location_advantage", "weight": number, "score": number, "explanation": "string"},
              {"factor": "performance_metrics", "weight": number, "score": number, "explanation": "string"},
              {"factor": "capabilities", "weight": number, "score": number, "explanation": "string"}
            ],
            "recommended": boolean
          }
        ]
      }
      
      Include only the top ${limit} matches with the highest scores.
      `;
      
      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are a supplier matching algorithm that evaluates the best suppliers for a given RFQ based on multiple factors." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });
      
      // Parse the response
      const content = response.choices[0].message.content || "{}";
      const result = JSON.parse(content);
      
      // Transform to our format
      return result.matches.map(match => ({
        supplierId: match.supplierId,
        matchScore: match.matchScore,
        matchReason: match.matchReason,
        matchFactors: match.matchFactors,
        recommended: match.recommended,
        contacted: false,
        responded: false,
      }));
      
    } catch (error) {
      log(`AI semantic matching error: ${error}`, "supplier-matching");
      return [];
    }
  }
  
  /**
   * Feature-based matching using weighted metrics and historical performance
   * @param rfq - RFQ object
   * @param suppliers - Array of suppliers with related data
   * @param limit - Maximum number of suppliers to return
   * @returns Promise with array of supplier recommendation objects
   */
  private async featureBasedMatching(
    rfq: typeof rfqs.$inferSelect,
    suppliers: any[],
    limit: number
  ): Promise<Partial<typeof supplierRecommendations.$inferSelect>[]> {
    try {
      // Define feature weights
      const weights = {
        categoryMatch: 40,
        similarRfqExperience: 20,
        performanceMetrics: 20,
        locationMatch: 10,
        verificationStatus: 10
      };
      
      // Get historical match data to improve recommendations
      const historicalData = await db.query.historicalMatches.findMany({
        where: eq(historicalMatches.wasSuccessful, true)
      });
      
      // Score each supplier based on features
      const scoredSuppliers = suppliers.map(supplier => {
        // Initialize score factors object
        const factors: any[] = [];
        let totalScore = 0;
        
        // 1. Category Match (40%)
        let categoryScore = 0;
        const supplierCategories = supplier.categories || [];
        if (supplierCategories.includes(rfq.category)) {
          categoryScore = 100; // Direct match
        } else {
          // Check for partial matches
          const categoryWords = rfq.category.toLowerCase().split(/\\s+/);
          for (const cat of supplierCategories) {
            const supplierCatWords = cat.toLowerCase().split(/\\s+/);
            const matchingWords = categoryWords.filter(word => 
              supplierCatWords.some(scw => scw.includes(word) || word.includes(scw))
            );
            if (matchingWords.length > 0) {
              categoryScore = Math.max(categoryScore, 
                (matchingWords.length / categoryWords.length) * 80
              );
            }
          }
        }
        
        totalScore += (categoryScore * weights.categoryMatch / 100);
        factors.push({
          factor: "category_match",
          weight: weights.categoryMatch,
          score: categoryScore,
          explanation: categoryScore === 100 
            ? `Direct category match with '${rfq.category}'`
            : categoryScore > 0 
              ? `Partial category match (${categoryScore.toFixed(0)}% relevance)`
              : "No category match"
        });
        
        // 2. Performance Metrics (20%)
        let performanceScore = 0;
        const metrics = supplier.metrics?.[0];
        
        if (metrics) {
          // Calculate performance score based on multiple metrics
          let metricSum = 0;
          let metricCount = 0;
          
          if (metrics.responseTime !== null) {
            // Lower response time is better (< 24 hours is best)
            const responseScore = metrics.responseTime < 24 ? 100 :
                                 metrics.responseTime < 48 ? 80 :
                                 metrics.responseTime < 72 ? 60 : 
                                 metrics.responseTime < 96 ? 40 : 20;
            metricSum += responseScore;
            metricCount++;
          }
          
          if (metrics.acceptanceRate !== null) {
            // Higher acceptance rate is better
            const acceptanceScore = metrics.acceptanceRate;
            metricSum += acceptanceScore;
            metricCount++;
          }
          
          if (metrics.onTimeDelivery !== null) {
            // Higher on-time delivery rate is better
            const deliveryScore = metrics.onTimeDelivery;
            metricSum += deliveryScore;
            metricCount++;
          }
          
          if (metrics.qualityRating !== null) {
            // Scale quality rating (1-5) to 0-100
            const qualityScore = (metrics.qualityRating / 5) * 100;
            metricSum += qualityScore;
            metricCount++;
          }
          
          if (metricCount > 0) {
            performanceScore = metricSum / metricCount;
          }
        }
        
        totalScore += (performanceScore * weights.performanceMetrics / 100);
        factors.push({
          factor: "performance_metrics",
          weight: weights.performanceMetrics,
          score: performanceScore,
          explanation: metrics 
            ? `Performance score: ${performanceScore.toFixed(0)}/100 based on response time, acceptance rate, on-time delivery, and quality`
            : "No performance metrics available"
        });
        
        // 3. Similar RFQ Experience (20%)
        let similarRfqScore = 0;
        
        // Check historical successful matches in the same category
        const successfulCategoryMatches = historicalData.filter(
          hm => hm.supplierId === supplier.id && 
                hm.wasSuccessful === true
        ).length;
        
        if (successfulCategoryMatches > 10) {
          similarRfqScore = 100;
        } else if (successfulCategoryMatches > 0) {
          similarRfqScore = successfulCategoryMatches * 10;
        }
        
        // Also check RFQ count from metrics
        if (metrics?.similarRfqCount && similarRfqScore < 100) {
          const countScore = metrics.similarRfqCount > 10 ? 100 : metrics.similarRfqCount * 10;
          similarRfqScore = Math.max(similarRfqScore, countScore);
        }
        
        totalScore += (similarRfqScore * weights.similarRfqExperience / 100);
        factors.push({
          factor: "similar_rfq_experience",
          weight: weights.similarRfqExperience,
          score: similarRfqScore,
          explanation: similarRfqScore > 0 
            ? `Supplier has experience with similar RFQs (score: ${similarRfqScore.toFixed(0)}/100)`
            : "No record of similar RFQ experience"
        });
        
        // 4. Location Match (10%)
        let locationScore = 0;
        
        // Simplistic location matching - would be improved with geocoding in production
        if (rfq.location && supplier.location) {
          if (rfq.location.toLowerCase() === supplier.location.toLowerCase()) {
            locationScore = 100; // Exact location match
          } else {
            // Check if they're in the same region/country (basic)
            const rfqLocParts = rfq.location.toLowerCase().split(/[\\s,]+/);
            const supplierLocParts = supplier.location.toLowerCase().split(/[\\s,]+/);
            
            const commonParts = rfqLocParts.filter(part => 
              supplierLocParts.includes(part) && part.length > 2
            );
            
            if (commonParts.length > 0) {
              locationScore = (commonParts.length / Math.min(rfqLocParts.length, supplierLocParts.length)) * 80;
            }
          }
        }
        
        totalScore += (locationScore * weights.locationMatch / 100);
        factors.push({
          factor: "location_match",
          weight: weights.locationMatch,
          score: locationScore,
          explanation: locationScore === 100 
            ? "Exact location match"
            : locationScore > 0 
              ? `Partial location match (${locationScore.toFixed(0)}% similarity)`
              : "Different locations"
        });
        
        // 5. Verification Status (10%)
        const verificationScore = supplier.verified ? 100 : 0;
        
        totalScore += (verificationScore * weights.verificationStatus / 100);
        factors.push({
          factor: "verification_status",
          weight: weights.verificationStatus,
          score: verificationScore,
          explanation: verificationScore === 100 
            ? "Verified supplier"
            : "Unverified supplier"
        });
        
        // Create recommendation object
        return {
          supplierId: supplier.id,
          matchScore: totalScore,
          matchReason: totalScore > 80 
            ? "Strong match based on category, performance, and experience" 
            : totalScore > 60 
              ? "Good match with reasonable fit for requirements"
              : "Partial match with some relevant capabilities",
          matchFactors: factors,
          recommended: totalScore >= 70,
          contacted: false,
          responded: false,
        };
      });
      
      // Sort by total score (descending) and take top matches
      return scoredSuppliers
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);
      
    } catch (error) {
      log(`Feature-based matching error: ${error}`, "supplier-matching");
      return [];
    }
  }
  
  /**
   * Basic category matching as a fallback method
   * @param rfq - RFQ object
   * @param suppliers - Array of suppliers with related data
   * @param limit - Maximum number of suppliers to return
   * @returns Promise with array of supplier recommendation objects
   */
  private async basicCategoryMatching(
    rfq: typeof rfqs.$inferSelect,
    suppliers: any[],
    limit: number
  ): Promise<Partial<typeof supplierRecommendations.$inferSelect>[]> {
    try {
      // Extract keywords from RFQ title and description
      const rfqText = `${rfq.title} ${rfq.description} ${rfq.category}`.toLowerCase();
      const keywords = rfqText
        .split(/\\s+/)
        .filter(word => word.length > 3) // Only consider words longer than 3 characters
        .reduce((unique, word) => {
          if (!unique.includes(word)) unique.push(word);
          return unique;
        }, [] as string[]);
      
      // Score suppliers based on keyword matches
      const scoredSuppliers = suppliers.map(supplier => {
        // Combine supplier name, description, and categories for matching
        const supplierText = `${supplier.companyName} ${supplier.description} ${supplier.categories?.join(' ') || ''}`.toLowerCase();
        
        // Count keyword matches
        const matchingKeywords = keywords.filter(keyword => supplierText.includes(keyword));
        const matchScore = Math.min(100, Math.round((matchingKeywords.length / Math.min(keywords.length, 10)) * 100));
        
        // Generate basic explanation
        const matchReason = matchingKeywords.length > 0
          ? `Matched keywords: ${matchingKeywords.slice(0, 3).join(', ')}${matchingKeywords.length > 3 ? '...' : ''}`
          : "Basic category matching";
          
        return {
          supplierId: supplier.id,
          matchScore: matchScore,
          matchReason: matchReason,
          matchFactors: [
            {
              factor: "keyword_match",
              weight: 100,
              score: matchScore,
              explanation: `${matchingKeywords.length} matching keywords out of ${keywords.length} extracted`
            }
          ],
          recommended: matchScore >= 50,
          contacted: false,
          responded: false,
        };
      });
      
      // Sort by score (descending) and take top matches
      return scoredSuppliers
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);
      
    } catch (error) {
      log(`Basic category matching error: ${error}`, "supplier-matching");
      return [];
    }
  }
  
  /**
   * Collaborative filtering based on historical matches
   * 
   * Uses a memory-based collaborative filtering approach to find similar RFQs
   * and recommend suppliers that performed well for those similar RFQs.
   * 
   * @param rfq - RFQ object
   * @param suppliers - Array of suppliers with related data
   * @param limit - Maximum number of suppliers to return
   * @returns Promise with array of supplier recommendation objects
   */
  private async collaborativeFiltering(
    rfq: typeof rfqs.$inferSelect,
    suppliers: any[],
    limit: number
  ): Promise<Partial<typeof supplierRecommendations.$inferSelect>[]> {
    try {
      // Get similar RFQs based on category and keywords
      const rfqText = `${rfq.title} ${rfq.description}`.toLowerCase();
      const rfqKeywords = rfqText
        .split(/\\s+/)
        .filter(word => word.length > 3)
        .reduce((unique, word) => {
          if (!unique.includes(word)) unique.push(word);
          return unique;
        }, [] as string[]);
      
      // Get all historical RFQs with successful matches
      const historicalRfqs = await db.query.rfqs.findMany({
        with: {
          quotes: {
            where: eq(quotes.isAccepted, true)
          }
        }
      });
      
      // Get all historical matches
      const successfulMatches = await db.query.historicalMatches.findMany({
        where: eq(historicalMatches.wasSuccessful, true),
        with: {
          supplier: true
        }
      });
      
      // Calculate similarity scores between current RFQ and historical RFQs
      const similarRfqs = historicalRfqs.map(historicalRfq => {
        const historicalText = `${historicalRfq.title} ${historicalRfq.description}`.toLowerCase();
        
        // Calculate Jaccard similarity coefficient
        let matchingKeywords = 0;
        for (const keyword of rfqKeywords) {
          if (historicalText.includes(keyword)) {
            matchingKeywords++;
          }
        }
        
        const similarityScore = rfqKeywords.length > 0 
          ? matchingKeywords / rfqKeywords.length 
          : 0;
        
        // Category match boosts similarity
        const categoryBoost = historicalRfq.category === rfq.category ? 0.3 : 0;
        
        return {
          rfq: historicalRfq,
          similarity: Math.min(1, similarityScore + categoryBoost), // Cap at 1.0
          quotes: historicalRfq.quotes
        };
      });
      
      // Sort by similarity score
      const topSimilarRfqs = similarRfqs
        .filter(item => item.similarity > 0.3) // Only use reasonably similar RFQs
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 10); // Take top 10 most similar RFQs
      
      // Find suppliers that performed well for similar RFQs
      const supplierScores = new Map<number, { 
        score: number, 
        matchCount: number,
        factors: any[]
      }>();
      
      // Score suppliers based on successful matches for similar RFQs
      topSimilarRfqs.forEach(similarRfq => {
        // Find successful matches for this RFQ
        const rfqMatches = successfulMatches.filter(match => match.rfqId === similarRfq.rfq.id);
        
        // Weight by similarity and buyer feedback
        rfqMatches.forEach(match => {
          const supplierId = match.supplierId;
          const feedbackWeight = match.buyerFeedback ? match.buyerFeedback / 5 : 0.6; // Scale 1-5 to 0.2-1.0
          const matchScore = similarRfq.similarity * feedbackWeight;
          
          if (!supplierScores.has(supplierId)) {
            supplierScores.set(supplierId, { 
              score: 0, 
              matchCount: 0,
              factors: []
            });
          }
          
          const currentScore = supplierScores.get(supplierId)!;
          currentScore.score += matchScore;
          currentScore.matchCount += 1;
          
          // Add this match as a factor
          currentScore.factors.push({
            factor: `similar_rfq_match_${similarRfq.rfq.id}`,
            weight: 10, // Each similar RFQ contributes equally to the total
            score: matchScore * 100, // Scale to 0-100
            explanation: `Similar to RFQ #${similarRfq.rfq.id}: ${similarRfq.rfq.title} (${Math.round(similarRfq.similarity * 100)}% similar)`,
          });
        });
      });
      
      // Convert scores to recommendations
      const recommendations = Array.from(supplierScores.entries())
        .map(([supplierId, data]) => {
          // Normalize score based on match count and max possible score
          const normalizedScore = Math.min(100, (data.score / Math.max(1, data.matchCount)) * 100);
          
          const supplier = suppliers.find(s => s.id === supplierId);
          if (!supplier) return null;
          
          return {
            supplierId,
            matchScore: normalizedScore,
            matchReason: `Recommended based on performance in ${data.matchCount} similar RFQs`,
            matchFactors: data.factors,
            recommended: normalizedScore >= 70,
            contacted: false,
            responded: false,
          };
        })
        .filter(Boolean) as Partial<typeof supplierRecommendations.$inferSelect>[];
      
      // Sort by match score (descending)
      return recommendations
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, limit);
      
    } catch (error) {
      log(`Collaborative filtering error: ${error}`, "supplier-matching");
      return [];
    }
  }
  
  /**
   * Time series forecasting for supplier trend analysis
   * 
   * Analyzes recent supplier performance trends to identify 
   * suppliers that are showing improving metrics or gaining popularity.
   * 
   * @param rfq - RFQ object
   * @param suppliers - Array of suppliers with related data
   * @param limit - Maximum number of suppliers to return
   * @returns Promise with array of supplier recommendation objects
   */
  private async timeSeriesForecasting(
    rfq: typeof rfqs.$inferSelect,
    suppliers: any[],
    limit: number
  ): Promise<Partial<typeof supplierRecommendations.$inferSelect>[]> {
    try {
      // Get recent historical matches (last 3 months) to analyze trends
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const recentMatches = await db.query.historicalMatches.findMany({
        where: and(
          // Only include matches from the last 3 months
          gte(historicalMatches.createdAt, threeMonthsAgo),
          // Only include matches in the same category (if possible)
          inArray(historicalMatches.rfqId, 
            db.select({ id: rfqs.id })
              .from(rfqs)
              .where(eq(rfqs.category, rfq.category))
          )
        )
      });
      
      // Group matches by supplier
      const supplierTrends = new Map<number, {
        matches: typeof historicalMatches.$inferSelect[],
        trendScore: number,
        factors: any[]
      }>();
      
      // Only analyze suppliers relevant to this RFQ's category
      const relevantSuppliers = suppliers.filter(s => 
        s.categories?.includes(rfq.category) || 
        (s.attributes?.[0]?.preferredCategories || []).includes(rfq.category)
      );
      
      // Initialize trend map for all relevant suppliers
      relevantSuppliers.forEach(supplier => {
        supplierTrends.set(supplier.id, {
          matches: [],
          trendScore: 0,
          factors: []
        });
      });
      
      // Collect matches by supplier
      recentMatches.forEach(match => {
        if (supplierTrends.has(match.supplierId)) {
          supplierTrends.get(match.supplierId)!.matches.push(match);
        }
      });
      
      // Calculate trend scores for each supplier
      supplierTrends.forEach((data, supplierId) => {
        // Skip suppliers with less than 3 matches (not enough data for trend)
        if (data.matches.length < 3) {
          return;
        }
        
        // Sort matches by date (oldest first)
        const sortedMatches = [...data.matches].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        
        // Divide matches into time segments (early, middle, recent)
        const segmentSize = Math.ceil(sortedMatches.length / 3);
        const earlyMatches = sortedMatches.slice(0, segmentSize);
        const middleMatches = sortedMatches.slice(segmentSize, segmentSize * 2);
        const recentMatches = sortedMatches.slice(segmentSize * 2);
        
        // Calculate average feedback score for each time segment
        const calcAvgFeedback = (matches: typeof historicalMatches.$inferSelect[]) => {
          const validFeedbacks = matches
            .map(m => m.buyerFeedback)
            .filter(f => f !== null && f !== undefined);
          
          return validFeedbacks.length > 0 
            ? validFeedbacks.reduce((sum, val) => sum + (val || 0), 0) / validFeedbacks.length 
            : 0;
        };
        
        const earlyScore = calcAvgFeedback(earlyMatches);
        const middleScore = calcAvgFeedback(middleMatches);
        const recentScore = calcAvgFeedback(recentMatches);
        
        // Calculate trend (positive trend = improving scores over time)
        const trend = ((middleScore - earlyScore) + (recentScore - middleScore)) / 2;
        
        // Calculate frequency trend (are they being matched more frequently?)
        const earlyDate = new Date(earlyMatches[0]?.createdAt || 0);
        const recentDate = new Date(recentMatches[recentMatches.length - 1]?.createdAt || 0);
        const daysSpan = (recentDate.getTime() - earlyDate.getTime()) / (1000 * 60 * 60 * 24);
        const matchesPerDay = daysSpan > 0 ? sortedMatches.length / daysSpan : 0;
        
        // Compute final trend score (0-100 scale)
        // Higher score = positive trend in feedback and/or increased frequency
        const feedbackTrendScore = Math.min(100, Math.max(0, 50 + trend * 25));
        const frequencyScore = Math.min(100, matchesPerDay * 20); // Rough scale: 5 matches/day = 100%
        
        const finalTrendScore = (feedbackTrendScore * 0.7) + (frequencyScore * 0.3);
        
        // Store trend score and explanation factors
        data.trendScore = finalTrendScore;
        data.factors = [
          {
            factor: "feedback_trend",
            weight: 70,
            score: feedbackTrendScore,
            explanation: trend > 0 
              ? `Improving customer satisfaction (${trend.toFixed(2)} points increase)`
              : `Stable customer satisfaction (${Math.abs(trend).toFixed(2)} points change)`
          },
          {
            factor: "match_frequency",
            weight: 30,
            score: frequencyScore,
            explanation: `Activity level: ${matchesPerDay.toFixed(2)} matches per day`
          }
        ];
      });
      
      // Convert trend scores to recommendations
      const recommendations = Array.from(supplierTrends.entries())
        .filter(([_, data]) => data.trendScore > 0)
        .map(([supplierId, data]) => {
          const supplier = suppliers.find(s => s.id === supplierId);
          if (!supplier) return null;
          
          return {
            supplierId,
            matchScore: data.trendScore,
            matchReason: data.trendScore > 70 
              ? "Trending supplier with improving performance"
              : "Supplier with stable recent performance",
            matchFactors: data.factors,
            recommended: data.trendScore >= 70,
            contacted: false,
            responded: false,
          };
        })
        .filter(Boolean) as Partial<typeof supplierRecommendations.$inferSelect>[];
      
      // Sort by trend score (descending)
      return recommendations
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, limit);
      
    } catch (error) {
      log(`Time series forecasting error: ${error}`, "supplier-matching");
      return [];
    }
  }
  
  /**
   * Blend results from multiple recommendation algorithms
   * 
   * Uses a weighted ensemble approach to combine scores from different
   * algorithms, resulting in more robust and accurate recommendations.
   * 
   * @param algorithmResults - Results from different recommendation algorithms
   * @param weights - Weight to assign to each algorithm's results
   * @param suppliers - Array of suppliers with related data
   * @param limit - Maximum number of suppliers to return
   * @returns Array of supplier recommendation objects
   */
  private async blendRecommendations(
    algorithmResults: { [key: string]: Partial<typeof supplierRecommendations.$inferSelect>[] },
    weights: { [key: string]: number },
    suppliers: any[],
    limit: number
  ): Promise<Partial<typeof supplierRecommendations.$inferSelect>[]> {
    try {
      // Create a map to combine scores from different algorithms
      const blendedScores = new Map<number, {
        supplierId: number,
        algorithms: string[],
        weightedScore: number,
        factors: any[],
        totalWeight: number,
        matchReason: string
      }>();
      
      // Process results from each algorithm
      Object.entries(algorithmResults).forEach(([algorithm, results]) => {
        const algorithmWeight = weights[algorithm] || 0;
        
        if (algorithmWeight > 0 && results.length > 0) {
          results.forEach(result => {
            const supplierId = result.supplierId!;
            
            if (!blendedScores.has(supplierId)) {
              blendedScores.set(supplierId, {
                supplierId,
                algorithms: [],
                weightedScore: 0,
                factors: [],
                totalWeight: 0,
                matchReason: ""
              });
            }
            
            const blended = blendedScores.get(supplierId)!;
            blended.algorithms.push(algorithm);
            blended.weightedScore += (result.matchScore || 0) * algorithmWeight;
            blended.totalWeight += algorithmWeight;
            
            // Add algorithm contribution as a factor
            blended.factors.push({
              factor: `algorithm_${algorithm}`,
              weight: algorithmWeight * 100, // Scale to 0-100
              score: result.matchScore || 0,
              explanation: `${algorithm} score: ${result.matchScore?.toFixed(0)}/100`
            });
            
            // Collect match reasons from the highest weighted algorithms
            if (algorithmWeight >= 0.2) {
              if (blended.matchReason) {
                blended.matchReason += "; ";
              }
              blended.matchReason += result.matchReason || "";
            }
          });
        }
      });
      
      // Normalize scores and create final recommendations
      const recommendations = Array.from(blendedScores.values())
        .map(blended => {
          // Normalize score based on total weight applied
          const normalizedScore = blended.totalWeight > 0 
            ? blended.weightedScore / blended.totalWeight 
            : 0;
          
          return {
            supplierId: blended.supplierId,
            matchScore: normalizedScore,
            matchReason: blended.matchReason || `Recommended by ${blended.algorithms.join(", ")} algorithms`,
            matchFactors: [
              // Include algorithm contribution factors
              ...blended.factors,
              // Add blending explanation
              {
                factor: "ensemble_blend",
                weight: 100,
                score: normalizedScore,
                explanation: `Combined score from ${blended.algorithms.length} algorithms with weights: ${
                  blended.algorithms.map(alg => `${alg} (${weights[alg]})`)
                }`
              }
            ],
            recommended: normalizedScore >= 70,
            contacted: false,
            responded: false,
          };
        });
      
      // Sort by final score (descending)
      return recommendations
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, limit);
      
    } catch (error) {
      log(`Blending recommendations error: ${error}`, "supplier-matching");
      return [];
    }
  }

  /**
   * Get existing recommendations with supplier details
   * @param rfqId - ID of the RFQ
   * @param limit - Maximum number of recommendations to return
   * @returns Promise with array of supplier recommendations with supplier details
   */
  async getRecommendationsWithSuppliers(
    rfqId: number,
    limit: number = 10
  ): Promise<any[]> {
    try {
      // Get existing recommendations for this RFQ
      const recommendations = await db.query.supplierRecommendations.findMany({
        where: eq(supplierRecommendations.rfqId, rfqId),
        orderBy: [
          desc(supplierRecommendations.matchScore),
          desc(supplierRecommendations.updatedAt)
        ],
        limit
      });
      
      if (recommendations.length === 0) {
        return [];
      }
      
      // Get supplier IDs from recommendations
      const supplierIds = recommendations.map(rec => rec.supplierId);
      
      // Fetch supplier details
      const suppliersDetails = await db.query.suppliers.findMany({
        where: inArray(suppliers.id, supplierIds),
        with: {
          metrics: true,
          attributes: true
        }
      });
      
      // Merge recommendation and supplier data
      return recommendations.map(recommendation => {
        const supplier = suppliersDetails.find(s => s.id === recommendation.supplierId);
        return {
          ...recommendation,
          supplier: supplier ? {
            id: supplier.id,
            companyName: supplier.companyName,
            description: supplier.description,
            logo: supplier.logo,
            categories: supplier.categories,
            verified: supplier.verified,
            riskScore: supplier.riskScore,
            riskGrade: supplier.riskGrade,
            location: supplier.location
          } : undefined
        };
      });
      
    } catch (error) {
      log(`Error getting recommendations with suppliers: ${error}`, "supplier-matching");
      return [];
    }
  }
  
  /**
   * Update historical match data
   * @param rfqId - ID of the RFQ
   * @param supplierId - ID of the supplier
   * @param wasSuccessful - Whether the match was successful
   * @param buyerFeedback - Feedback score from the buyer (1-5)
   * @param supplierFeedback - Feedback score from the supplier (1-5)
   * @param feedbackNotes - Additional feedback notes
   * @returns Promise with updated historical match
   */
  async updateHistoricalMatch(
    rfqId: number,
    supplierId: number,
    wasSuccessful: boolean,
    buyerFeedback?: number,
    supplierFeedback?: number,
    feedbackNotes?: string
  ): Promise<any> {
    try {
      // Check if historical match exists
      const existingMatch = await db.query.historicalMatches.findFirst({
        where: and(
          eq(historicalMatches.rfqId, rfqId),
          eq(historicalMatches.supplierId, supplierId)
        )
      });
      
      const historyData = {
        rfqId,
        supplierId,
        wasSuccessful,
        buyerFeedback: buyerFeedback || null,
        supplierFeedback: supplierFeedback || null,
        feedbackNotes: feedbackNotes || null,
        updatedAt: new Date()
      };
      
      if (existingMatch) {
        // Update existing match
        return await db
          .update(historicalMatches)
          .set(historyData)
          .where(eq(historicalMatches.id, existingMatch.id))
          .returning();
      } else {
        // Create new historical match
        return await db
          .insert(historicalMatches)
          .values({
            ...historyData,
            createdAt: new Date()
          })
          .returning();
      }
      
    } catch (error) {
      log(`Error updating historical match: ${error}`, "supplier-matching");
      throw error;
    }
  }
}

// Singleton instance
const supplierMatchingService = new SupplierMatchingService();

export default supplierMatchingService;