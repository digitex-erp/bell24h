import https from 'https';
import { EnhancedSupplier } from './ml-matching';
import { rfqs } from '../../shared/schema';

// Check for API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Helper function to make HTTP requests to Gemini API
function makeGeminiRequest(prompt: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
    
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          if (parsedData.error) {
            reject(new Error(`Gemini API error: ${parsedData.error.message}`));
          } else {
            resolve(parsedData);
          }
        } catch (e: any) {
          reject(new Error(`Failed to parse Gemini API response: ${e.message}`));
        }
      });
    });
    
    req.on('error', (e: any) => {
      reject(new Error(`Gemini API request error: ${e.message}`));
    });
    
    req.write(postData);
    req.end();
  });
}

// Export interfaces for type safety
export interface SupplierMatchingResult {
  supplier: {
    id: number;
    name: string;
  };
  matchScore: number;
}

/**
 * Generate an RFQ analysis with Gemini Pro
 * @param rfq The RFQ to analyze
 * @param suppliers List of potential suppliers to match
 * @returns List of supplier matches with scores
 */
export async function generateRfqAnalysisWithGemini(
  rfq: typeof rfqs.$inferSelect,
  suppliers: EnhancedSupplier[]
): Promise<SupplierMatchingResult[]> {
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not found. Cannot use Gemini API for supplier matching.');
    // Return basic matches based on industry - for fallback when API key is missing
    return suppliers
      .filter(s => s.industry === rfq.industry)
      .map(s => ({
        supplier: { id: s.id, name: s.name },
        matchScore: 50 + Math.floor(Math.random() * 30)
      }))
      .sort((a, b) => b.matchScore - a.matchScore);
  }
  
  try {
    // Prepare the supplier information for the prompt
    const supplierInfoText = suppliers.map(s => 
      `Supplier ID: ${s.id}
      Name: ${s.name}
      Industry: ${s.industry}
      Description: ${s.description || 'No description provided'}
      Verified: ${s.isVerified ? 'Yes' : 'No'}
      Rating: ${s.rating || 'No rating'}
      Performance Metrics:
        - Average Response Time: ${s.performanceMetrics.avgResponseTime} hours
        - Acceptance Rate: ${s.performanceMetrics.acceptanceRate}%
        - Completion Rate: ${s.performanceMetrics.completionRate}%
        - Price Competitiveness: ${s.performanceMetrics.avgPriceCompetitiveness}% relative to market average
        - Similar RFQs Count: ${s.performanceMetrics.similarRfqsCount}
      `
    ).join('\n\n');
    
    // Construct the prompt for Gemini
    const prompt = `
    You are an expert B2B supplier matching system. Your task is to analyze an RFQ (Request for Quotation) 
    and match it with the most suitable suppliers based on their expertise, performance metrics, and relevance.
    
    RFQ Details:
    ID: ${rfq.id}
    Title: ${rfq.title}
    Description: ${rfq.description}
    Industry: ${rfq.industry}
    Budget: ${rfq.budget || 'Not specified'}
    
    Potential Suppliers:
    ${supplierInfoText}
    
    Please analyze the RFQ and rate each supplier with a match score from 0-100, where 100 indicates a perfect match.
    Consider the following factors:
    1. Industry alignment
    2. Relevant expertise based on description
    3. Performance metrics (response time, acceptance rate, etc.)
    4. Price competitiveness
    5. Previous experience with similar RFQs
    
    Output your results in the following JSON format ONLY:
    {
      "matches": [
        {
          "supplierId": 123,
          "supplierName": "Supplier name",
          "matchScore": 85
        },
        ...
      ]
    }
    
    Sort the results with the highest match score first.
    `;
    
    // Make request to Gemini API
    const response = await makeGeminiRequest(prompt);
    
    // Extract text from response
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No text response from Gemini API');
    }
    
    // Parse the JSON response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                      text.match(/{[\s\S]*}/);
    
    if (!jsonMatch) {
      throw new Error('Unexpected response format from Gemini API');
    }
    
    const jsonText = jsonMatch[1] || jsonMatch[0];
    const parsedResult = JSON.parse(jsonText);
    
    // Transform to our expected format
    return parsedResult.matches.map((match: any) => ({
      supplier: {
        id: match.supplierId,
        name: match.supplierName
      },
      matchScore: match.matchScore
    }));
  } catch (error) {
    console.error('Error using Gemini for supplier matching:', error);
    
    // Return basic matches based on industry - for fallback when API fails
    return suppliers
      .filter(s => s.industry === rfq.industry)
      .map(s => ({
        supplier: { id: s.id, name: s.name },
        matchScore: 60 + Math.floor(Math.random() * 20)
      }))
      .sort((a, b) => b.matchScore - a.matchScore);
  }
}

/**
 * Generate RFQ image visualization with Gemini Pro Vision
 * This is a placeholder for future implementation
 */
export async function generateRfqImageWithGemini(rfqId: number, rfqTitle: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not found. Cannot use Gemini API for image generation.');
    return '';
  }
  
  try {
    // Construct a prompt asking for a textual description of an RFQ visualization
    const prompt = `Create a detailed text description of a professional business image that represents 
    an RFQ (Request for Quotation) with ID ${rfqId} titled "${rfqTitle}". 
    The image should be suitable for a B2B procurement platform.`;
    
    // Make request to Gemini API
    const response = await makeGeminiRequest(prompt);
    
    // Extract text from response
    const imageDescription = response.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!imageDescription) {
      console.warn('No image description generated from Gemini API');
      return '';
    }
    
    // In a real implementation, this would use the description to generate or select an image
    // For now, we're just returning the description for debugging purposes
    console.log(`Generated image description for RFQ #${rfqId}: ${imageDescription.substring(0, 100)}...`);
    
    return '';
  } catch (error) {
    console.error('Error generating RFQ image with Gemini:', error);
    return '';
  }
}