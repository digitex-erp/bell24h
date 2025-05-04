import { Request, Response } from 'express';
import { tradeDataService } from '../services/trade-data.service';
import { db } from '../db';
import { countries, industries } from '@shared/schema';
import { z } from 'zod';

// Country endpoints
export async function getAllCountries(req: Request, res: Response) {
  try {
    const countriesList = await db.select().from(countries);
    res.json(countriesList);
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
}

export async function getCountryTradeData(req: Request, res: Response) {
  try {
    const countryId = parseInt(req.params.id);
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    
    if (isNaN(countryId)) {
      return res.status(400).json({ error: 'Invalid country ID' });
    }
    
    const tradeData = await tradeDataService.getCountryTradeData(countryId, year);
    res.json(tradeData);
  } catch (error: any) {
    console.error('Error fetching country trade data:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message || 'Failed to fetch country trade data' });
  }
}

// Industry endpoints
export async function getAllIndustries(req: Request, res: Response) {
  try {
    const industriesList = await db.select().from(industries);
    res.json(industriesList);
  } catch (error) {
    console.error('Error fetching industries:', error);
    res.status(500).json({ error: 'Failed to fetch industries' });
  }
}

export async function getIndustryTradeData(req: Request, res: Response) {
  try {
    const industryId = parseInt(req.params.id);
    const region = req.query.region as string | undefined;
    
    if (isNaN(industryId)) {
      return res.status(400).json({ error: 'Invalid industry ID' });
    }
    
    const tradeData = await tradeDataService.getIndustryTradeData(industryId, region);
    res.json(tradeData);
  } catch (error: any) {
    console.error('Error fetching industry trade data:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message || 'Failed to fetch industry trade data' });
  }
}

// SME-specific endpoints
export async function getSMETradeInsights(req: Request, res: Response) {
  try {
    const industryId = parseInt(req.params.id);
    const businessSize = req.query.size as 'micro' | 'small' | 'medium' | undefined;
    
    if (isNaN(industryId)) {
      return res.status(400).json({ error: 'Invalid industry ID' });
    }
    
    // Validate business size
    if (businessSize && !['micro', 'small', 'medium'].includes(businessSize)) {
      return res.status(400).json({ error: 'Invalid business size. Must be micro, small, or medium' });
    }
    
    const insights = await tradeDataService.getSMETradeInsights(
      industryId, 
      businessSize || 'small'
    );
    
    res.json(insights);
  } catch (error: any) {
    console.error('Error fetching SME trade insights:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message || 'Failed to fetch SME trade insights' });
  }
}

export async function getSMEImportExportData(req: Request, res: Response) {
  try {
    const industryId = parseInt(req.params.id);
    const countryId = req.query.country ? parseInt(req.query.country as string) : undefined;
    const businessSize = req.query.size as 'micro' | 'small' | 'medium' | undefined;
    
    if (isNaN(industryId)) {
      return res.status(400).json({ error: 'Invalid industry ID' });
    }
    
    if (countryId !== undefined && isNaN(countryId)) {
      return res.status(400).json({ error: 'Invalid country ID' });
    }
    
    // Validate business size
    if (businessSize && !['micro', 'small', 'medium'].includes(businessSize)) {
      return res.status(400).json({ error: 'Invalid business size. Must be micro, small, or medium' });
    }
    
    const smeData = await tradeDataService.getSMEImportExportData(
      industryId,
      countryId,
      businessSize
    );
    
    res.json(smeData);
  } catch (error: any) {
    console.error('Error fetching SME import/export data:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message || 'Failed to fetch SME import/export data' });
  }
}

// Trade opportunities endpoints
export async function getTradeOpportunities(req: Request, res: Response) {
  try {
    const industryId = req.query.industry ? parseInt(req.query.industry as string) : undefined;
    const countryId = req.query.country ? parseInt(req.query.country as string) : undefined;
    const opportunityType = req.query.type as string | undefined;
    const businessSize = req.query.size as string | undefined;
    
    if (industryId !== undefined && isNaN(industryId)) {
      return res.status(400).json({ error: 'Invalid industry ID' });
    }
    
    if (countryId !== undefined && isNaN(countryId)) {
      return res.status(400).json({ error: 'Invalid country ID' });
    }
    
    // Try to get opportunities from the database first
    const dbOpportunities = await tradeDataService.getTradeOpportunitiesFromDB(
      industryId,
      countryId,
      opportunityType,
      businessSize
    );
    
    // If we have enough opportunities from the database, return them
    if (dbOpportunities.length >= 3) {
      return res.json(dbOpportunities);
    }
    
    // Otherwise, generate some opportunities using AI
    const opportunities = await tradeDataService.findTradeOpportunities(
      industryId,
      countryId,
      opportunityType
    );
    
    res.json(opportunities);
  } catch (error: any) {
    console.error('Error fetching trade opportunities:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message || 'Failed to fetch trade opportunities' });
  }
}

export async function saveTradeOpportunity(req: Request, res: Response) {
  try {
    // Validate request body
    const schema = z.object({
      countryId: z.number().optional(),
      industryId: z.number().optional(),
      title: z.string().min(1),
      description: z.string().min(1),
      opportunityType: z.enum(['export', 'import', 'partnership']),
      potentialValue: z.number().optional(),
      growthPotential: z.enum(['high', 'medium', 'low']),
      entryBarriers: z.string().optional(),
      competitiveAdvantage: z.string().optional(),
      recommendedApproach: z.string().optional(),
      businessSize: z.enum(['micro', 'small', 'medium']).optional(),
      timeframe: z.enum(['short', 'medium', 'long']).optional(),
      riskLevel: z.enum(['high', 'medium', 'low']).optional()
    });
    
    const validatedData = schema.parse(req.body);
    
    // Parse JSON strings if provided
    if (typeof validatedData.entryBarriers === 'string') {
      validatedData.entryBarriers = JSON.stringify(JSON.parse(validatedData.entryBarriers));
    }
    
    const savedOpportunity = await tradeDataService.saveTradeOpportunity(validatedData);
    res.status(201).json(savedOpportunity);
  } catch (error: any) {
    console.error('Error saving trade opportunity:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: error.message || 'Failed to save trade opportunity' });
  }
}