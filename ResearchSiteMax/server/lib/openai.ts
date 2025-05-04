import OpenAI from 'openai';
import fs from 'fs';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execPromise = util.promisify(exec);

// Initialize OpenAI with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Process voice RFQ by extracting text and structured information
 * @param audioFilePath Path to the audio file
 * @param language Optional language code (en, hi, or auto for detection)
 * @returns Structured RFQ data with detected language
 */
export async function processVoiceRFQ(audioFilePath: string, language: string = 'auto'): Promise<{
  title: string;
  description: string;
  category: string;
  quantity: string;
  deadline: Date;
  specifications: any;
  detectedLanguage: string;
  originalTranscript: string;
}> {
  try {
    // Convert audio to format suitable for OpenAI API if needed
    const wavFilePath = await convertToWav(audioFilePath);
    
    // Read the audio file
    const audioData = fs.readFileSync(wavFilePath);
    
    // Transcribe the audio - Whisper automatically detects language
    // but we can specify one if the user selected a specific language
    const languageCode = language !== 'auto' ? language : undefined;
    
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(wavFilePath),
      model: "whisper-1",
      language: languageCode,
    });
    
    // Clean up temp file
    if (wavFilePath !== audioFilePath) {
      fs.unlinkSync(wavFilePath);
    }
    
    // Store the original transcript before translation or processing
    const originalTranscript = transcription.text;
    
    // Detect language if not specified (Whisper doesn't return the detected language)
    const detectedLanguage = await detectLanguage(originalTranscript);
    
    // Translate to English if not already in English
    let processedText = originalTranscript;
    if (detectedLanguage !== 'en') {
      processedText = await translateToEnglish(originalTranscript, detectedLanguage);
    }
    
    // Use GPT to extract RFQ information from the processed text
    const rfqData = await extractRFQData(processedText);
    
    return {
      ...rfqData,
      detectedLanguage,
      originalTranscript,
    };
  } catch (error) {
    console.error('Error processing voice RFQ:', error);
    throw new Error(`Failed to process voice RFQ: ${(error as Error).message}`);
  }
}

/**
 * Convert audio to WAV format for OpenAI API
 * @param audioFilePath Path to the audio file
 * @returns Path to the WAV file
 */
async function convertToWav(audioFilePath: string): Promise<string> {
  const fileExtension = path.extname(audioFilePath).toLowerCase();
  
  // If already WAV, return the path
  if (fileExtension === '.wav') {
    return audioFilePath;
  }
  
  const outputDir = path.join(process.cwd(), 'uploads', 'extracted');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const wavFilePath = path.join(outputDir, `${path.basename(audioFilePath, fileExtension)}.wav`);
  
  try {
    await execPromise(`ffmpeg -i "${audioFilePath}" -vn -acodec pcm_s16le -ar 44100 -ac 1 "${wavFilePath}"`);
    return wavFilePath;
  } catch (error) {
    console.error('Error converting audio to WAV:', error);
    return audioFilePath; // Return original path if conversion fails
  }
}

/**
 * Detect language of a text using OpenAI
 * @param text The text to detect language for
 * @returns Language code (en, hi, etc.)
 */
async function detectLanguage(text: string): Promise<string> {
  try {
    // Using the newest OpenAI model (gpt-4o) which was released May 13, 2024
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a language detection expert. Analyze the given text and identify what language it is written in.
          Return ONLY a JSON object with a single field 'language' containing the ISO 639-1 language code (e.g., 'en' for English, 'hi' for Hindi, etc.).
          Focus primarily on Hindi and English detection.`
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const content = completion.choices[0].message.content || '{"language": "en"}';
    const response = JSON.parse(content);
    return response.language || 'en';
  } catch (error) {
    console.error('Error detecting language:', error);
    return 'en'; // Default to English on failure
  }
}

/**
 * Translate text to English using OpenAI
 * @param text The text to translate
 * @param sourceLanguage The source language code
 * @returns Translated text in English
 */
async function translateToEnglish(text: string, sourceLanguage: string): Promise<string> {
  try {
    // Skip translation if already in English
    if (sourceLanguage === 'en') return text;
    
    // Using the newest OpenAI model (gpt-4o) which was released May 13, 2024
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the provided text from ${sourceLanguage === 'hi' ? 'Hindi' : 'the detected language'} to English.
          Preserve all details and technical terminology. Return only the translated text with no additional commentary.`
        },
        {
          role: "user",
          content: text
        }
      ]
    });
    
    return completion.choices[0].message.content || text;
  } catch (error) {
    console.error('Error translating text:', error);
    return text; // Return original text on failure
  }
}

