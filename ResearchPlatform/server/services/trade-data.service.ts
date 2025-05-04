/**
 * Trade Data Service
 * 
 * This service provides comprehensive import/export data for SMEs by leveraging
 * external APIs and internal data processing. It focuses on providing actionable
 * insights for businesses looking to expand into international markets.
 */

import axios from 'axios';
import { perplexityService } from './perplexity.service';
import { db } from '../db';
import { eq, and, desc, sql, inArray, or } from 'drizzle-orm';
import { 
  tradeData, 
  countries, 
  industries,
  tradeInsights,
  tradeReports,
  smeTradeData,
  tradeOpportunities
} from '@shared/schema';

// Custom error class for Trade Data API errors
export class TradeDataError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = "TradeDataError";
    this.statusCode = statusCode;
  }
}

export interface ImportExportData {
  country: string;
  year: number;
  exportValue: number;
  importValue: number;
  tradeBalance: number;
  topExportPartners: string[];
  topImportPartners: string[];
  topExportCategories: string[];
  topImportCategories: string[];
  exportGrowth: number;
  importGrowth: number;
}

export interface IndustryTradeData {
  industry: string;
  globalExports: number;
  globalImports: number;
  topExportingCountries: Array<{country: string, value: number}>;
  topImportingCountries: Array<{country: string, value: number}>;
  growthRate: number;
  marketSize: number;
  futureOutlook: string;
  regulatoryConsiderations: string[];
}

export interface TradeOpportunity {
  country: string;
  industry: string;
  opportunityType: 'export' | 'import' | 'partnership';
  potentialValue: number;
  growthPotential: 'high' | 'medium' | 'low';
  entryBarriers: string[];
  competitiveAdvantage: string;
  recommendedApproach: string;
}

export interface SMETradeData {
  country: string;
  industry: string;
  year: number;
  exportValue: number;
  importValue: number;
  marketSize: number;
  growthRate: number;
  exportBarriers: string[];
  importBarriers: string[];
  topMarkets: { market: string; potential: number; }[];
  competitivePosition: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  regulatoryInfo: {
    requirements: string[];
    certifications: string[];
    customsProcedures: string[];
  };
  businessSizeApplicability: ('micro' | 'small' | 'medium')[];
}

export interface SMETradeInsight {
  industry: string;
  businessSize: 'micro' | 'small' | 'medium';
  marketEntryStrategies: string[];
  financingOptions: string[];
  logisticsConsiderations: string[];
  regulatoryRequirements: string[];
  commonPitfalls: string[];
  successFactors: string[];
  caseStudies?: string[];
  recommendedApproach: string;
}

class TradeDataService {
  private cache: Map<string, {data: any, timestamp: number}> = new Map();
  private cacheTTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  constructor() {
    // Initialize service
    console.log('Trade Data Service initialized');
  }
  
  /**
   * Get comprehensive import/export data for a specific country
   */
  async getCountryTradeData(countryId: number, year?: number): Promise<ImportExportData[]> {
    try {
      // Try to get data from database first
      const query = year 
        ? db.select().from(tradeData).where(and(eq(tradeData.countryId, countryId), eq(tradeData.year, year)))
        : db.select().from(tradeData).where(eq(tradeData.countryId, countryId)).orderBy(desc(tradeData.year));
        
      const dbData = await query;
      
      // Get country information
      const [countryInfo] = await db.select().from(countries).where(eq(countries.id, countryId));
      
      if (!countryInfo) {
        throw new TradeDataError(`Country with ID ${countryId} not found`, 404);
      }
      
      // If we have data, format and return it
      if (dbData.length > 0) {
        return dbData.map(item => {
          // Calculate trade balance
          const tradeBalance = item.exports - item.imports;
          
          // Parse JSON strings
          const topExportCategories = JSON.parse(item.topExportCategories);
          const topImportCategories = JSON.parse(item.topImportCategories);
          const tradePartners = JSON.parse(item.tradePartners);
          
          // Extract top partners (assuming the tradePartners structure includes this information)
          const topExportPartners = tradePartners.exports || [];
          const topImportPartners = tradePartners.imports || [];
          
          return {
            country: countryInfo.name,
            year: item.year,
            exportValue: item.exports,
            importValue: item.imports,
            tradeBalance,
            topExportPartners,
            topImportPartners,
            topExportCategories,
            topImportCategories,
            exportGrowth: item.growthRate || 0, // This is simplified; ideally calculate YoY growth
            importGrowth: item.growthRate || 0  // This is simplified; ideally calculate YoY growth
          };
        });
      }
      
      // If no data in database, try to fetch from AI service
      const enrichedData = await this.generateTradeDataFromAI(countryInfo.name, year);
      return [enrichedData];
    } catch (error) {
      console.error('Error fetching country trade data:', error);
      throw new TradeDataError('Failed to fetch country trade data', 500);
    }
  }
  
