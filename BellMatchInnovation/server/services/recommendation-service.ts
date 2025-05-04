import { db } from "../../db";
import { eq, ne, and, or, desc, asc, inArray, SQL } from "drizzle-orm";
import { rfqs, users, suppliers, historicalMatches, supplierRecommendations, userPreferences } from "../../shared/schema";
import { log } from "../vite";

/**
 * Service for generating personalized RFQ recommendations
 */
class RecommendationService {
  /**
   * Get personalized RFQ recommendations for a user
   * This uses a hybrid recommendation approach:
   * - Collaborative filtering based on user history
   * - Content-based filtering based on RFQ categories and user needs
   * - Semantic matching for better understanding of requirements
   * - Trending and recent RFQs
   * 
   * @param userId The user ID to get recommendations for
   * @param limit Maximum number of recommendations to return
   * @param excludeRfqIds Optional array of RFQ IDs to exclude from recommendations
   * @returns Array of recommended RFQs with relevance scores
   */
  async getPersonalizedRfqRecommendations(
    userId: number,
    limit: number = 10,
    excludeRfqIds: number[] = [],
    language: string = 'en'
  ) {
    try {
      // Get user information
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      // Get user preferences
      const userPrefs = await db.query.userPreferences.findFirst({
        where: eq(userPreferences.userId, userId),
      });
      
      // Default preferences if none found
      const preferences = userPrefs || {
        preferredCategories: [],
        preferredPriceRange: null,
        preferredSupplierTypes: [],
        preferredBusinessScale: null,
        languagePreference: language,
        communicationPreference: "email"
      };

      // Get user's recent RFQs to understand their interests and needs
      const userRfqs = await db.query.rfqs.findMany({
        where: eq(rfqs.userId, userId),
        orderBy: [desc(rfqs.createdAt)],
        limit: 15, // Increased to get better understanding of user patterns
      });

      // Extract categories and keywords from user's RFQs
      const userCategories = [...new Set(userRfqs.map(rfq => rfq.category))];
      
      // Extract keywords from titles and descriptions
      const userKeywords = this.extractKeywords(userRfqs);

      // Analyze user needs based on their RFQ patterns
      const userNeeds = this.analyzeUserNeeds(userRfqs);

      // Get user's historical matches to understand their supplier preferences
      const userMatches = await db.query.historicalMatches.findMany({
        where: inArray(
          historicalMatches.rfqId,
          userRfqs.map(rfq => rfq.id)
        ),
      });

      // Favored suppliers (those the user has worked with successfully before)
      const favoredSupplierIds = [...new Set(
        userMatches
          .filter(match => match.wasSuccessful && match.buyerFeedback && match.buyerFeedback >= 4)
          .map(match => match.supplierId)
      )];

      // Get user's industry preferences if available
      const userIndustries = user.preferredIndustries || [];

      // Now build recommendation score for RFQs in the system
      const allRfqs = await db.query.rfqs.findMany({
        where: and(
          ne(rfqs.userId, userId), // Don't recommend user's own RFQs
          ne(rfqs.status, "draft"), // Don't recommend drafts
          ne(rfqs.status, "canceled"), // Don't recommend canceled RFQs
          excludeRfqIds.length > 0 
            ? inArray(rfqs.id, excludeRfqIds).not() 
            : undefined,
        ),
        with: {
          user: true,
        },
        orderBy: [desc(rfqs.createdAt)],
      });

      // Score each RFQ based on personalization factors
      const scoredRfqs = allRfqs.map(rfq => {
        // Initialize base score
        let score = 50; // Start with neutral score
        let matchReasons: string[] = [];
        let matchDetails: Record<string, number> = {}; // For detailed scoring breakdown

        // Category match (highest weight) - check both historic categories and user preferences
        const isPreferredCategory = preferences.preferredCategories && 
          Array.isArray(preferences.preferredCategories) && 
          preferences.preferredCategories.includes(rfq.category);
        
        if (userCategories.includes(rfq.category) || isPreferredCategory) {
          // Give extra points if it's both in history and preferences
          const categoryScore = isPreferredCategory && userCategories.includes(rfq.category) ? 40 : 30;
          score += categoryScore;
          
          if (isPreferredCategory) {
            matchReasons.push(`Matches your preferred category: ${rfq.category}`);
          } else {
            matchReasons.push(`Matches your category interest in ${rfq.category}`);
          }
          
          matchDetails.categoryMatch = categoryScore;
        }

        // Keyword match with improved semantic relevance
        const rfqText = `${rfq.title} ${rfq.description}`.toLowerCase();
        const keywordMatches = userKeywords.filter(keyword => 
          rfqText.includes(keyword)
        );
        
        if (keywordMatches.length > 0) {
          const keywordScore = Math.min(25, keywordMatches.length * 5);
          score += keywordScore;
          if (keywordMatches.length > 2) {
            matchReasons.push(`Matches multiple keywords from your previous RFQs`);
          } else {
            matchReasons.push(`Contains similar terms to your previous RFQs`);
          }
          matchDetails.keywordMatch = keywordScore;
        }

        // User needs match (improved matching based on patterns)
        const needsMatchScore = this.calculateNeedsMatchScore(rfq, userNeeds);
        if (needsMatchScore > 0) {
          score += needsMatchScore;
          matchReasons.push(`Aligns with your procurement needs`);
          matchDetails.needsMatch = needsMatchScore;
        }

        // Industry relevance
        if (userIndustries.length > 0 && rfq.industry && userIndustries.includes(rfq.industry)) {
          const industryScore = 20;
          score += industryScore;
          matchReasons.push(`Relevant to your ${rfq.industry} industry focus`);
          matchDetails.industryMatch = industryScore;
        }

        // Preferred supplier match
        if (favoredSupplierIds.includes(rfq.preferredSupplierId)) {
          const supplierScore = 20;
          score += supplierScore;
          matchReasons.push(`Includes a supplier you've successfully worked with`);
          matchDetails.supplierMatch = supplierScore;
        }

        // Recency bonus (newer RFQs get slight preference)
        const daysSinceCreation = this.getDaysDifference(new Date(), new Date(rfq.createdAt));
        if (daysSinceCreation < 7) {
          const recencyScore = Math.max(0, 10 - daysSinceCreation);
          score += recencyScore;
          if (daysSinceCreation <= 1) {
            matchReasons.push(`Posted today`);
          } else if (daysSinceCreation <= 3) {
            matchReasons.push(`Posted recently`);
          }
          matchDetails.recencyBonus = recencyScore;
        }

        // Budget match factor - use either explicit preferences or historical average
        if (rfq.budget) {
          // Check if user has explicit price range preferences
          if (preferences.preferredPriceRange && 
              preferences.preferredPriceRange.min !== null && 
              preferences.preferredPriceRange.max !== null) {
            
            const min = Number(preferences.preferredPriceRange.min);
            const max = Number(preferences.preferredPriceRange.max);
            
            // If the RFQ budget falls within the user's preferred range
            if (!isNaN(min) && !isNaN(max) && Number(rfq.budget) >= min && Number(rfq.budget) <= max) {
              const budgetScore = 20; // Higher score for explicit preferences
              score += budgetScore;
              matchReasons.push(`Budget falls within your preferred price range`);
              matchDetails.budgetMatch = budgetScore;
            }
          } 
          // Otherwise check against historical average
          else if (userRfqs.length > 0) {
            const avgUserBudget = this.calculateAverageBudget(userRfqs);
            if (avgUserBudget > 0) {
              const budgetDiffPercent = Math.abs(Number(rfq.budget) - avgUserBudget) / avgUserBudget;
              
              // If budget is within 25% of user's average
              if (budgetDiffPercent <= 0.25) {
                const budgetScore = 15;
                score += budgetScore;
                matchReasons.push(`Budget similar to your previous RFQs`);
                matchDetails.budgetMatch = budgetScore;
              }
            }
          }
        }

        // Deadline compatibility (if the user has pattern of tight/relaxed deadlines)
        if (userRfqs.length > 0 && rfq.deadline) {
          const userDeadlinePatterns = this.analyzeDeadlinePatterns(userRfqs);
          if (userDeadlinePatterns) {
            const deadlineCompat = this.checkDeadlineCompatibility(rfq.deadline, userDeadlinePatterns);
            if (deadlineCompat > 0) {
              score += deadlineCompat;
              if (deadlineCompat > 10) {
                matchReasons.push(`Deadline matches your preferred timeline`);
              }
              matchDetails.deadlineMatch = deadlineCompat;
            }
          }
        }

        // Business type/scale preference match - use explicit preferences if available
        if (rfq.user && rfq.user.businessType) {
          // Use user preferences from preferences table first
          if (preferences.preferredBusinessScale || preferences.preferredSupplierTypes) {
            let businessTypeMatched = false;
            
            // Check business scale preference match
            if (preferences.preferredBusinessScale && 
                rfq.user.businessType === preferences.preferredBusinessScale) {
              const businessScaleScore = 15;
              score += businessScaleScore;
              matchReasons.push(`Matches your preferred business scale: ${preferences.preferredBusinessScale}`);
              matchDetails.businessScaleMatch = businessScaleScore;
              businessTypeMatched = true;
            }
            
            // Check preferred supplier types match
            if (preferences.preferredSupplierTypes && 
                Array.isArray(preferences.preferredSupplierTypes) && 
                preferences.preferredSupplierTypes.includes(rfq.user.businessType)) {
              const supplierTypeScore = 15;
              score += supplierTypeScore;
              matchReasons.push(`Matches your preferred supplier type`);
              matchDetails.supplierTypeMatch = supplierTypeScore;
              businessTypeMatched = true;
            }
            
            // Legacy support for old user preferences stored directly on user object
            if (!businessTypeMatched && user.preferredBusinessTypes && 
                Array.isArray(user.preferredBusinessTypes) && 
                user.preferredBusinessTypes.includes(rfq.user.businessType)) {
              const businessTypeScore = 10;
              score += businessTypeScore;
              matchReasons.push(`From a ${rfq.user.businessType} business seller`);
              matchDetails.businessTypeMatch = businessTypeScore;
            }
          } 
          // Fallback to user preferences on user object if available
          else if (user.preferredBusinessTypes && 
                  Array.isArray(user.preferredBusinessTypes) && 
                  user.preferredBusinessTypes.includes(rfq.user.businessType)) {
            const businessTypeScore = 10;
            score += businessTypeScore;
            matchReasons.push(`From a ${rfq.user.businessType} business seller`);
            matchDetails.businessTypeMatch = businessTypeScore;
          }
        }

        // Quality preference alignment - using quality preferences from user preferences table
        const rfqQualityFocus = rfq.description?.toLowerCase().includes('quality') || 
                                rfq.description?.toLowerCase().includes('premium') ||
                                rfq.description?.toLowerCase().includes('high-end');
        
        // Check if user has explicit quality preference in preferences table
        if (preferences.qualityPreference && preferences.qualityPreference >= 4 && rfqQualityFocus) {
          const qualityScore = 18; // Higher score for explicit preferences
          score += qualityScore;
          matchReasons.push(`Emphasizes quality standards you value`);
          matchDetails.qualityMatch = qualityScore;
        }
        // Fallback to user qualityPreference if available (legacy)
        else if (user.qualityPreference && user.qualityPreference >= 4 && rfqQualityFocus) {
          const qualityScore = 15;
          score += qualityScore;
          matchReasons.push(`Emphasizes quality standards you value`);
          matchDetails.qualityMatch = qualityScore;
        }
        // Also check userNeeds for quality focus pattern
        else if (userNeeds.qualityFocus > 40 && rfqQualityFocus) {
          const qualityScore = 12;
          score += qualityScore;
          matchReasons.push(`Emphasizes quality based on your history`);
          matchDetails.qualityFromHistory = qualityScore;
        }

        // Normalize score to 0-100 range
        score = Math.min(100, Math.max(0, score));

        // Create a recommendation object
        return {
          rfq: {
            id: rfq.id,
            title: rfq.title,
            description: rfq.description,
            category: rfq.category,
            budget: rfq.budget,
            deadline: rfq.deadline,
            status: rfq.status,
            createdAt: rfq.createdAt,
            user: {
              id: rfq.user.id,
              name: rfq.user.name,
              businessType: rfq.user.businessType,
              avatar: rfq.user.avatar
            }
          },
          score: score,
          matchDetails: matchDetails, // For detailed explanation if needed
          reasons: matchReasons.slice(0, 3), // Increased to top 3 reasons
          language: language // Store language for localized display
        };
      });

      // Sort by score (descending) and return top recommendations
      return scoredRfqs
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      log(`Error getting personalized RFQ recommendations: ${error}`, "recommendation-service");
      throw error;
    }
  }

