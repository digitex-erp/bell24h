import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { storage } from "./storage";
import { InsertRFQ } from "@shared/schema";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Transcribe audio to text using OpenAI Whisper API
 * Supports Hindi and English languages
 */
export async function transcribeAudio(
  filePath: string, 
  language: "hi" | "en" | "auto" = "auto"
): Promise<{ 
  text: string; 
  detectedLanguage: string;
  confidence: number;
}> {
  try {
    const audioReadStream = fs.createReadStream(filePath);

    // Use Whisper model for transcription
    const transcription = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: "whisper-1",
      language: language === "auto" ? undefined : language,
      response_format: "verbose_json"
    });

    // Extract detected language and confidence if available
    const detectedLanguage = (transcription as any).language || "en";
    const confidence = parseFloat((transcription as any).confidence || "0");

    return {
      text: transcription.text,
      detectedLanguage,
      confidence
    };
  } catch (error: any) {
    console.error("Error transcribing audio:", error);
    throw new Error(`Transcription failed: ${error?.message || "Unknown error"}`);
  }
}

/**
 * Analyze transcribed text and extract RFQ details
 * Works with both Hindi and English text
 */
export async function extractRFQDetails(
  text: string, 
  language: string
): Promise<Partial<InsertRFQ>> {
  try {
    // Instruct the model based on detected language
    const systemPrompt = language === "hi" 
      ? "आप एक व्यापारिक सहायक हैं। आपका काम उपयोगकर्ता द्वारा प्रदान किए गए भाषण से RFQ विवरण निकालना है। सभी महत्वपूर्ण जानकारी प्राप्त करें और इसे JSON प्रारूप में व्यवस्थित करें।"
      : "You are a business assistant. Your job is to extract RFQ details from the speech provided by the user. Capture all important information and structure it in JSON format.";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
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

    // Parse the response to get RFQ details
    const content = response.choices[0].message.content || "{}";
    const rfqDetails = JSON.parse(content);
    
    // Map the extracted details to our InsertRFQ format
    return {
      title: rfqDetails.title || rfqDetails.subject || "",
      description: rfqDetails.description || rfqDetails.details || "",
      quantity: rfqDetails.quantity ? parseInt(rfqDetails.quantity.toString()) : undefined,
      budget: rfqDetails.budget ? parseInt(rfqDetails.budget.toString()) : undefined,
      location: rfqDetails.location || "",
      closingDate: rfqDetails.closingDate ? new Date(rfqDetails.closingDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now
      isVoiceBased: true,
      voiceTranscription: text,
      specifications: rfqDetails.specifications || {},
    };
  } catch (error: any) {
    console.error("Error extracting RFQ details:", error);
    
    // Return basic structure with transcription if extraction fails
    return {
      title: "Voice RFQ",
      description: text,
      closingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isVoiceBased: true,
      voiceTranscription: text
    };
  }
}

/**
 * Process voice commands in Hindi or English
 */
export async function processVoiceCommand(
  text: string, 
  language: string
): Promise<{ 
  command: string; 
  parameters: Record<string, any>;
  confidence: number;
}> {
  try {
    // Choose prompt based on language
    const systemPrompt = language === "hi" 
      ? "आप एक वॉयस असिस्टेंट हैं। आपका काम उपयोगकर्ता द्वारा प्रदान किए गए भाषण से कमांड और पैरामीटर निकालना है। कृपया कमांड, पैरामीटर और इन निष्कर्षों पर आपका आत्मविश्वास JSON प्रारूप में लौटाएं।"
      : "You are a voice assistant. Your job is to extract commands and parameters from the speech provided by the user. Please return the command, parameters, and your confidence in these conclusions in JSON format.";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
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

    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content);
    
    return {
      command: result.command || "unknown",
      parameters: result.parameters || {},
      confidence: result.confidence || 0.5
    };
  } catch (error: any) {
    console.error("Error processing voice command:", error);
    return {
      command: "error",
      parameters: { error: error?.message || "Unknown error" },
      confidence: 0
    };
  }
}

/**
 * Translate Hindi to English or vice versa
 */
export async function translateText(
  text: string, 
  sourceLanguage: "hi" | "en",
  targetLanguage: "hi" | "en"
): Promise<string> {
  try {
    if (sourceLanguage === targetLanguage) {
      return text; // No translation needed
    }

    const systemPrompt = sourceLanguage === "hi" 
      ? `आप एक अनुवादक हैं। कृपया निम्नलिखित हिंदी पाठ का अंग्रेजी में अनुवाद करें।`
      : `You are a translator. Please translate the following English text to Hindi.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    return response.choices[0].message.content || text;
  } catch (error: any) {
    console.error("Error translating text:", error);
    return text; // Return original text if translation fails
  }
}

/**
 * Create voice response in Hindi or English
 */
export async function generateVoiceResponse(
  prompt: string, 
  language: "hi" | "en" = "en"
): Promise<string> {
  try {
    const systemPrompt = language === "hi" 
      ? "आप एक व्यापार सहायक हैं जो हिंदी में संवाद करता है। कृपया उपयोगकर्ता के प्रश्न का संक्षिप्त उत्तर दें।"
      : "You are a business assistant who communicates in English. Please provide a concise response to the user's query.";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    return response.choices[0].message.content || "";
  } catch (error: any) {
    console.error("Error generating voice response:", error);
    return language === "hi" 
      ? "क्षमा करें, मैं अभी उत्तर नहीं दे सकता।" 
      : "Sorry, I cannot respond right now.";
  }
}

/**
 * Detect language from provided text
 */
export async function detectLanguage(
  text: string
): Promise<{ language: string; confidence: number }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a language detection system. For the given text, identify the language and provide ISO 639-1 language code. Return only JSON with 'language' and 'confidence' fields."
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content);
    
    return {
      language: result.language || "en",
      confidence: result.confidence || 0.5
    };
  } catch (error: any) {
    console.error("Error detecting language:", error);
    return {
      language: "en", // Default to English
      confidence: 0
    };
  }
}