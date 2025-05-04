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
 * @returns Structured RFQ data
 */
export async function processVoiceRFQ(audioFilePath: string): Promise<{
  title: string;
  description: string;
  category: string;
  quantity: string;
  deadline: Date;
  specifications: any;
}> {
  try {
    // Convert audio to format suitable for OpenAI API if needed
    const wavFilePath = await convertToWav(audioFilePath);
    
    // Read the audio file
    const audioData = fs.readFileSync(wavFilePath);
    
    // Transcribe the audio
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(wavFilePath),
      model: "whisper-1",
      language: "en",
    });
    
    // Clean up temp file
    if (wavFilePath !== audioFilePath) {
      fs.unlinkSync(wavFilePath);
    }
    
    // Use GPT to extract RFQ information from the transcription
    const rfqData = await extractRFQData(transcription.text);
    
    return rfqData;
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
    
    const response = JSON.parse(completion.choices[0].message.content);
    
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