  /**
   * Analyze user needs based on their RFQ history
   * Identifies patterns in what the user typically requests
   */
  private analyzeUserNeeds(userRfqs: typeof rfqs.$inferSelect[]) {
    if (userRfqs.length === 0) return {};

    // Initialize needs object
    const needs: Record<string, number> = {
      qualityFocus: 0,
      priceSensitivity: 0,
      timeConstraint: 0,
      volumeRequirement: 0,
      technicalComplexity: 0,
      sustainabilityFocus: 0
    };

    // Analyze RFQs for patterns
    userRfqs.forEach(rfq => {
      // Quality focus indicators
      if (rfq.description?.toLowerCase().includes('quality') || 
          rfq.description?.toLowerCase().includes('premium') ||
          rfq.description?.toLowerCase().includes('high-end')) {
        needs.qualityFocus++;
      }

      // Price sensitivity indicators
      if (rfq.description?.toLowerCase().includes('cost') ||
          rfq.description?.toLowerCase().includes('budget') ||
          rfq.description?.toLowerCase().includes('affordable')) {
        needs.priceSensitivity++;
      }

      // Time constraint indicators
      if (rfq.description?.toLowerCase().includes('urgent') ||
          rfq.description?.toLowerCase().includes('asap') ||
          rfq.description?.toLowerCase().includes('quick')) {
        needs.timeConstraint++;
      }

      // Volume requirement indicators
      if (rfq.quantity && rfq.quantity > 1000) {
        needs.volumeRequirement++;
      }

      // Technical complexity
      if (rfq.description?.toLowerCase().includes('technical') ||
          rfq.description?.toLowerCase().includes('complex') ||
          rfq.description?.toLowerCase().includes('specialized')) {
        needs.technicalComplexity++;
      }

      // Sustainability focus
      if (rfq.description?.toLowerCase().includes('sustainable') ||
          rfq.description?.toLowerCase().includes('eco') ||
          rfq.description?.toLowerCase().includes('green')) {
        needs.sustainabilityFocus++;
      }
    });

    // Normalize needs based on RFQ count
    const rfqCount = userRfqs.length;
    Object.keys(needs).forEach(key => {
      needs[key] = (needs[key] / rfqCount) * 100;
    });

    return needs;
  }

