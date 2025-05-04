import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Process voice RFQ to convert audio to text and extract key information
export async function processVoiceRFQ(audioBase64: string): Promise<{
  text: string;
  extractedInfo: {
    title: string;
    description: string;
    category: string;
    quantity: number;
    budget?: number;
    deliveryDeadline?: string;
  };
}> {
  try {
    // Convert base64 audio to buffer for OpenAI
    const buffer = Buffer.from(audioBase64, 'base64');
    const audioBlob = new Blob([buffer]);
    
    // Transcribe audio to text
    const transcription = await openai.audio.transcriptions.create({
      file: audioBlob as any,
      model: "whisper-1",
    });

    const transcribedText = transcription.text;

    // Extract RFQ information using GPT-4
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an assistant that extracts key information from voice RFQs (Request for Quotes). 
          Extract the following information and format as JSON:
          - title: A concise title for the RFQ (string)
          - description: Full description of the requirements (string)
          - category: The product/service category (string)
          - quantity: The quantity required (number)
          - budget: The budget if mentioned (number, optional)
          - deliveryDeadline: The delivery deadline if mentioned (string in YYYY-MM-DD format, optional)
          
          If information is not explicitly provided, make reasonable inferences from context.`
        },
        {
          role: "user",
          content: transcribedText
        }
      ],
      response_format: { type: "json_object" }
    });

    const extractedInfo = JSON.parse(response.choices[0].message.content);

    return {
      text: transcribedText,
      extractedInfo
    };
  } catch (error: any) {
    console.error("Error processing voice RFQ:", error);
    throw new Error(`Failed to process voice RFQ: ${error.message}`);
  }
}

// Analyze supplier risk based on available data
export async function analyzeSupplierRisk(supplierData: {
  supplier: string;
  company: string;
  industry: string;
  years_in_business: number;
  previous_contracts?: number;
  delivery_performance?: number;
}): Promise<{
  supplier: string;
  company: string;
  risk_score: number;
  analysis: string;
  risk_factors: string[];
  recommendations: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a risk analysis expert for B2B procurement. Analyze the supplier data and provide:
          1. A risk score from 0-100 (where 0 is lowest risk, 100 is highest)
          2. A brief analysis paragraph
          3. Key risk factors (3-5 bullet points)
          4. Recommendations for risk mitigation (3-5 bullet points)
          
          Format the response as JSON with the following structure:
          {
            "supplier": string,
            "company": string,
            "risk_score": number,
            "analysis": string,
            "risk_factors": string[],
            "recommendations": string[]
          }
          
          Consider factors like industry, years in business, previous contracts, delivery performance, etc.`
        },
        {
          role: "user",
          content: JSON.stringify(supplierData)
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error: any) {
    console.error("Error analyzing supplier risk:", error);
    throw new Error(`Failed to analyze supplier risk: ${error.message}`);
  }
}

// Generate market insights for specific industry
export async function generateMarketInsights(industry: string): Promise<{
  industry: string;
  market_size: string;
  growth_rate: string;
  key_trends: string[];
  major_players: { name: string; market_share: string }[];
  opportunities: string[];
  challenges: string[];
  forecast: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a market research expert providing insights on specific industries. 
          For the given industry, provide comprehensive market insights in the following JSON format:
          
          {
            "industry": string,
            "market_size": string (include currency and year),
            "growth_rate": string (include percentage and timeframe),
            "key_trends": string[] (5-7 trends),
            "major_players": [
              { "name": string, "market_share": string (percentage) }
            ] (4-6 players),
            "opportunities": string[] (3-5 points),
            "challenges": string[] (3-5 points),
            "forecast": string (brief future outlook)
          }
          
          Keep the insights specific, data-driven (use realistic estimates), and actionable for business decision-making.`
        },
        {
          role: "user",
          content: `Generate detailed market insights for the ${industry} industry.`
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error: any) {
    console.error("Error generating market insights:", error);
    throw new Error(`Failed to generate market insights: ${error.message}`);
  }
}

// Analyze RFQ content to extract key information and make recommendations
export async function analyzeRFQ(rfqText: string): Promise<{
  analysis: string;
  key_requirements: string[];
  suggested_categories: string[];
  estimated_budget_range: { min: number; max: number };
  potential_suppliers: string[];
  recommendations: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a procurement specialist who analyzes RFQs (Request for Quotes) to extract key information and make recommendations.
          Given an RFQ text, provide the following analysis in JSON format:
          
          {
            "analysis": string (brief summary of the RFQ),
            "key_requirements": string[] (3-5 main requirements),
            "suggested_categories": string[] (2-3 relevant product/service categories),
            "estimated_budget_range": { "min": number, "max": number } (in USD),
            "potential_suppliers": string[] (3-5 generic supplier types that might be suitable),
            "recommendations": string[] (3-5 suggestions to improve the RFQ or procurement process)
          }
          
          Make reasonable inferences where information is not explicit.`
        },
        {
          role: "user",
          content: rfqText
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error: any) {
    console.error("Error analyzing RFQ:", error);
    throw new Error(`Failed to analyze RFQ: ${error.message}`);
  }
}