import OpenAI from 'openai';

// Create OpenAI client
// Note: This assumes the OpenAI API key is provided in environment variables
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Check if OpenAI API key exists
if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY is not set. Voice and AI features will not work properly.');
}

/**
 * Processes a voice-based RFQ submission
 * @param audioBase64 Base64-encoded audio data
 * @returns Transcription and extracted RFQ information
 */
export async function processVoiceRFQ(audioBase64: string) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured.');
    }

    // Convert base64 to Buffer
    const audioBuffer = Buffer.from(audioBase64, 'base64');

    // Create a temporary file with the audio data
    const tempFilePath = `/tmp/voice-rfq-${Date.now()}.webm`;
    require('fs').writeFileSync(tempFilePath, audioBuffer);

    // Transcribe the audio
    const transcription = await openai.audio.transcriptions.create({
      file: require('fs').createReadStream(tempFilePath),
      model: 'whisper-1',
    });

    // Clean up temp file
    require('fs').unlinkSync(tempFilePath);

    // Extract RFQ information from transcription
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: 'system',
          content: `You are an AI expert at extracting RFQ (Request for Quotation) details from spoken text. 
          Extract the following information in JSON format:
          - title: A concise title for the RFQ
          - description: Detailed description of what is being requested
          - category: The product or service category (e.g., "Electronics", "Manufacturing", "Software")
          - quantity: The quantity being requested (numeric)
          - budget: The budget or price range (numeric, without currency symbols)
          - deliveryDeadline: Delivery deadline formatted as YYYY-MM-DD or null if not mentioned
          
          Only include these fields in your response, formatted as a valid JSON object.`
        },
        {
          role: 'user',
          content: transcription.text
        }
      ],
      response_format: { type: 'json_object' }
    });

    // Parse the JSON response
    const extractedInfo = JSON.parse(completion.choices[0].message.content || '{}');

    return {
      text: transcription.text,
      extractedInfo
    };
  } catch (error: any) {
    console.error('Error processing voice RFQ:', error);
    throw new Error(`Failed to process voice RFQ: ${error.message}`);
  }
}

/**
 * Analyzes supplier risk based on provided data
 * @param supplierData Supplier information
 * @returns Risk analysis with score and recommendations
 */
export async function analyzeSupplierRisk(supplierData: Record<string, any>) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured.');
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: 'system',
          content: `You are an expert in supply chain risk assessment. 
          Analyze the supplier data and provide a risk assessment with the following JSON structure:
          {
            "risk_score": (number between 0-100, where 0 is lowest risk and 100 is highest),
            "risk_level": (string, either "Low", "Medium", "High", or "Critical"),
            "key_findings": (array of strings with key risk factors or strengths),
            "recommendations": (array of strings with recommended actions),
            "risk_breakdown": {
              "financial_stability": (number 0-100),
              "supply_reliability": (number 0-100),
              "quality_consistency": (number 0-100),
              "reputation": (number 0-100)
            }
          }`
        },
        {
          role: 'user',
          content: JSON.stringify(supplierData)
        }
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error: any) {
    console.error('Error analyzing supplier risk:', error);
    throw new Error(`Failed to analyze supplier risk: ${error.message}`);
  }
}

/**
 * Generate market insights for a specific industry
 * @param industry Industry name or category
 * @returns Market insights with trends, statistics, and opportunities
 */
export async function generateMarketInsights(industry: string) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured.');
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: 'system',
          content: `You are a market research expert. 
          Generate insights about the following industry in JSON format with the following structure:
          {
            "market_size": {
              "value": (string describing current market size),
              "growth_rate": (string describing growth rate)
            },
            "key_trends": (array of strings describing current trends),
            "top_players": (array of objects with "name" and "market_share" fields),
            "opportunities": (array of strings describing opportunities),
            "threats": (array of strings describing threats),
            "forecast": (string with market forecast for next 2-3 years)
          }`
        },
        {
          role: 'user',
          content: `Generate market insights for the ${industry} industry.`
        }
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error: any) {
    console.error('Error generating market insights:', error);
    throw new Error(`Failed to generate market insights: ${error.message}`);
  }
}

/**
 * Analyzes an RFQ text and provides recommendations
 * @param rfqText The text of the RFQ to analyze
 * @returns Analysis with categories, potential suppliers, and recommendations
 */
export async function analyzeRFQ(rfqText: string) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured.');
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: 'system',
          content: `You are an expert in analyzing procurement requests. 
          Analyze the provided RFQ (Request for Quotation) text and provide an analysis in JSON format with the following structure:
          {
            "categories": (array of relevant product/service categories),
            "complexity": (string - "Low", "Medium", or "High"),
            "estimated_budget_range": {
              "min": (number - minimum estimated budget),
              "max": (number - maximum estimated budget)
            },
            "key_requirements": (array of strings with key requirements),
            "potential_challenges": (array of strings with potential challenges),
            "supplier_suggestions": (array of strings with types of suppliers that would be good matches),
            "improvement_suggestions": (array of strings with suggestions to improve the RFQ)
          }`
        },
        {
          role: 'user',
          content: rfqText
        }
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error: any) {
    console.error('Error analyzing RFQ:', error);
    throw new Error(`Failed to analyze RFQ: ${error.message}`);
  }
}