  /**
   * Calculate how well an RFQ matches the user's need patterns
   */
  private calculateNeedsMatchScore(rfq: typeof rfqs.$inferSelect, userNeeds: Record<string, number>) {
    if (!rfq || Object.keys(userNeeds).length === 0) return 0;

    let score = 0;
    const description = rfq.description?.toLowerCase() || '';

    // Check if RFQ matches user's quality focus
    if (userNeeds.qualityFocus > 30 && 
        (description.includes('quality') || description.includes('premium'))) {
      score += 15;
    }

    // Check if RFQ matches user's price sensitivity
    if (userNeeds.priceSensitivity > 30 && 
        (description.includes('affordable') || description.includes('reasonable price'))) {
      score += 12;
    }

    // Check if RFQ matches user's time constraints
    if (userNeeds.timeConstraint > 30 && 
        (description.includes('urgent') || description.includes('quick'))) {
      score += 10;
    }

    // Check if RFQ matches user's volume requirements
    if (userNeeds.volumeRequirement > 30 && rfq.quantity && rfq.quantity > 1000) {
      score += 12;
    }

    // Check if RFQ matches user's technical complexity needs
    if (userNeeds.technicalComplexity > 30 && 
        (description.includes('technical') || description.includes('specialized'))) {
      score += 14;
    }

    // Check if RFQ matches user's sustainability focus
    if (userNeeds.sustainabilityFocus > 30 && 
        (description.includes('sustainable') || description.includes('eco-friendly'))) {
      score += 15;
    }

    return Math.min(25, score); // Cap at 25 points max
  }

