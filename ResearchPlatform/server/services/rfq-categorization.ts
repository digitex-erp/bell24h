import OpenAI from "openai";
import { log } from "../utils";
import { db } from "../db";
import { Rfq, rfqs } from "@shared/schema";
import { eq } from "drizzle-orm";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * RFQ Categorization Service
 * 
 * This service uses machine learning to automatically categorize RFQs
 * based on their descriptions and attributes. It combines rule-based
 * classification with AI-powered text analysis.
 */
export class RfqCategorizationService {
  // Industry and category mappings
  private industries = [
    { id: 1, name: "Manufacturing", keywords: ["production", "assembly", "factory", "manufacturing", "fabrication"] },
    { id: 2, name: "Technology", keywords: ["software", "hardware", "IT", "tech", "digital"] },
    { id: 3, name: "Healthcare", keywords: ["medical", "health", "pharmaceutical", "hospital", "healthcare"] },
    { id: 4, name: "Construction", keywords: ["building", "construction", "infrastructure", "architect"] },
    { id: 5, name: "Automotive", keywords: ["vehicle", "automotive", "car", "transport"] },
    { id: 6, name: "Textile", keywords: ["fabric", "textile", "clothing", "garment"] },
    { id: 7, name: "Agriculture", keywords: ["farm", "agriculture", "crop", "food"] },
    { id: 8, name: "Electronics", keywords: ["electronic", "circuit", "device", "component"] },
    { id: 9, name: "Energy", keywords: ["power", "energy", "renewable", "electric"] },
    { id: 10, name: "Retail", keywords: ["retail", "store", "seller", "consumer"] }
  ];

  private categories = [
    // Manufacturing categories
    { id: 101, industryId: 1, name: "Raw Materials", keywords: ["raw materials", "metal", "plastic", "rubber"] },
    { id: 102, industryId: 1, name: "Production Equipment", keywords: ["machine", "equipment", "tool", "machinery"] },
    { id: 103, industryId: 1, name: "Assembly Services", keywords: ["assembly", "joining", "fitting"] },
    
    // Technology categories
    { id: 201, industryId: 2, name: "Software Development", keywords: ["software", "application", "code", "programming"] },
    { id: 202, industryId: 2, name: "Hardware Procurement", keywords: ["hardware", "computer", "server", "device"] },
    { id: 203, industryId: 2, name: "IT Services", keywords: ["service", "support", "maintenance", "IT"] },
    
    // Healthcare categories
    { id: 301, industryId: 3, name: "Medical Equipment", keywords: ["equipment", "device", "apparatus", "medical"] },
    { id: 302, industryId: 3, name: "Pharmaceuticals", keywords: ["drug", "medicine", "pharmaceutical"] },
    { id: 303, industryId: 3, name: "Healthcare Services", keywords: ["service", "care", "treatment", "healthcare"] },

    // More categories for other industries...
    // Add 2-3 categories per industry for the remaining industries
    { id: 401, industryId: 4, name: "Building Materials", keywords: ["materials", "concrete", "cement", "brick"] },
    { id: 402, industryId: 4, name: "Construction Equipment", keywords: ["equipment", "machinery", "crane", "bulldozer"] },
    
    { id: 501, industryId: 5, name: "Auto Parts", keywords: ["parts", "component", "auto", "vehicle"] },
    { id: 502, industryId: 5, name: "Vehicles", keywords: ["car", "truck", "vehicle", "automobile"] },
    
    { id: 601, industryId: 6, name: "Fabrics", keywords: ["fabric", "cloth", "textile", "material"] },
    { id: 602, industryId: 6, name: "Garments", keywords: ["garment", "clothing", "apparel", "wear"] },
    
    { id: 701, industryId: 7, name: "Farm Equipment", keywords: ["equipment", "machinery", "tractor", "farm"] },
    { id: 702, industryId: 7, name: "Seeds and Fertilizers", keywords: ["seed", "fertilizer", "crop", "agriculture"] },
    
    { id: 801, industryId: 8, name: "Electronic Components", keywords: ["component", "part", "circuit", "board"] },
    { id: 802, industryId: 8, name: "Consumer Electronics", keywords: ["consumer", "device", "gadget", "electronic"] },
    
    { id: 901, industryId: 9, name: "Renewable Energy", keywords: ["renewable", "solar", "wind", "sustainable"] },
    { id: 902, industryId: 9, name: "Power Generation", keywords: ["power", "generation", "electricity", "energy"] },
    
    { id: 1001, industryId: 10, name: "Retail Goods", keywords: ["goods", "product", "merchandise", "retail"] },
    { id: 1002, industryId: 10, name: "Retail Services", keywords: ["service", "retail", "store", "shopping"] }
  ];