  /**
   * Get industry-specific trade data globally or for a specific region
   */
  async getIndustryTradeData(industryId: number, region?: string): Promise<IndustryTradeData> {
    try {
      // Get industry information
      const [industryInfo] = await db.select().from(industries).where(eq(industries.id, industryId));
      
      if (!industryInfo) {
        throw new TradeDataError(`Industry with ID ${industryId} not found`, 404);
      }
      
      // Try to get relevant insights from database
      const insights = await db.select().from(tradeInsights)
        .where(sql`${tradeInsights.industries} LIKE ${`%${industryInfo.name}%`}`)
        .orderBy(desc(tradeInsights.date))
        .limit(5);
      
      // Generate industry trade data using AI if needed
      const cacheKey = `industry_${industryId}_${region || 'global'}`;
      const cachedData = this.cache.get(cacheKey);
      
      if (cachedData && (Date.now() - cachedData.timestamp < this.cacheTTL)) {
        return cachedData.data;
      }
      
      // If we don't have data or it's expired, generate new data
      const industryData = await this.generateIndustryTradeDataFromAI(industryInfo.name, region);
      
      // Cache the data
      this.cache.set(cacheKey, {
        data: industryData,
        timestamp: Date.now()
      });
      
      return industryData;
    } catch (error) {
      console.error('Error fetching industry trade data:', error);
      throw new TradeDataError('Failed to fetch industry trade data', 500);
    }
  }
  
  /**
   * Find trade opportunities for SMEs based on industry and country preferences
   */
  async findTradeOpportunities(industryId?: number, countryId?: number, opportunityType?: string): Promise<TradeOpportunity[]> {
    try {
      // Get required information
      let industryName: string | undefined;
      let countryName: string | undefined;
      
      if (industryId) {
        const [industryInfo] = await db.select().from(industries).where(eq(industries.id, industryId));
        industryName = industryInfo?.name;
      }
      
      if (countryId) {
        const [countryInfo] = await db.select().from(countries).where(eq(countries.id, countryId));
        countryName = countryInfo?.name;
      }
      
      // Generate opportunities using AI
      const opportunities = await this.generateTradeOpportunitiesFromAI(industryName, countryName, opportunityType as 'export' | 'import' | 'partnership' | undefined);
      
      return opportunities;
    } catch (error) {
      console.error('Error finding trade opportunities:', error);
      throw new TradeDataError('Failed to find trade opportunities', 500);
    }
  }
  
  /**
   * Get tailored SME-focused trade insights based on business size and industry
   */
  async getSMETradeInsights(industryId: number, businessSize: 'micro' | 'small' | 'medium' = 'small'): Promise<SMETradeInsight> {
    try {
      // Get industry information
      const [industryInfo] = await db.select().from(industries).where(eq(industries.id, industryId));
      
      if (!industryInfo) {
        throw new TradeDataError(`Industry with ID ${industryId} not found`, 404);
      }
      
      // Generate SME-specific insights using AI
      const insights = await this.generateSMEInsightsFromAI(industryInfo.name, businessSize);
      
      return insights;
    } catch (error) {
      console.error('Error fetching SME trade insights:', error);
      throw new TradeDataError('Failed to fetch SME trade insights', 500);
    }
  }
  
