import OpenAI from "openai";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { promisify } from "util";
import { Readable } from "stream";

export class OpenAIService {
  public openai: OpenAI; // Changed from private to public to allow direct access
  private tempDir: string;

  constructor() {
    // Initialize OpenAI with API key from environment
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.tempDir = path.join(process.cwd(), 'temp');
    
    // Ensure temporary directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  private async saveTempFile(data: string, extension: string): Promise<string> {
    const buffer = Buffer.from(data, 'base64');
    const filename = `${crypto.randomUUID()}.${extension}`;
    const filepath = path.join(this.tempDir, filename);
    
    await promisify(fs.writeFile)(filepath, buffer);
    return filepath;
  }

  private async cleanupTempFile(filepath: string): Promise<void> {
    if (fs.existsSync(filepath)) {
      await promisify(fs.unlink)(filepath);
    }
  }

  async generateCompletion(prompt: string): Promise<string> {
    try {
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      console.error('Error in generateCompletion:', error);
      throw new Error('Failed to generate completion');
    }
  }

  async generateJsonCompletion(
    prompt: string,
    systemPrompt: string = "You are a helpful AI assistant."
  ): Promise<Record<string, any>> {
    try {
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1, // Lower temperature for more consistent JSON formatting
      });

      const content = response.choices[0].message.content || "{}";
      return JSON.parse(content);
    } catch (error) {
      console.error('Error in generateJsonCompletion:', error);
      throw new Error('Failed to generate JSON completion');
    }
  }

  async transcribeAudio(audioBase64: string): Promise<{ text: string; duration: number }> {
    try {
      // Save base64 audio to temporary file
      const audioPath = await this.saveTempFile(audioBase64, 'mp3');
      
      // Create a readable stream from the file
      const audioReadStream = fs.createReadStream(audioPath);
      
      // Transcribe using OpenAI Whisper API
      const transcription = await this.openai.audio.transcriptions.create({
        file: audioReadStream,
        model: "whisper-1",
      });
      
      // Get file stats to calculate approximate duration if not provided
      let duration = 0;
      try {
        // Estimate duration based on file size - very rough approximation
        // MP3 files are approximately 16kb per second at 128kbps
        const stats = fs.statSync(audioPath);
        duration = Math.round(stats.size / 16000); // Very rough estimate
      } catch (e) {
        console.warn('Could not estimate audio duration:', e);
      }
      
      // Clean up temporary file
      await this.cleanupTempFile(audioPath);
      
      return {
        text: transcription.text,
        duration: duration,
      };
    } catch (error) {
      console.error('Error in transcribeAudio:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  async analyzeSentiment(text: string): Promise<{
    rating: number,
    confidence: number,
    summary: string
  }> {
    try {
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a sentiment analysis expert. Analyze the sentiment of the text and provide a rating from 1 to 5 stars, a confidence score between 0 and 1, and a brief summary of the sentiment. Respond with JSON in this format: { \"rating\": number, \"confidence\": number, \"summary\": string }",
          },
          {
            role: "user",
            content: text,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content || "{}";
      const result = JSON.parse(content);

      return {
        rating: Math.max(1, Math.min(5, Math.round(result.rating || 3))),
        confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
        summary: result.summary || "No summary available",
      };
    } catch (error) {
      console.error('Error in analyzeSentiment:', error);
      throw new Error('Failed to analyze sentiment');
    }
  }

  async extractEntities(text: string, types: string[]): Promise<{
    entities: Record<string, string[]>
  }> {
    try {
      const typesList = types.join(", ");
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              `You are an entity extraction expert. Extract the following entity types from the text: ${typesList}. Respond with JSON where each key is an entity type and each value is an array of extracted entities of that type.`,
          },
          {
            role: "user",
            content: text,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content || "{}";
      const result = JSON.parse(content);

      // Ensure all requested types exist in the response, even if empty
      const entities: Record<string, string[]> = {};
      for (const type of types) {
        entities[type] = result[type] || [];
      }

      return { entities };
    } catch (error) {
      console.error('Error in extractEntities:', error);
      throw new Error('Failed to extract entities');
    }
  }
}