  /**
   * Analyze user patterns regarding deadlines
   */
  private analyzeDeadlinePatterns(userRfqs: typeof rfqs.$inferSelect[]) {
    const rfqsWithDeadlines = userRfqs.filter(rfq => rfq.deadline);
    if (rfqsWithDeadlines.length < 3) return null; // Not enough data

    // Calculate average deadline days from created date
    const deadlineDays = rfqsWithDeadlines.map(rfq => {
      const created = new Date(rfq.createdAt);
      const deadline = new Date(rfq.deadline);
      return this.getDaysDifference(deadline, created);
    });

    const totalDays = deadlineDays.reduce((sum, days) => sum + days, 0);
    const avgDays = totalDays / deadlineDays.length;

    // Determine if user typically has tight, normal, or relaxed deadlines
    let pattern = 'normal';
    if (avgDays < 7) {
      pattern = 'tight';
    } else if (avgDays > 30) {
      pattern = 'relaxed';
    }

    return { avgDays, pattern };
  }

  /**
   * Check how compatible an RFQ's deadline is with the user's patterns
   */
  private checkDeadlineCompatibility(deadline: string, userPattern: { avgDays: number, pattern: string }) {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysUntilDeadline = this.getDaysDifference(deadlineDate, today);

    // Score based on how well the deadline matches user pattern
    let score = 0;
    
    if (userPattern.pattern === 'tight' && daysUntilDeadline < 7) {
      score = 15; // High score for tight deadlines when user prefers tight deadlines
    } else if (userPattern.pattern === 'relaxed' && daysUntilDeadline > 30) {
      score = 15; // High score for relaxed deadlines when user prefers relaxed deadlines
    } else if (userPattern.pattern === 'normal' && daysUntilDeadline >= 7 && daysUntilDeadline <= 30) {
      score = 15; // High score for normal deadlines when user prefers normal deadlines
    } else {
      // Partial match based on how close to the user's average
      const diffFromAvg = Math.abs(daysUntilDeadline - userPattern.avgDays);
      if (diffFromAvg <= 5) {
        score = 10; // Close to user's average
      } else if (diffFromAvg <= 10) {
        score = 5; // Somewhat close to user's average
      }
    }

    return score;
  }