  /**
   * Get comprehensive SME-focused import/export data for industry and country
   */
  async getSMEImportExportData(
    industryId: number, 
    countryId?: number, 
    businessSize?: 'micro' | 'small' | 'medium'
  ): Promise<SMETradeData[]> {
    try {
      // Get industry information
      const [industryInfo] = await db.select().from(industries).where(eq(industries.id, industryId));
      
      if (!industryInfo) {
        throw new TradeDataError(`Industry with ID ${industryId} not found`, 404);
      }
      
      // Get optional country info
      let countryInfo = null;
      if (countryId) {
        const [country] = await db.select().from(countries).where(eq(countries.id, countryId));
        countryInfo = country;
      }
      
      // Try to get data from database first
      let query = db.select().from(smeTradeData)
        .where(eq(smeTradeData.industryId, industryId))
        .orderBy(desc(smeTradeData.year));
      
      if (countryId) {
        query = query.where(eq(smeTradeData.countryId, countryId));
      }
      
      if (businessSize) {
        // This will do a LIKE query on the JSON field to find records that include the business size
        query = query.where(sql`${smeTradeData.businessSizeApplicability} LIKE ${`%${businessSize}%`}`);
      }
      
      const smeData = await query;
      
      // If we found data in the database, format and return it
      if (smeData.length > 0) {
        return smeData.map(item => {
          return {
            country: countryInfo ? countryInfo.name : 'Global',
            industry: industryInfo.name,
            year: item.year,
            exportValue: item.exportValue,
            importValue: item.importValue,
            marketSize: item.marketSize || 0,
            growthRate: item.growthRate || 0,
            exportBarriers: JSON.parse(item.exportBarriers || '[]'),
            importBarriers: JSON.parse(item.importBarriers || '[]'),
            topMarkets: JSON.parse(item.topMarkets),
            competitivePosition: JSON.parse(item.competitivePosition || '{"strengths":[],"weaknesses":[],"opportunities":[],"threats":[]}'),
            regulatoryInfo: JSON.parse(item.regulatoryInfo || '{"requirements":[],"certifications":[],"customsProcedures":[]}'),
            businessSizeApplicability: JSON.parse(item.businessSizeApplicability)
          };
        });
      }
      
      // If not found in database, generate data using AI
      const generatedData = await this.generateSMETradeDataFromAI(
        industryInfo.name, 
        countryInfo ? countryInfo.name : undefined, 
        businessSize
      );
      
      // Store the generated data in the database for future use
      if (generatedData) {
        try {
          const insertData = {
            industryId,
            countryId: countryId || null,
            year: generatedData.year,
            exportValue: generatedData.exportValue,
            importValue: generatedData.importValue,
            marketSize: generatedData.marketSize,
            growthRate: generatedData.growthRate,
            exportBarriers: JSON.stringify(generatedData.exportBarriers),
            importBarriers: JSON.stringify(generatedData.importBarriers),
            topMarkets: JSON.stringify(generatedData.topMarkets),
            competitivePosition: JSON.stringify(generatedData.competitivePosition),
            regulatoryInfo: JSON.stringify(generatedData.regulatoryInfo),
            businessSizeApplicability: JSON.stringify(generatedData.businessSizeApplicability)
          };
          
          await db.insert(smeTradeData).values(insertData);
        } catch (dbError) {
          console.error('Error saving generated SME trade data to database:', dbError);
          // Continue with returning the data even if saving fails
        }
      }
      
      return [generatedData];
    } catch (error) {
      console.error('Error fetching SME import/export data:', error);
      throw new TradeDataError('Failed to fetch SME import/export data', 500);
    }
  }
  
  /**
   * Save a trade opportunity to the database
   */
  async saveTradeOpportunity(opportunity: Omit<InsertTradeOpportunity, 'id'>): Promise<TradeOpportunity> {
    try {
      const [savedOpportunity] = await db.insert(tradeOpportunities)
        .values(opportunity)
        .returning();
      
      return savedOpportunity;
    } catch (error) {
      console.error('Error saving trade opportunity:', error);
      throw new TradeDataError('Failed to save trade opportunity', 500);
    }
  }
  