  /**
   * Categorize an RFQ using rule-based and AI-powered approaches
   * @param rfq The RFQ to categorize
   * @returns Promise with categorization results
   */
  async categorizeRfq(rfq: Rfq): Promise<{
    industryId: number;
    industryName: string;
    categoryId: number;
    categoryName: string;
    confidence: number;
    method: string;
    alternativeCategories?: { id: number; name: string; confidence: number }[];
  }> {
    try {
      log(`Categorizing RFQ #${rfq.id}`, "rfq-categorization");

      // Combine RFQ title and description for text analysis
      const text = `${rfq.title} ${rfq.description}`.toLowerCase();

      // Try rule-based categorization first
      const ruleBased = this.ruleBasedCategorization(text);
      
      // If rule-based categorization is confident enough, return it
      if (ruleBased.confidence > 0.85) {
        log(`Rule-based categorization successful for RFQ #${rfq.id} with confidence ${ruleBased.confidence}`, "rfq-categorization");
        return {
          ...ruleBased,
          method: "rule-based"
        };
      }

      // Otherwise, use AI-powered categorization
      log(`Rule-based categorization insufficient (${ruleBased.confidence}), using AI for RFQ #${rfq.id}`, "rfq-categorization");
      const aiCategorization = await this.aiCategorization(rfq, ruleBased);
      return {
        ...aiCategorization,
        method: "ai-powered"
      };
    } catch (error) {
      log(`Error categorizing RFQ: ${error.message}`, "rfq-categorization");
      
      // Fallback to basic categorization if everything else fails
      return this.fallbackCategorization(rfq);
    }
  }

  /**
   * Rule-based categorization using keyword matching
   * @param text The text to analyze
   * @returns Categorization with confidence
   */
  private ruleBasedCategorization(text: string): {
    industryId: number;
    industryName: string;
    categoryId: number;
    categoryName: string;
    confidence: number;
  } {
    // Count keyword matches for each industry
    const industryScores = this.industries.map(industry => {
      const matches = industry.keywords.filter(keyword => text.includes(keyword.toLowerCase()));
      return {
        industry,
        matches: matches.length,
        score: matches.length / industry.keywords.length
      };
    });

    // Sort by score and get the top industry
    industryScores.sort((a, b) => b.score - a.score);
    const topIndustry = industryScores[0];
    
    // Get categories for the top industry
    const industriesCategories = this.categories.filter(
      category => category.industryId === topIndustry.industry.id
    );
    
    // Count keyword matches for each category
    const categoryScores = industriesCategories.map(category => {
      const matches = category.keywords.filter(keyword => text.includes(keyword.toLowerCase()));
      return {
        category,
        matches: matches.length,
        score: matches.length / category.keywords.length
      };
    });
    
    // Sort by score and get the top category
    categoryScores.sort((a, b) => b.score - a.score);
    const topCategory = categoryScores[0];
    
    // Calculate overall confidence
    // This is a weighted combination of industry and category confidence
    const confidence = topIndustry.score * 0.4 + (topCategory?.score || 0) * 0.6;
    
    return {
      industryId: topIndustry.industry.id,
      industryName: topIndustry.industry.name,
      categoryId: topCategory?.category.id || 0,
      categoryName: topCategory?.category.name || "Uncategorized",
      confidence
    };
  }