  /**
   * Get trending RFQs based on recent activity and popularity
   * 
   * @param limit Maximum number of trending RFQs to return
   * @param userId Optional user ID to personalize results
   * @param language Language code for localization
   * @returns Array of trending RFQs with popularity metrics
   */
  async getTrendingRfqs(limit: number = 5, userId?: number, language: string = 'en') {
    try {
      // Get all active RFQs 
      const activeRfqs = await db.query.rfqs.findMany({
        where: and(
          ne(rfqs.status, "draft"),
          ne(rfqs.status, "canceled")
        ),
        with: {
          user: true,
          // Include supplier recommendation counts for popularity metric
          _count: {
            relationName: 'supplierRecommendations'
          }
        },
        orderBy: [desc(rfqs.createdAt)],
      });

      // Score RFQs based on trending factors
      const scoredRfqs = await Promise.all(activeRfqs.map(async rfq => {
        // Start with base score
        let trendScore = 50;
        
        // Recent creation bonus (newer RFQs trend higher)
        const daysSinceCreation = this.getDaysDifference(new Date(), new Date(rfq.createdAt));
        if (daysSinceCreation < 14) { // Boost for RFQs within last 2 weeks
          trendScore += Math.max(0, 20 - (daysSinceCreation * 1.5));
        }
        
        // Popularity based on supplier interest (recommendations/matches)
        if (rfq._count?.supplierRecommendations) {
          const recommendationCount = rfq._count.supplierRecommendations;
          trendScore += Math.min(25, recommendationCount * 5);
        }
        
        // Get recent matches to measure engagement
        const recentMatches = await db.query.historicalMatches.findMany({
          where: eq(historicalMatches.rfqId, rfq.id),
          orderBy: [desc(historicalMatches.createdAt)],
        });
        
        if (recentMatches.length > 0) {
          trendScore += Math.min(20, recentMatches.length * 4);
        }
        
        // Personalization boost based on user preferences (if userId provided)
        let userBoost = 0;
        if (userId) {
          const user = await db.query.users.findFirst({
            where: eq(users.id, userId)
          });
          
          if (user) {
            // Check if RFQ category matches user preferences
            const userRfqs = await db.query.rfqs.findMany({
              where: eq(rfqs.userId, userId),
              limit: 10
            });
            
            const userCategories = [...new Set(userRfqs.map(r => r.category))];
            if (userCategories.includes(rfq.category)) {
              userBoost += 10;
            }
          }
        }
        trendScore += userBoost;
        
        // Get localized popularity label based on language
        let popularityLabel = this.getLocalizedPopularityLabel(trendScore, language);
        
        // Return scored RFQ with language context
        return {
          rfq: {
            id: rfq.id,
            title: rfq.title,
            description: rfq.description,
            category: rfq.category,
            budget: rfq.budget,
            deadline: rfq.deadline,
            status: rfq.status,
            createdAt: rfq.createdAt,
            user: {
              id: rfq.user.id,
              name: rfq.user.fullName || rfq.user.username, // Use fullName if available, otherwise username
              businessType: rfq.user.role === 'supplier' ? 'business' : 'individual', // Use role as businessType
              avatar: `/assets/avatars/${rfq.user.id}.jpg` // Generate avatar path
            }
          },
          trendScore,
          popularityLabel,
          supplierInterest: rfq._count?.supplierRecommendations || 0,
          language: language
        };
      }));
      
      // Sort by trend score and return top results
      return scoredRfqs
        .sort((a, b) => b.trendScore - a.trendScore)
        .slice(0, limit);
    } catch (error) {
      log(`Error getting trending RFQs: ${error}`, "recommendation-service");
      return [];
    }
  }
  