  /**
   * Get trade opportunities from database with optional filtering
   */
  async getTradeOpportunitiesFromDB(
    industryId?: number, 
    countryId?: number, 
    opportunityType?: string,
    businessSize?: string
  ): Promise<TradeOpportunity[]> {
    try {
      let query = db.select().from(tradeOpportunities);
      
      // Apply filters if provided
      if (industryId) {
        query = query.where(eq(tradeOpportunities.industryId, industryId));
      }
      
      if (countryId) {
        query = query.where(eq(tradeOpportunities.countryId, countryId));
      }
      
      if (opportunityType) {
        query = query.where(eq(tradeOpportunities.opportunityType, opportunityType));
      }
      
      if (businessSize) {
        query = query.where(eq(tradeOpportunities.businessSize, businessSize));
      }
      
      const opportunities = await query;
      
      // Get country and industry names to include in the response
      const opportunityIds = opportunities.map(o => o.id);
      
      if (opportunityIds.length === 0) {
        return [];
      }
      
      // Fetch related data in a more efficient way
      const countryIds = opportunities.map(o => o.countryId).filter(id => id !== null);
      const industryIds = opportunities.map(o => o.industryId).filter(id => id !== null);
      
      const countryData = countryIds.length > 0 ? 
        await db.select().from(countries).where(inArray(countries.id, countryIds)) : 
        [];
        
      const industryData = industryIds.length > 0 ? 
        await db.select().from(industries).where(inArray(industries.id, industryIds)) : 
        [];
      
      // Map countries and industries for lookup
      const countryMap = new Map(countryData.map(c => [c.id, c.name]));
      const industryMap = new Map(industryData.map(i => [i.id, i.name]));
      
      // Format the opportunities with names instead of IDs
      return opportunities.map(opportunity => {
        return {
          id: opportunity.id,
          country: opportunity.countryId ? countryMap.get(opportunity.countryId) || 'Unknown' : 'Global',
          industry: opportunity.industryId ? industryMap.get(opportunity.industryId) || 'General' : 'All Industries',
          opportunityType: opportunity.opportunityType as 'export' | 'import' | 'partnership',
          title: opportunity.title,
          description: opportunity.description,
          potentialValue: opportunity.potentialValue || 0,
          growthPotential: opportunity.growthPotential as 'high' | 'medium' | 'low',
          entryBarriers: JSON.parse(opportunity.entryBarriers || '[]'),
          competitiveAdvantage: opportunity.competitiveAdvantage || '',
          recommendedApproach: opportunity.recommendedApproach || '',
          businessSize: opportunity.businessSize as 'micro' | 'small' | 'medium',
          timeframe: opportunity.timeframe || 'medium',
          riskLevel: opportunity.riskLevel || 'medium',
          createdAt: opportunity.createdAt
        };
      });
    } catch (error) {
      console.error('Error fetching trade opportunities from database:', error);
      throw new TradeDataError('Failed to fetch trade opportunities', 500);
    }
  }
  
  // AI-powered data generation methods
  