  /**
   * AI-powered categorization using OpenAI
   * @param rfq The RFQ to categorize
   * @param ruleBased Results from rule-based categorization
   * @returns Improved categorization with confidence
   */
  private async aiCategorization(
    rfq: Rfq, 
    ruleBased: { 
      industryId: number; 
      industryName: string; 
      categoryId: number; 
      categoryName: string; 
      confidence: number 
    }
  ): Promise<{
    industryId: number;
    industryName: string;
    categoryId: number;
    categoryName: string;
    confidence: number;
    alternativeCategories: { id: number; name: string; confidence: number }[];
  }> {
    try {
      // Prepare the industries and categories data for the prompt
      const industriesData = this.industries.map(i => `${i.id}: ${i.name}`).join('\n');
      const categoriesData = this.categories.map(c => `${c.id}: ${c.name} (Industry: ${c.industryId})`).join('\n');
      
      // Create the system prompt with categorization instructions
      const systemPrompt = `
        You are an RFQ categorization system. Your task is to analyze the provided RFQ details and categorize it into the most appropriate industry and category.
        
        Available industries:
        ${industriesData}
        
        Available categories:
        ${categoriesData}
        
        The rule-based system has suggested the following categorization:
        - Industry: ${ruleBased.industryId} (${ruleBased.industryName})
        - Category: ${ruleBased.categoryId} (${ruleBased.categoryName})
        - Confidence: ${ruleBased.confidence.toFixed(2)}
        
        Please analyze the RFQ and provide your categorization in JSON format with the following structure:
        {
          "industryId": number,
          "industryName": string,
          "categoryId": number,
          "categoryName": string,
          "confidence": number (between 0 and 1),
          "explanation": string,
          "alternativeCategories": [
            {
              "id": number,
              "name": string,
              "confidence": number
            }
          ]
        }
        
        Provide 1-2 alternative categories if appropriate.
      `;
      
      // Get RFQ details for the prompt
      const userPrompt = `
        RFQ Details:
        - Title: ${rfq.title}
        - Description: ${rfq.description}
        - Quantity: ${rfq.quantity}
        - Budget: ${rfq.budget}
        - Delivery Timeframe: ${rfq.deliveryTimeframe}
        
        Please categorize this RFQ.
      `;
      
      // Call OpenAI API
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      });
      
      // Parse the response
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content received from OpenAI");
      }
      
      const result = JSON.parse(content);
      
      // Log the categorization result
      log(`AI categorization for RFQ #${rfq.id}: ${result.industryName} / ${result.categoryName} (${result.confidence})`, "rfq-categorization");
      
      return {
        industryId: result.industryId,
        industryName: result.industryName,
        categoryId: result.categoryId,
        categoryName: result.categoryName,
        confidence: result.confidence,
        alternativeCategories: result.alternativeCategories || []
      };
    } catch (error) {
      log(`Error in AI categorization: ${error.message}`, "rfq-categorization");
      
      // Return the rule-based result as fallback with slightly reduced confidence
      return {
        ...ruleBased,
        confidence: ruleBased.confidence * 0.9,
        alternativeCategories: []
      };
    }
  }

  /**
   * Fallback categorization when other methods fail
   * @param rfq The RFQ to categorize
   * @returns Basic categorization
   */
  private fallbackCategorization(rfq: Rfq): {
    industryId: number;
    industryName: string;
    categoryId: number;
    categoryName: string;
    confidence: number;
    method: string;
  } {
    // This is a very simplistic fallback that uses the RFQ's ID to determine category
    // In a real system, you would have a better fallback mechanism
    const industryIndex = (rfq.id % this.industries.length);
    const industry = this.industries[industryIndex];
    
    const industryCategories = this.categories.filter(c => c.industryId === industry.id);
    const categoryIndex = (rfq.id % industryCategories.length);
    const category = industryCategories[categoryIndex];
    
    log(`Using fallback categorization for RFQ #${rfq.id}: ${industry.name} / ${category.name}`, "rfq-categorization");
    
    return {
      industryId: industry.id,
      industryName: industry.name,
      categoryId: category.id,
      categoryName: category.name,
      confidence: 0.5, // Low confidence for fallback categorization
      method: "fallback"
    };
  }

  /**
   * Update an RFQ with categorization information
   * @param rfqId The ID of the RFQ to update
   * @param categoryId The category ID to assign
   * @param industryId The industry ID to assign
   * @returns Promise with the updated RFQ
   */
  async updateRfqCategorization(
    rfqId: number,
    categoryId: number,
    industryId: number
  ): Promise<Rfq> {
    try {
      // Update the RFQ in the database
      const [updatedRfq] = await db
        .update(rfqs)
        .set({
          categoryId,
          industryId,
          updatedAt: new Date()
        })
        .where(eq(rfqs.id, rfqId))
        .returning();
      
      log(`Updated RFQ #${rfqId} categorization: Industry=${industryId}, Category=${categoryId}`, "rfq-categorization");
      
      return updatedRfq;
    } catch (error) {
      log(`Error updating RFQ categorization: ${error.message}`, "rfq-categorization");
      throw new Error(`Failed to update RFQ categorization: ${error.message}`);
    }
  }
}

export const rfqCategorizationService = new RfqCategorizationService();