  /**
   * Get localized popularity label based on score and language
   */
  private getLocalizedPopularityLabel(score: number, language: string): string {
    if (language === 'en') {
      if (score >= 90) return 'Highly Popular';
      if (score >= 75) return 'Popular';
      if (score >= 60) return 'Gaining Interest';
      return 'New Opportunity';
    } else if (language === 'es') {
      if (score >= 90) return 'Muy Popular';
      if (score >= 75) return 'Popular';
      if (score >= 60) return 'Ganando Interés';
      return 'Nueva Oportunidad';
    } else if (language === 'zh') {
      if (score >= 90) return '非常热门';
      if (score >= 75) return '热门';
      if (score >= 60) return '关注度上升';
      return '新机会';
    } else if (language === 'ar') {
      if (score >= 90) return 'شعبية عالية';
      if (score >= 75) return 'مشهور';
      if (score >= 60) return 'اكتساب اهتمام';
      return 'فرصة جديدة';
    } else {
      // Default to English
      if (score >= 90) return 'Highly Popular';
      if (score >= 75) return 'Popular';
      if (score >= 60) return 'Gaining Interest';
      return 'New Opportunity';
    }
  }

  /**
   * Calculate average budget from a list of RFQs
   */
  private calculateAverageBudget(rfqList: typeof rfqs.$inferSelect[]) {
    const rfqsWithBudget = rfqList.filter(rfq => rfq.budget && rfq.budget > 0);
    if (rfqsWithBudget.length === 0) return 0;
    
    const totalBudget = rfqsWithBudget.reduce((sum, rfq) => sum + (rfq.budget || 0), 0);
    return totalBudget / rfqsWithBudget.length;
  }

  /**
   * Calculate days difference between two dates
   */
  private getDaysDifference(dateA: Date, dateB: Date) {
    const msPerDay = 1000 * 60 * 60 * 24;
    const utcA = Date.UTC(dateA.getFullYear(), dateA.getMonth(), dateA.getDate());
    const utcB = Date.UTC(dateB.getFullYear(), dateB.getMonth(), dateB.getDate());
    return Math.floor((utcA - utcB) / msPerDay);
  }

  /**
   * Extract relevant keywords from RFQs
   */
  private extractKeywords(rfqList: typeof rfqs.$inferSelect[]) {
    // Combine all text from RFQs
    const allText = rfqList
      .map(rfq => `${rfq.title} ${rfq.description}`)
      .join(' ')
      .toLowerCase();
    
    // Split into words and filter common words
    const stopWords = ['the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'like', 'through'];
    const words = allText.split(/\s+/);
    
    // Extract meaningful words (longer than 3 chars, not in stop words)
    const keywords = words
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .reduce((unique, word) => {
        if (!unique.includes(word)) {
          unique.push(word);
        }
        return unique;
      }, [] as string[]);
    
    return keywords;
  }
}

export const recommendationService = new RecommendationService();