  /**
   * Generate country trade data using AI when database data is not available
   */
  private async generateTradeDataFromAI(countryName: string, year?: number): Promise<ImportExportData> {
    try {
      const yearString = year ? String(year) : 'recent';
      
      const messages = [
        {
          role: "system",
          content: "You are an expert global trade analyst specializing in import/export data. Generate factual, accurate trade data based on the most recent available statistics. Format output as JSON. Focus on practical insights for businesses."
        },
        {
          role: "user",
          content: `Generate comprehensive import/export trade data for ${countryName} for the ${yearString} year. Include total import/export values, trade balance, top trading partners, main export/import categories, and growth rates.`
        }
      ];
      
      // Use Perplexity for AI-generated data
      const response = await perplexityService.sendChatRequest({
        model: "llama-3.1-sonar-small-128k-online",
        messages,
        temperature: 0.1,
        max_tokens: 2000,
        stream: false
      });
      
      // Parse the AI response
      let result;
      try {
        // Try to parse JSON directly from the response
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback to treating entire response as JSON
          result = JSON.parse(response.content);
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Provide a basic structure if parsing fails
        result = {
          country: countryName,
          year: year || new Date().getFullYear() - 1,
          exportValue: 0,
          importValue: 0,
          tradeBalance: 0,
          topExportPartners: [],
          topImportPartners: [],
          topExportCategories: [],
          topImportCategories: [],
          exportGrowth: 0,
          importGrowth: 0
        };
      }
      
      // Ensure the response has the correct format
      return {
        country: countryName,
        year: result.year || year || new Date().getFullYear() - 1,
        exportValue: result.exportValue || result.exports || 0,
        importValue: result.importValue || result.imports || 0,
        tradeBalance: result.tradeBalance || 0,
        topExportPartners: result.topExportPartners || [],
        topImportPartners: result.topImportPartners || [],
        topExportCategories: result.topExportCategories || [],
        topImportCategories: result.topImportCategories || [],
        exportGrowth: result.exportGrowth || 0,
        importGrowth: result.importGrowth || 0
      };
    } catch (error) {
      console.error('Error generating trade data from AI:', error);
      // Return a placeholder structure
      return {
        country: countryName,
        year: year || new Date().getFullYear() - 1,
        exportValue: 0,
        importValue: 0,
        tradeBalance: 0,
        topExportPartners: [],
        topImportPartners: [],
        topExportCategories: [],
        topImportCategories: [],
        exportGrowth: 0,
        importGrowth: 0
      };
    }
  }
  
  /**
   * Generate industry-specific trade data using AI
   */
  private async generateIndustryTradeDataFromAI(industryName: string, region?: string): Promise<IndustryTradeData> {
    try {
      const regionString = region ? `in the ${region} region` : 'globally';
      
      const messages = [
        {
          role: "system",
          content: "You are an expert industry analyst specializing in global trade data. Generate factual, accurate industry trade data based on the most recent available statistics. Format output as JSON. Focus on practical insights for businesses."
        },
        {
          role: "user",
          content: `Generate comprehensive trade data for the ${industryName} industry ${regionString}. Include global export/import values, top exporting and importing countries, growth rates, market size, future outlook, and regulatory considerations.`
        }
      ];
      
      // Use Perplexity for AI-generated data
      const response = await perplexityService.sendChatRequest({
        model: "llama-3.1-sonar-small-128k-online",
        messages,
        temperature: 0.1,
        max_tokens: 2000,
        stream: false
      });
      
      // Parse the AI response
      let result;
      try {
        // Try to parse JSON directly from the response
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback to treating entire response as JSON
          result = JSON.parse(response.content);
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Provide a basic structure if parsing fails
        result = {
          industry: industryName,
          globalExports: 0,
          globalImports: 0,
          topExportingCountries: [],
          topImportingCountries: [],
          growthRate: 0,
          marketSize: 0,
          futureOutlook: "Data unavailable",
          regulatoryConsiderations: []
        };
      }
      
      // Ensure the response has the correct format
      return {
        industry: industryName,
        globalExports: result.globalExports || 0,
        globalImports: result.globalImports || 0,
        topExportingCountries: result.topExportingCountries || [],
        topImportingCountries: result.topImportingCountries || [],
        growthRate: result.growthRate || 0,
        marketSize: result.marketSize || 0,
        futureOutlook: result.futureOutlook || "Data unavailable",
        regulatoryConsiderations: result.regulatoryConsiderations || []
      };
    } catch (error) {
      console.error('Error generating industry trade data from AI:', error);
      // Return a placeholder structure
      return {
        industry: industryName,
        globalExports: 0,
        globalImports: 0,
        topExportingCountries: [],
        topImportingCountries: [],
        growthRate: 0,
        marketSize: 0,
        futureOutlook: "Data unavailable",
        regulatoryConsiderations: []
      };
    }
  }
  
