// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
export const OPENAI_MODEL = "gpt-4o"; // Export for use in other components

/**
 * Types for the chat interface
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatAction {
  type: string;
  description: string;
  [key: string]: any;
}

export interface ChatResponse {
  response: string;
  actions?: ChatAction[];
}

/**
 * Audio transcription interfaces
 */
export interface TranscriptionResponse {
  success: boolean;
  text?: string;
  language?: string;
  segments?: any[];
  error?: string;
}

export interface ExtractedRfq {
  title: string;
  description: string;
  category?: string;
  quantity?: number;
  budget?: number;
  deadline?: string;
  additionalRequirements?: string;
  detectedLanguage?: string;
}

/**
 * Send a message to the procurement chatbot
 * 
 * @param message The user's message
 * @param history Previous conversation history
 * @param userId Optional user ID for personalized responses
 * @returns Chat response with potential actions
 */
export async function sendChatbotMessage(
  message: string,
  history: ChatMessage[] = [],
  userId?: number
): Promise<ChatResponse> {
  try {
    const response = await fetch('/api/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history,
        userId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get chatbot response');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in sendChatbotMessage:', error);
    return {
      response: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later.",
    };
  }
}

/**
 * Extract RFQ data from text content
 * 
 * @param text Text to analyze for RFQ details
 * @returns Extracted RFQ data
 */
export async function extractRfqData(text: string): Promise<any> {
  try {
    const response = await fetch('/api/extract-rfq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to extract RFQ data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error extracting RFQ data:', error);
    throw error;
  }
}

/**
 * Get supplier match explanation
 * 
 * @param rfqId RFQ ID
 * @param supplierId Supplier ID
 * @returns Detailed explanation of the supplier match
 */
export async function getSupplierMatchExplanation(
  rfqId: number,
  supplierId: number
): Promise<string> {
  try {
    const response = await fetch(`/api/supplier-match-explanation/${rfqId}/${supplierId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get match explanation');
    }

    const data = await response.json();
    return data.explanation;
  } catch (error) {
    console.error('Error getting supplier match explanation:', error);
    throw error;
  }
}

/**
 * Helper function to convert audio blob to base64 string
 * 
 * @param audioBlob Audio blob to convert
 * @returns Base64 encoded audio data
 */
export async function audioToBase64(audioBlob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // Remove data URL prefix if present (e.g., "data:audio/webm;base64,")
        const base64content = base64data.includes('base64,') 
          ? base64data.substring(base64data.indexOf('base64,') + 7) 
          : base64data;
        resolve(base64content);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error converting audio to base64:', error);
      reject(error);
    }
  });
}

/**
 * Transcribe audio using OpenAI Whisper API
 * 
 * @param audioBase64 Base64 encoded audio data
 * @param language Optional language code (e.g., 'en', 'hi')
 * @returns Transcription response
 */
export async function transcribeAudio(
  audioBase64: string, 
  language?: string
): Promise<TranscriptionResponse> {
  try {
    const response = await fetch('/api/openai/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio: audioBase64,
        language
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to transcribe audio');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    return {
      success: false,
      error: error.message || 'Failed to transcribe audio'
    };
  }
}

/**
 * Extract RFQ information from transcribed text
 * 
 * @param text Transcribed text to analyze
 * @param language Optional language code
 * @returns Extracted RFQ data
 */
export async function extractRfqFromText(
  text: string,
  language?: string
): Promise<ExtractedRfq> {
  try {
    const response = await fetch('/api/openai/extract-rfq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        language
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to extract RFQ information');
    }

    const data = await response.json();
    return data.success ? data.rfq : {};
  } catch (error) {
    console.error('Error extracting RFQ from text:', error);
    throw error;
  }
}

/**
 * Convert video blob to base64 string
 * 
 * @param videoBlob Video blob to convert
 * @returns Base64 encoded video data
 */
export async function videoToBase64(videoBlob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // Remove data URL prefix if present
        const base64content = base64data.includes('base64,') 
          ? base64data.substring(base64data.indexOf('base64,') + 7) 
          : base64data;
        resolve(base64content);
      };
      reader.onerror = reject;
      reader.readAsDataURL(videoBlob);
    } catch (error) {
      console.error('Error converting video to base64:', error);
      reject(error);
    }
  });
}

/**
 * Process video RFQ using OpenAI Vision API
 * 
 * @param videoBase64 Base64 encoded video data
 * @returns Processed RFQ data
 */
export async function processVideoRfq(videoBase64: string): Promise<any> {
  try {
    const response = await fetch('/api/openai/process-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video: videoBase64
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to process video');
    }

    const data = await response.json();
    return data.success ? data.rfq : {};
  } catch (error) {
    console.error('Error processing video RFQ:', error);
    throw error;
  }
}