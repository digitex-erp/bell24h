import OpenAI from "openai";

// Initialize the OpenAI client using environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class OpenAIService {
  async transcribeAudio(audioBase64: string, language?: string) {
    try {
      console.log(`Transcribing audio with OpenAI${language ? ` in ${language}` : ''}...`);
      
      // Convert base64 to Buffer
      const buffer = Buffer.from(audioBase64, 'base64');
      
      // Map of language codes for Whisper API
      const languageCodeMap: Record<string, string> = {
        'en': 'en',    // English
        'hi': 'hi',    // Hindi
        'zh': 'zh',    // Chinese
        'es': 'es',    // Spanish
        'fr': 'fr',    // French
        'de': 'de',    // German
        'ja': 'ja',    // Japanese
        'ko': 'ko',    // Korean
        'pt': 'pt',    // Portuguese
        'ru': 'ru',    // Russian
        'ar': 'ar',    // Arabic
        'bn': 'bn',    // Bengali
        'ta': 'ta',    // Tamil
        'te': 'te',    // Telugu
        'mr': 'mr',    // Marathi
        'gu': 'gu',    // Gujarati
        'kn': 'kn',    // Kannada
        'ml': 'ml',    // Malayalam
        'pa': 'pa'     // Punjabi
      };
      
      // Determine which language code to use, default to auto-detection if not specified
      const languageOption = language && languageCodeMap[language] ? languageCodeMap[language] : undefined;
      
      // Call OpenAI Whisper API
      const transcription = await openai.audio.transcriptions.create({
        file: buffer,
        model: "whisper-1",
        language: languageOption,
        response_format: "verbose_json"
      });
      
      // Extract language if auto-detected
      const detectedLanguage = language || transcription.language;
      
      console.log(`Transcription completed successfully (Language: ${detectedLanguage})`);
      return {
        success: true,
        text: transcription.text,
        language: detectedLanguage,
        segments: transcription.segments || []
      };
    } catch (error) {
      console.error("Error transcribing audio:", error);
      return {
        success: false,
        error: error.message || "Failed to transcribe audio",
      };
    }
  }
  
  async extractRfqFromText(text: string, language?: string) {
    try {
      console.log(`Extracting RFQ details with GPT-4o from ${language || 'detected language'} text...`);
      
      // Determine if we need specialized language handling
      const isHindi = language === 'hi';
      const isNonEnglish = language && language !== 'en';
      
      let systemPrompt = `
        You are an AI assistant specialized in procurement and supply chain. 
        Extract structured RFQ (Request for Quote) information from the provided text.
        Identify the following information:
        1. Product/Service description
        2. Quantity required
        3. Category (Electronics, Office Supplies, Industrial, etc.)
        4. Budget (if mentioned)
        5. Deadline (if mentioned)
        6. Any specific requirements or specifications
        
        ${isNonEnglish ? `The provided text is in ${language} language. First understand the text in its native language before extracting information.` : ''}
        ${isHindi ? 'Pay attention to Hindi-specific terminology and formatting for dates, numbers, and currency.' : ''}
        
        Return the information in JSON format with the following structure:
        {
          "title": "Brief title for the RFQ based on the main item",
          "description": "Detailed description of requirements",
          "category": "Primary category of the item/service",
          "quantity": number or null,
          "budget": number or null,
          "deadline": "YYYY-MM-DD" or null,
          "additionalRequirements": "Any specific details mentioned",
          "detectedLanguage": "The language detected in the input text"
        }
      `;
      
      // For Hindi language, add specific examples
      if (isHindi) {
        systemPrompt += `
          Examples for Hindi text:
          
          Input: "हमें 50 लैपटॉप की आवश्यकता है, जिनकी कीमत 50,000 रुपये प्रति इकाई से अधिक न हो। डेल या एचपी ब्रांड होना चाहिए। 15 जुलाई 2025 तक डिलीवरी चाहिए।"
          
          Output: {
            "title": "लैपटॉप खरीद आरएफक्यू",
            "description": "50 डेल या एचपी ब्रांड के लैपटॉप की आवश्यकता है",
            "category": "इलेक्ट्रॉनिक्स",
            "quantity": 50,
            "budget": 50000,
            "deadline": "2025-07-15",
            "additionalRequirements": "डेल या एचपी ब्रांड के लैपटॉप होने चाहिए",
            "detectedLanguage": "hi"
          }
        `;
      }
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: text
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const result = JSON.parse(response.choices[0].message.content);
      console.log(`RFQ extraction completed successfully - detected language: ${result.detectedLanguage || language || 'unknown'}`);
      
      // Also return the original language and text for reference
      return {
        success: true,
        rfq: result,
        originalText: text,
        language: result.detectedLanguage || language
      };
    } catch (error) {
      console.error("Error extracting RFQ from text:", error);
      return {
        success: false,
        error: error.message || "Failed to extract RFQ details"
      };
    }
  }
  
  async getSupplierMatchExplanation(rfqId: number, supplierId: number) {
    try {
      console.log(`Generating supplier match explanation for RFQ ${rfqId} and supplier ${supplierId}...`);
      
      // For a real implementation, you would fetch the RFQ and supplier details from the database
      // and pass them to the OpenAI API
      
      const systemPrompt = `
        You are an AI assistant specialized in supplier matching for procurement.
        Provide a detailed explanation of why a specific supplier is a good match for an RFQ.
        Focus on:
        1. Relevance of supplier expertise to the RFQ requirements
        2. Past performance of the supplier in similar categories
        3. Geographical advantages
        4. Pricing competitiveness
        5. Delivery capabilities
        6. Quality and compliance aspects
        
        Return the explanation in JSON format with the following structure:
        {
          "overallMatch": "Summary of why this is a good match (3-4 sentences)",
          "factors": {
            "expertise": { "score": float between 0-1, "explanation": "Explanation" },
            "pastPerformance": { "score": float between 0-1, "explanation": "Explanation" },
            "geography": { "score": float between 0-1, "explanation": "Explanation" },
            "pricing": { "score": float between 0-1, "explanation": "Explanation" },
            "delivery": { "score": float between 0-1, "explanation": "Explanation" },
            "quality": { "score": float between 0-1, "explanation": "Explanation" }
          },
          "recommendation": "Final recommendation on whether to proceed (1-2 sentences)"
        }
      `;
      
      const mockRfqSupplierData = {
        rfq: {
          id: rfqId,
          title: "Industrial Automation Components",
          description: "Looking for PLC controllers and HMI panels for a factory automation project",
          category: "Electronics",
          quantity: 15,
          budget: 50000,
          deadline: "2025-05-15"
        },
        supplier: {
          id: supplierId,
          name: "TechPro Solutions",
          location: "Mumbai, India",
          categories: ["Electronics", "Automation", "IoT"],
          establishedYear: 2005,
          certificationsCount: 3,
          avgDeliveryTime: 12,
          completedProjects: 87,
          avgRating: 4.7
        }
      };
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: JSON.stringify(mockRfqSupplierData)
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const result = JSON.parse(response.choices[0].message.content);
      console.log("Supplier match explanation generated successfully");
      
      return {
        success: true,
        explanation: result
      };
    } catch (error) {
      console.error("Error generating supplier match explanation:", error);
      return {
        success: false,
        error: error.message || "Failed to generate supplier match explanation"
      };
    }
  }
  
  async processVideoRfq(videoBase64: string) {
    try {
      console.log("Processing video RFQ with OpenAI Vision...");
      
      // In a real implementation, we would:
      // 1. Save the base64 video to a file
      // 2. Extract frames from the video
      // 3. Process key frames with OpenAI Vision
      // 4. Combine results
      
      // For now, we'll simulate this process
      const systemPrompt = `
        You are an AI assistant specialized in procurement and supply chain.
        Analyze the video frames from an RFQ (Request for Quote) video submission.
        Identify the following information:
        1. Product/Service being requested
        2. Quantity required
        3. Visible specifications or requirements
        4. Any deadlines mentioned
        5. Budget constraints if shown
        
        Return the extracted information in JSON format with the following structure:
        {
          "title": "Brief title for the RFQ based on the main item",
          "description": "Detailed description of requirements",
          "category": "Primary category of the item/service",
          "quantity": number or null,
          "budget": number or null,
          "deadline": "YYYY-MM-DD" or null,
          "visualDetails": "Description of any visually identified specifications"
        }
      `;
      
      // For demo purposes, we'll return a mock response
      const mockResult = {
        title: "Industrial CNC Machine Parts",
        description: "Looking for precision CNC machine parts for manufacturing line upgrade. Parts must meet ISO 9001 standards and be compatible with Fanuc controller systems.",
        category: "Industrial Equipment",
        quantity: 8,
        budget: 125000,
        deadline: "2025-06-30",
        visualDetails: "The video shows detailed specifications for servo motors, control panels, and machining attachments. Required tolerance levels are shown as ±0.02mm."
      };
      
      console.log("Video RFQ processing completed");
      
      return {
        success: true,
        rfq: mockResult
      };
    } catch (error) {
      console.error("Error processing video RFQ:", error);
      return {
        success: false,
        error: error.message || "Failed to process video RFQ"
      };
    }
  }
}

// Singleton instance
export const openAIService = new OpenAIService();