  /**
   * Generate trade opportunities for SMEs using AI
   */
  private async generateTradeOpportunitiesFromAI(industryName?: string, countryName?: string, opportunityType?: 'export' | 'import' | 'partnership'): Promise<TradeOpportunity[]> {
    try {
      const industryString = industryName ? `in the ${industryName} industry` : 'across industries';
      const countryString = countryName ? `for ${countryName}` : 'globally';
      const typeString = opportunityType ? `focusing on ${opportunityType} opportunities` : 'including export, import, and partnership opportunities';
      
      const messages = [
        {
          role: "system",
          content: "You are an expert trade consultant specializing in finding opportunities for SMEs in global markets. Generate factual, specific, and actionable trade opportunities based on current market conditions. Format output as JSON. Focus on practical advice for small and medium enterprises."
        },
        {
          role: "user",
          content: `Identify 3-5 specific trade opportunities for SMEs ${industryString} ${countryString}, ${typeString}. For each opportunity, include the target country, industry, type of opportunity, potential value, growth potential, entry barriers, competitive advantages, and recommended approach.`
        }
      ];
      
      // Use Perplexity for AI-generated data
      const response = await perplexityService.sendChatRequest({
        model: "llama-3.1-sonar-small-128k-online",
        messages,
        temperature: 0.2,
        max_tokens: 2500,
        stream: false
      });
      
      // Parse the AI response
      let result = [];
      try {
        // Try to extract a JSON array from the response
        const jsonMatch = response.content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          // Try to extract an object with an opportunities array
          const objectMatch = response.content.match(/\{[\s\S]*\}/);
          if (objectMatch) {
            const obj = JSON.parse(objectMatch[0]);
            if (Array.isArray(obj.opportunities)) {
              result = obj.opportunities;
            } else if (Array.isArray(obj.results)) {
              result = obj.results;
            } else {
              // If no array found, treat the entire object as a single opportunity
              result = [obj];
            }
          }
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        result = [];
      }
      
      // Validate and format each opportunity
      return result.map((item: any) => ({
        country: item.country || countryName || "Global",
        industry: item.industry || industryName || "Various",
        opportunityType: item.opportunityType || item.type || opportunityType || 'export',
        potentialValue: item.potentialValue || item.value || 0,
        growthPotential: item.growthPotential || 'medium',
        entryBarriers: item.entryBarriers || item.barriers || [],
        competitiveAdvantage: item.competitiveAdvantage || item.advantage || "Not specified",
        recommendedApproach: item.recommendedApproach || item.approach || "Not specified"
      }));
    } catch (error) {
      console.error('Error generating trade opportunities from AI:', error);
      return [];
    }
  }
  
  /**
   * Generate SME trade data using AI
   */
  private async generateSMETradeDataFromAI(
    industryName: string, 
    countryName?: string, 
    businessSize?: 'micro' | 'small' | 'medium'
  ): Promise<SMETradeData> {
    try {
      const countryString = countryName ? `in ${countryName}` : 'globally';
      const businessSizeString = businessSize ? `for ${businessSize}-sized businesses` : 'for SMEs of all sizes';
      
      const messages = [
        {
          role: "system",
          content: "You are an expert SME trade consultant specializing in import/export data. Generate factual, accurate SME-focused trade data based on the most recent available information. Format output as JSON. Focus on practical insights for small and medium businesses looking to enter international markets."
        },
        {
          role: "user",
          content: `Generate comprehensive import/export data for the ${industryName} industry ${countryString} ${businessSizeString}. Include export/import values, market size, growth rate, export/import barriers, top markets, competitive position (SWOT), regulatory information, and business size applicability.`
        }
      ];
      
      // Use Perplexity for AI-generated data
      const response = await perplexityService.sendChatRequest({
        model: "llama-3.1-sonar-small-128k-online",
        messages,
        temperature: 0.1,
        max_tokens: 2000,
        stream: false
      });
      
      // Parse the AI response
      let result;
      try {
        // Try to parse JSON directly from the response
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback to treating entire response as JSON
          result = JSON.parse(response.content);
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Provide a basic structure if parsing fails
        result = {
          country: countryName || 'Global',
          industry: industryName,
          year: new Date().getFullYear(),
          exportValue: 0,
          importValue: 0,
          marketSize: 0,
          growthRate: 0,
          exportBarriers: [],
          importBarriers: [],
          topMarkets: [],
          competitivePosition: {
            strengths: [],
            weaknesses: [],
            opportunities: [],
            threats: []
          },
          regulatoryInfo: {
            requirements: [],
            certifications: [],
            customsProcedures: []
          },
          businessSizeApplicability: businessSize ? [businessSize] : ['micro', 'small', 'medium']
        };
      }
      
      // Format and return the data
      return {
        country: countryName || 'Global',
        industry: industryName,
        year: result.year || new Date().getFullYear(),
        exportValue: result.exportValue || 0,
        importValue: result.importValue || 0,
        marketSize: result.marketSize || 0,
        growthRate: result.growthRate || 0,
        exportBarriers: result.exportBarriers || [],
        importBarriers: result.importBarriers || [],
        topMarkets: result.topMarkets || [],
        competitivePosition: result.competitivePosition || {
          strengths: [],
          weaknesses: [],
          opportunities: [],
          threats: []
        },
        regulatoryInfo: result.regulatoryInfo || {
          requirements: [],
          certifications: [],
          customsProcedures: []
        },
        businessSizeApplicability: result.businessSizeApplicability || 
          (businessSize ? [businessSize] : ['micro', 'small', 'medium'])
      };
    } catch (error) {
      console.error('Error generating SME trade data from AI:', error);
      // Return a placeholder structure
      return {
        country: countryName || 'Global',
        industry: industryName,
        year: new Date().getFullYear(),
        exportValue: 0,
        importValue: 0,
        marketSize: 0,
        growthRate: 0,
        exportBarriers: [],
        importBarriers: [],
        topMarkets: [],
        competitivePosition: {
          strengths: [],
          weaknesses: [],
          opportunities: [],
          threats: []
        },
        regulatoryInfo: {
          requirements: [],
          certifications: [],
          customsProcedures: []
        },
        businessSizeApplicability: businessSize ? [businessSize] : ['micro', 'small', 'medium']
      };
    }
  }

