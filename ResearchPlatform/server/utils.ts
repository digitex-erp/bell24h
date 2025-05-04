import { Request } from "express";
import { User } from "../shared/schema";

/**
 * Extended Request interface with authenticated user information
 */
export interface AuthRequest extends Request {
  user?: User;
  isAuthenticated(): boolean;
}

/**
 * Utility function to check if a request is from an authenticated user
 * 
 * @param req Express request object
 * @returns True if request has an authenticated user
 */
export function isAuthenticated(req: Request): boolean {
  return !!(req as AuthRequest).user;
}

/**
 * Generate a secure random token of specified length
 * 
 * @param length Token length (default: 32)
 * @returns Random token string
 */
export function generateToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }
  
  return result;
}

/**
 * Format a date to YYYY-MM-DD string
 * 
 * @param date Date object or string
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Generate OpenAI message content for industry trend analysis
 * 
 * @param industry Industry name
 * @param region Optional region name
 * @returns Prompt for AI analysis
 */
export function generateIndustryTrendPrompt(industry: string, region?: string): string {
  const regionPrompt = region 
    ? `Focus on the ${region} region specifically.` 
    : 'Provide a global perspective with regional highlights where relevant.';
  
  return `Generate a comprehensive industry trend analysis for the ${industry} industry. ${regionPrompt}
  
  Include:
  1. Current market size and growth projections
  2. Key market players and their market shares
  3. Emerging trends and technological disruptions
  4. Regulatory factors affecting the industry
  5. Opportunities and challenges for market participants
  6. 2-3 year forecast and outlook
  
  The analysis should be data-driven, actionable, and suitable for business decision-makers.`;
}