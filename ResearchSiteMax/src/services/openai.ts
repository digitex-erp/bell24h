/**
 * OpenAI Service for Bell24h Voice RFQ functionality
 * 
 * This service handles voice transcription, language detection, and translation
 * using OpenAI API.
 */
import OpenAI from 'openai';
import fs from 'fs';
import { createReadStream } from 'fs';
import path from 'path';

// Initialize OpenAI with API key from environment variable
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = 'gpt-4o';

/**
 * Transcribe audio file to text
 */
export async function transcribeAudio(audioFilePath: string): Promise<{ text: string, duration: number }> {
  try {
    // Ensure file exists
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found at path: ${audioFilePath}`);
    }
    
    // Create a readable stream for the audio file
    const audioReadStream = createReadStream(audioFilePath);
    
    // Call OpenAI API to transcribe the audio
    const transcription = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: 'whisper-1',
    });
    
    return {
      text: transcription.text,
      duration: transcription.duration || 0,
    };
  } catch (error: any) {
    console.error('Error transcribing audio:', error.message);
    throw new Error(`Failed to transcribe audio: ${error.message}`);
  }
}

/**
 * Detect language from a text
 */
export async function detectLanguage(text: string): Promise<string> {
  try {
    const prompt = `Identify the language of the following text. Respond with just the language name in lowercase. If it's Hindi, respond with "hindi". If it's English, respond with "english". For any other language, respond with the appropriate language name in lowercase.\n\nText: "${text}"`;
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 20,
    });
    
    // Extract the language from the response
    const language = response.choices[0].message.content?.trim().toLowerCase() || 'unknown';
    return language;
  } catch (error: any) {
    console.error('Error detecting language:', error.message);
    throw new Error(`Failed to detect language: ${error.message}`);
  }
}

/**
 * Translate text to English
 */
export async function translateToEnglish(text: string, sourceLanguage: string): Promise<string> {
  // If the text is already in English, return it as is
  if (sourceLanguage === 'english') {
    return text;
  }
  
  try {
    const prompt = `Translate the following ${sourceLanguage} text to English, preserving all the key details and information:\n\n"${text}"`;
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });
    
    // Extract the translation from the response
    const translation = response.choices[0].message.content?.trim() || text;
    return translation;
  } catch (error: any) {
    console.error('Error translating text:', error.message);
    throw new Error(`Failed to translate text: ${error.message}`);
  }
}

/**
 * Extract product details from an RFQ text
 */
export async function extractRfqDetails(text: string): Promise<any> {
  try {
    const prompt = `Extract the following information from this Request for Quote (RFQ) text, if available:\n\n"${text}"\n\nRespond in JSON format with these fields:\n- title: A concise title for the RFQ\n- description: The full description\n- quantity: The quantity requested (number)\n- budget: The budget mentioned (number)\n- urgency: Any mention of urgency or timeline\n\nIf any field is not mentioned in the text, leave it null.`;
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    });
    
    // Parse the JSON response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }
    
    const rfqDetails = JSON.parse(content);
    return rfqDetails;
  } catch (error: any) {
    console.error('Error extracting RFQ details:', error.message);
    throw new Error(`Failed to extract RFQ details: ${error.message}`);
  }
}
