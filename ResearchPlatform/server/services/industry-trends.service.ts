import { db } from "../db";
import { 
  IndustryTrendSnapshot, 
  featuredIndustries, 
  industries, 
  industryTrendSnapshots, 
  reportTemplates, 
  trendSubscriptions 
} from "../../shared/schema";
import { eq, desc, inArray } from "drizzle-orm";
import OpenAI from "openai";
import { perplexityService } from "./perplexity.service";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Service for handling industry trend generation and management
 */
export class IndustryTrendsService {
  /**
   * Generate a one-click trend snapshot for a given industry
   * 
   * @param industry Industry to generate trends for
   * @param region Optional region to focus on
   * @param userId User ID of the requesting user
   * @returns Generated industry trend snapshot
   */
  async generateOneClickSnapshot(industry: string, region?: string, userId?: number): Promise<IndustryTrendSnapshot> {
    // Get default template
    const template = await this.getDefaultTemplate();
    
    if (!template) {
      throw new Error("No default template found for trend generation");
    }
    
    // Generate snapshot using OpenAI
    const snapshotData = await this.generateSnapshotData(industry, region);
    
    // Create new snapshot in database
    const [snapshot] = await db.insert(industryTrendSnapshots).values({
      userId,
      industry,
      region: region || null,
      timeframe: "Current",
      snapshotData,
      templateId: template.id,
      visibility: "private",
      format: "standard",
      version: 1,
      generatedAt: new Date(),
    }).returning();
    
    return snapshot;
  }
  
  /**
   * Get the default template for trend reports
   */
  private async getDefaultTemplate() {
    const [template] = await db.select().from(reportTemplates).where(eq(reportTemplates.isDefault, true)).limit(1);
    return template;
  }
  
