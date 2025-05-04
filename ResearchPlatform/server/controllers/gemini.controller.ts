import { Request, Response } from 'express';
import { geminiClient } from '../utils/gemini';

export const generateText = async (req: Request, res: Response) => {
  try {
    const { prompt, maxTokens, temperature, model } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await geminiClient.generateContent({
      prompt,
      maxTokens,
      temperature,
      model
    });

    res.json(response);
  } catch (error: any) {
    console.error('Error in generateText controller:', error);
    res.status(500).json({ error: error.message || 'Error generating text with Gemini' });
  }
};

export const analyzeIndustryTrends = async (req: Request, res: Response) => {
  try {
    const { industry, region, timeframe } = req.body;

    if (!industry) {
      return res.status(400).json({ error: 'Industry is required' });
    }

    const prompt = `Provide a comprehensive industry trend analysis for the ${industry} industry${
      region ? ` in ${region}` : ''
    }${timeframe ? ` for the ${timeframe} period` : ''}.
    
    Include current market size, growth rate, key players, market shares, 
    disruptive forces, opportunities, and challenges.
    
    Format your response as a structured JSON object with the following fields:
    - industry: the name of the industry
    - date: the current date in ISO format
    - trends: an array of trend objects, each with title, description, impactScore (1-10), and relevantRegions
    - marketSize: object with currentValue (number), currency (string), growthRate (percentage), forecastYear (year)
    - keyPlayers: array of objects, each with name, marketShare (percentage), and recentDevelopments
    - disruptiveForces: array of strings describing key disruptions
    - opportunities: array of strings describing opportunities
    - challenges: array of strings describing challenges
    - summary: a brief executive summary of the overall analysis`;

    const response = await geminiClient.generateStructuredOutput(prompt);
    res.json(response);
  } catch (error: any) {
    console.error('Error in analyzeIndustryTrends controller:', error);
    res.status(500).json({ error: error.message || 'Error analyzing industry trends' });
  }
};

export const categorizeRfq = async (req: Request, res: Response) => {
  try {
    const { rfqText } = req.body;

    if (!rfqText) {
      return res.status(400).json({ error: 'RFQ text is required' });
    }

    const prompt = `Analyze the following Request for Quote (RFQ) and categorize it:
    
    ${rfqText}
    
    Format your response as a JSON object with the following schema:
    {
      "category": "primary category",
      "subCategory": "sub-category",
      "confidence": confidence score between 0 and 1,
      "tags": [relevant tags array],
      "potentialSuppliers": [array of potential supplier types],
      "estimatedValue": {
        "min": minimum value estimate,
        "max": maximum value estimate,
        "currency": "currency code"
      },
      "complexity": "low|medium|high",
      "timeline": {
        "estimatedDays": estimated days to fulfill,
        "urgency": "low|medium|high"
      }
    }`;

    const response = await geminiClient.generateStructuredOutput(prompt);
    res.json(response);
  } catch (error: any) {
    console.error('Error in categorizeRfq controller:', error);
    res.status(500).json({ error: error.message || 'Error categorizing RFQ' });
  }
};

export const matchSuppliers = async (req: Request, res: Response) => {
  try {
    const { rfqData, count = 5 } = req.body;

    if (!rfqData) {
      return res.status(400).json({ error: 'RFQ data is required' });
    }

    const prompt = `Based on the following RFQ data, recommend the top ${count} most suitable supplier types 
    that would be a good match for this request:
    
    ${JSON.stringify(rfqData, null, 2)}
    
    For each supplier type, provide:
    1. Name of supplier type
    2. Match score (between 0-100)
    3. Key strengths for this RFQ
    4. Potential challenges
    5. Recommendations for successful engagement
    
    Format as a JSON array of supplier objects.`;

    const response = await geminiClient.generateStructuredOutput(prompt);
    res.json(response);
  } catch (error: any) {
    console.error('Error in matchSuppliers controller:', error);
    res.status(500).json({ error: error.message || 'Error matching suppliers' });
  }
};

export const analyzeBusinessTrends = async (req: Request, res: Response) => {
  try {
    const { businessName, industry } = req.body;

    if (!businessName) {
      return res.status(400).json({ error: 'Business name is required' });
    }

    const prompt = `Provide a detailed analysis for ${businessName}${
      industry ? ` in the ${industry} industry` : ''
    }.
    
    Include:
    - Company overview
    - Recent business developments
    - Market position
    - Strengths and weaknesses
    - Growth opportunities
    - Business challenges
    - Key partnerships and collaborations
    - Technology adoption
    - Future outlook
    
    Format your response as a structured JSON object.`;

    const response = await geminiClient.generateStructuredOutput(prompt);
    res.json(response);
  } catch (error: any) {
    console.error('Error in analyzeBusinessTrends controller:', error);
    res.status(500).json({ error: error.message || 'Error analyzing business trends' });
  }
};