/**
 * Extract structured RFQ data from transcript
 * @param transcript Transcribed audio text
 * @returns Structured RFQ data
 */
async function extractRFQData(transcript: string): Promise<{
  title: string;
  description: string;
  category: string;
  quantity: string;
  deadline: Date;
  specifications: any;
}> {
  try {
    // Using the newest OpenAI model (gpt-4o) which was released May 13, 2024
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI specialized in extracting RFQ (Request for Quote) information from audio transcripts. 
          Extract the following fields:
          1. title: A concise title for the RFQ (max 100 chars)
          2. description: Detailed description of what is being requested
          3. category: Industry category (e.g. Electronics, Manufacturing, Chemicals, Textiles, etc.)
          4. quantity: The quantity requested
          5. deadline: When the quote is needed by (in format YYYY-MM-DD)
          6. specifications: Any technical specifications mentioned (as a JSON object)
          
          Return ONLY a JSON object with these fields. If any information is not available, make a reasonable inference based on the context.`
        },
        {
          role: "user",
          content: transcript
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const content = completion.choices[0].message.content || '{}';
    const response = JSON.parse(content);
    
    // Set deadline to a date object
    let deadline: Date;
    try {
      deadline = new Date(response.deadline);
      // If date is invalid, set to 30 days from now
      if (isNaN(deadline.getTime())) {
        deadline = new Date();
        deadline.setDate(deadline.getDate() + 30);
      }
    } catch (e) {
      deadline = new Date();
      deadline.setDate(deadline.getDate() + 30);
    }
    
    // Ensure specifications is an object
    const specifications = typeof response.specifications === 'object' ? 
      response.specifications : 
      { details: response.specifications };
    
    return {
      title: response.title || 'RFQ from Audio',
      description: response.description || transcript,
      category: response.category || 'Other',
      quantity: response.quantity || '1',
      deadline,
      specifications
    };
  } catch (error) {
    console.error('Error extracting RFQ data:', error);
    
    // Fallback to basic extraction if OpenAI fails
    const title = transcript.slice(0, 100);
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 30);
    
    return {
      title,
      description: transcript,
      category: 'Other',
      quantity: '1',
      deadline,
      specifications: { rawTranscript: transcript }
    };
  }
}

/**
 * Analyze RFQ quality and provide suggestions
 * @param rfqData RFQ data to analyze
 * @returns Analysis results including match success rate and suggestions
 */
export async function analyzeRFQ(rfqData: any): Promise<any> {
  try {
    // Using the newest OpenAI model (gpt-4o) which was released May 13, 2024
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI specialized in analyzing RFQ (Request for Quote) quality. 
          Analyze the given RFQ data and provide a match success rate (0-100) and suggestions for improvement.
          Return ONLY a JSON object with the following fields:
          1. matchSuccessRate: A number between 0 and 100
          2. suggestions: An array of suggestion strings for improving the RFQ
          3. keyStrengths: An array of strength strings highlighting good aspects of the RFQ`
        },
        {
          role: "user",
          content: JSON.stringify(rfqData)
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const content = completion.choices[0].message.content || '{}';
    const response = JSON.parse(content);
    
    return {
      matchSuccessRate: response.matchSuccessRate || 80,
      suggestions: response.suggestions || [
        'Add more detailed specifications to increase match quality',
        'Consider adding preferred supplier qualifications'
      ],
      keyStrengths: response.keyStrengths || [
        'Clear product requirements',
        'Specific quantity mentioned'
      ]
    };
  } catch (error) {
    console.error('Error analyzing RFQ:', error);
    
    // Fallback to basic analysis if OpenAI fails
    return {
      matchSuccessRate: 80,
      suggestions: [
        'Add more detailed specifications to increase match quality',
        'Consider adding preferred supplier qualifications'
      ],
      keyStrengths: [
        'Clear product requirements',
        'Specific quantity mentioned'
      ]
    };
  }
}