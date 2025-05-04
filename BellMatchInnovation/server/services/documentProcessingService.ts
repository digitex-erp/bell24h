import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Uses the OPENAI_API_KEY from environment
});

/**
 * Document Processing Service
 * 
 * This service uses OpenAI's GPT-4 Vision API to analyze documents and extract data,
 * serving as an alternative to the unavailable napkin.ai API.
 */
export class DocumentProcessingService {
  /**
   * Extract structured data from an image or document
   * 
   * @param imageBase64 - Base64 encoded image data
   * @param extractionPrompt - Specific instructions for what data to extract
   * @returns Structured data extracted from the document
   */
  async extractDataFromImage(imageBase64: string, extractionPrompt: string): Promise<any> {
    try {
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: `${extractionPrompt}. Extract the information in JSON format.` 
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
      });

      // Parse the JSON response
      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error: any) {
      console.error("Error extracting data from image:", error);
      throw new Error(`Failed to extract data from document: ${error.message}`);
    }
  }

  /**
   * Analyze a procurement document (RFQ, invoice, etc)
   * 
   * @param imageBase64 - Base64 encoded image data of the document
   * @returns Analysis of the document including key data points
   */
  async analyzeProcurementDocument(imageBase64: string): Promise<any> {
    const extractionPrompt = `
      Analyze this procurement document. Extract the following information:
      - Document type (RFQ, purchase order, invoice, etc.)
      - Company/buyer information
      - Supplier information
      - Item details (descriptions, quantities, prices)
      - Total amount
      - Payment terms
      - Delivery terms
      - Document date
      - Any special conditions or requirements
    `;

    return this.extractDataFromImage(imageBase64, extractionPrompt);
  }

  /**
   * Extract line items from an invoice or purchase order
   * 
   * @param imageBase64 - Base64 encoded image data of the document
   * @returns Line items with quantities, descriptions and prices
   */
  async extractLineItems(imageBase64: string): Promise<any> {
    const extractionPrompt = `
      Extract all line items from this invoice or purchase order.
      For each line item, provide:
      - Item number/SKU
      - Description
      - Quantity
      - Unit price
      - Total price
    `;

    return this.extractDataFromImage(imageBase64, extractionPrompt);
  }

  /**
   * Summarize a long procurement document
   * 
   * @param documentBase64 - Base64 encoded document
   * @returns Summary of key points in the document
   */
  async summarizeDocument(documentBase64: string): Promise<string> {
    try {
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: "Provide a concise summary of this procurement document. Identify key terms, requirements, and important details that would be relevant for procurement professionals." 
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${documentBase64}`
                }
              }
            ],
          },
        ],
        max_tokens: 1000,
      });

      return response.choices[0].message.content || '';
    } catch (error: any) {
      console.error("Error summarizing document:", error);
      throw new Error(`Failed to summarize document: ${error.message}`);
    }
  }
}

export default new DocumentProcessingService();