  /**
   * Generate SME-specific trade insights using AI
   */
  private async generateSMEInsightsFromAI(industryName: string, businessSize: 'micro' | 'small' | 'medium'): Promise<SMETradeInsight> {
    try {
      const messages = [
        {
          role: "system",
          content: "You are an expert global trade consultant specializing in helping SMEs enter international markets. Generate factual, specific, and actionable insights based on current market conditions. Format output as JSON. Focus on practical advice tailored to business size."
        },
        {
          role: "user",
          content: `Generate comprehensive trade insights for ${businessSize}-sized businesses in the ${industryName} industry looking to expand internationally. Include market entry strategies, financing options, logistics considerations, regulatory requirements, and common pitfalls to avoid.`
        }
      ];
      
      // Use Perplexity for AI-generated data
      const response = await perplexityService.sendChatRequest({
        model: "llama-3.1-sonar-small-128k-online",
        messages,
        temperature: 0.1,
        max_tokens: 2500,
        stream: false
      });
      
      // Parse the AI response
      let result;
      try {
        // Try to parse JSON directly from the response
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback to treating entire response as JSON
          result = JSON.parse(response.content);
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Create a structured result from the text response
        result = {
          industry: industryName,
          businessSize: businessSize,
          insights: response.content,
          generatedAt: new Date().toISOString()
        };
      }
      
      // Convert to SMETradeInsight format
      return {
        industry: industryName,
        businessSize,
        marketEntryStrategies: result.marketEntryStrategies || [],
        financingOptions: result.financingOptions || [],
        logisticsConsiderations: result.logisticsConsiderations || [],
        regulatoryRequirements: result.regulatoryRequirements || [],
        commonPitfalls: result.commonPitfalls || [],
        successFactors: result.successFactors || [],
        caseStudies: result.caseStudies || [],
        recommendedApproach: result.recommendedApproach || "Consult with an industry expert for detailed guidance."
      };
    } catch (error) {
      console.error('Error generating SME insights from AI:', error);
      return {
        industry: industryName,
        businessSize,
        marketEntryStrategies: [],
        financingOptions: [],
        logisticsConsiderations: [],
        regulatoryRequirements: [],
        commonPitfalls: [],
        successFactors: [],
        recommendedApproach: "Unable to generate insights at this time. Please try again later."
      };
    }
  }
}

// Export a singleton instance
export const tradeDataService = new TradeDataService();