  /**
   * Generate snapshot data using AI service (Perplexity if available, fallback to OpenAI)
   */
  private async generateSnapshotData(industry: string, region?: string) {
    // First try to use Perplexity API if the key is available
    if (process.env.PERPLEXITY_API_KEY) {
      try {
        console.log("Generating industry trend snapshot with Perplexity API");
        return await perplexityService.generateIndustryTrendAnalysis(industry, region);
      } catch (error) {
        console.error("Error generating snapshot with Perplexity:", error);
        console.log("Falling back to OpenAI for snapshot generation");
        // Fall back to OpenAI if Perplexity fails
      }
    }
    
    // Use OpenAI as fallback or primary if Perplexity is not configured
    try {
      const regionSpecificPrompt = region 
        ? `Focus specifically on the ${region} region.` 
        : "Include global perspective with regional highlights where relevant.";
      
      console.log("Generating industry trend snapshot with OpenAI");
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an expert industry analyst with deep knowledge of market trends, competitive landscapes, and business intelligence. 
            Provide comprehensive, well-structured, and data-driven analysis. 
            Format your response as JSON with the following structure:
            {
              "summary": "Brief executive summary of key findings",
              "marketSize": {
                "current": "Current market size with value in USD",
                "projected": "Projected market size with value in USD",
                "cagr": "Compound Annual Growth Rate"
              },
              "keyPlayers": [
                {"name": "Company Name", "marketShare": "percentage", "keyStrength": "Brief description"},
                ...
              ],
              "trendAnalysis": [
                {"trend": "Trend name", "description": "Description", "impact": "High/Medium/Low"},
                ...
              ],
              "regionalInsights": [
                {"region": "Region name", "insight": "Key regional insight"},
                ...
              ],
              "emergingTechnologies": [
                {"technology": "Technology name", "maturity": "Early/Growing/Mature", "potentialImpact": "High/Medium/Low"},
                ...
              ],
              "regulatoryFactors": [
                {"factor": "Regulatory factor", "description": "Brief description", "regions": ["Region1", "Region2"]}
              ],
              "opportunitiesAndChallenges": {
                "opportunities": ["Opportunity 1", "Opportunity 2", ...],
                "challenges": ["Challenge 1", "Challenge 2", ...]
              },
              "forecastAndOutlook": "Detailed 2-3 year outlook"
            }`
          },
          {
            role: "user",
            content: `Generate a comprehensive industry trend snapshot for the ${industry} industry. ${regionSpecificPrompt} Include current market size, key players, emerging trends, technological disruptions, regulatory factors, and a 2-3 year forecast. The analysis should be actionable for business decision-makers.`
          }
        ],
        temperature: 0.2,
        max_tokens: 2500,
        response_format: { type: "json_object" }
      });
      
      // Parse the JSON response
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Empty response from OpenAI");
      }
      return JSON.parse(content);
    } catch (error) {
      console.error("Error generating snapshot with OpenAI:", error);
      throw new Error("Failed to generate industry trend snapshot. Please try again later.");
    }
  }
  
  /**
   * Get featured industries for the one-click generator
   */
  async getFeaturedIndustries() {
    const featured = await db.select().from(featuredIndustries)
      .where(eq(featuredIndustries.isActive, true))
      .orderBy(featuredIndustries.displayOrder);
      
    return featured;
  }
  
  /**
   * Get all available industries for selection
   */
  async getAllIndustries() {
    const allIndustries = await db.select().from(industries);
    return allIndustries;
  }
  
  /**
   * Subscribe to weekly industry trend updates
   */
  async subscribeTrendUpdates(email: string, industryId: number, userId?: number) {
    // Check if subscription already exists
    const existingSubscription = await db.select()
      .from(trendSubscriptions)
      .where(eq(trendSubscriptions.email, email))
      .where(eq(trendSubscriptions.industryId, industryId))
      .limit(1);
      
    if (existingSubscription.length > 0) {
      // If subscription exists but is inactive, reactivate it
      if (!existingSubscription[0].isActive) {
        await db.update(trendSubscriptions)
          .set({ isActive: true })
          .where(eq(trendSubscriptions.id, existingSubscription[0].id));
      }
      
      return existingSubscription[0];
    }
    
    // Create new subscription
    const [subscription] = await db.insert(trendSubscriptions).values({
      email,
      industryId,
      userId,
      frequency: "weekly",
      format: "html",
      isActive: true,
    }).returning();
    
    return subscription;
  }
  
  /**
   * Unsubscribe from trend updates
   */
  async unsubscribeTrendUpdates(subscriptionId: number) {
    await db.update(trendSubscriptions)
      .set({ isActive: false })
      .where(eq(trendSubscriptions.id, subscriptionId));
      
    return { success: true };
  }
  
  /**
   * Get user's recent snapshots
   */
  async getUserSnapshots(userId: number, limit: number = 5) {
    const snapshots = await db.select().from(industryTrendSnapshots)
      .where(eq(industryTrendSnapshots.userId, userId))
      .orderBy(desc(industryTrendSnapshots.generatedAt))
      .limit(limit);
      
    return snapshots;
  }
  
  /**
   * Get a specific snapshot by ID
   */
  async getSnapshotById(id: number) {
    const [snapshot] = await db.select().from(industryTrendSnapshots)
      .where(eq(industryTrendSnapshots.id, id))
      .limit(1);
      
    return snapshot;
  }
  
  /**
   * Share a snapshot by making it public
   */
  async shareSnapshot(id: number) {
    const [snapshot] = await db.update(industryTrendSnapshots)
      .set({ 
        visibility: "public", 
        sharedCount: db.raw`${industryTrendSnapshots.sharedCount} + 1`,
        lastSharedAt: new Date()
      })
      .where(eq(industryTrendSnapshots.id, id))
      .returning();
      
    return snapshot;
  }
  
  /**
   * Create a new default template if none exists
   */
  async ensureDefaultTemplateExists() {
    const existingDefault = await db.select().from(reportTemplates)
      .where(eq(reportTemplates.isDefault, true))
      .limit(1);
      
    if (existingDefault.length > 0) {
      return existingDefault[0];
    }
    
    // Create default template
    const defaultTemplate = {
      name: "Standard Industry Analysis",
      description: "Comprehensive industry analysis template with market size, trends, and forecasts",
      structure: {
        sections: [
          {
            title: "Executive Summary",
            field: "summary",
            isRequired: true
          },
          {
            title: "Market Size & Growth",
            field: "marketSize",
            isRequired: true
          },
          {
            title: "Key Players",
            field: "keyPlayers",
            isRequired: true
          },
          {
            title: "Trend Analysis",
            field: "trendAnalysis",
            isRequired: true
          },
          {
            title: "Regional Insights",
            field: "regionalInsights",
            isRequired: true
          },
          {
            title: "Emerging Technologies",
            field: "emergingTechnologies",
            isRequired: true
          },
          {
            title: "Regulatory Landscape",
            field: "regulatoryFactors",
            isRequired: false
          },
          {
            title: "Opportunities & Challenges",
            field: "opportunitiesAndChallenges",
            isRequired: true
          },
          {
            title: "Forecast & Outlook",
            field: "forecastAndOutlook",
            isRequired: true
          }
        ]
      },
      isDefault: true,
    };
    
    const [template] = await db.insert(reportTemplates).values(defaultTemplate).returning();
    return template;
  }
  
  /**
   * Initialize featured industries if none exist
   */
  async initializeFeaturedIndustries() {
    const count = await db.select().from(featuredIndustries).limit(1);
    
    if (count.length > 0) {
      return; // Featured industries already exist
    }
    
    const defaultIndustries = [
      {
        name: "Renewable Energy",
        description: "Solar, wind, hydro, and other renewable energy sources",
        icon: "solar",
        marketSize: "$1.1 Trillion",
        growth: "8.5% CAGR",
        isActive: true,
        displayOrder: 1
      },
      {
        name: "Electric Vehicles",
        description: "Electric vehicles and supporting infrastructure",
        icon: "car-electric",
        marketSize: "$380 Billion",
        growth: "18.2% CAGR",
        isActive: true,
        displayOrder: 2
      },
      {
        name: "Healthcare Technology",
        description: "Medical devices, telehealth, and health IT solutions",
        icon: "stethoscope",
        marketSize: "$270 Billion",
        growth: "14.5% CAGR",
        isActive: true,
        displayOrder: 3
      },
      {
        name: "Artificial Intelligence",
        description: "AI software, services, and hardware solutions",
        icon: "brain-circuit",
        marketSize: "$190 Billion",
        growth: "37.3% CAGR",
        isActive: true,
        displayOrder: 4
      },
      {
        name: "Manufacturing Automation",
        description: "Industrial automation and smart manufacturing",
        icon: "factory",
        marketSize: "$220 Billion",
        growth: "9.8% CAGR",
        isActive: true,
        displayOrder: 5
      },
      {
        name: "Sustainable Agriculture",
        description: "Precision farming, vertical farming, and agtech",
        icon: "seedling",
        marketSize: "$15.8 Billion",
        growth: "12.1% CAGR",
        isActive: true,
        displayOrder: 6
      }
    ];
    
    await db.insert(featuredIndustries).values(defaultIndustries);
  }
}

export const industryTrendsService = new IndustryTrendsService();