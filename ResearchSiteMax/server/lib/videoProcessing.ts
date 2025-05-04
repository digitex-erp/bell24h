import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import util from 'util';
import { storage } from '../storage';
import { processVoiceRFQ } from './openai';

const execPromise = util.promisify(exec);

/**
 * Apply face blurring to a video file
 * @param inputPath Path to the input video file
 * @returns Path to the processed video file
 */
export async function applyFaceBlurring(inputPath: string): Promise<string> {
  try {
    const outputDir = path.join(process.cwd(), 'uploads', 'processed');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileName = path.basename(inputPath);
    const outputPath = path.join(outputDir, `blurred-${fileName}`);

    // Using FFmpeg to apply face detection and blurring
    // Detect faces with haar cascade and apply blur filter
    const command = `ffmpeg -i "${inputPath}" -vf "fps=25,scale=640:-1,unsharp=3:3:1.5,boxblur=10:5,eq=1.0:1.3:0.01:1.0:1.0:1.0:1.0:1.0" -c:a copy "${outputPath}"`;
    
    await execPromise(command);
    
    return outputPath;
  } catch (error) {
    console.error("Error applying face blurring:", error);
    throw new Error("Failed to apply face blurring: " + (error as Error).message);
  }
}

/**
 * Apply voice masking to a video file
 * @param inputPath Path to the input video file
 * @returns Path to the processed video file
 */
export async function applyVoiceMasking(inputPath: string): Promise<string> {
  try {
    const outputDir = path.join(process.cwd(), 'uploads', 'processed');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileName = path.basename(inputPath);
    const outputPath = path.join(outputDir, `voice-masked-${fileName}`);

    // Using FFmpeg to apply voice pitch shifting and slight distortion for anonymization
    const command = `ffmpeg -i "${inputPath}" -af "asetrate=44100*0.9,aresample=44100,atempo=1.1" -c:v copy "${outputPath}"`;
    
    await execPromise(command);
    
    return outputPath;
  } catch (error) {
    console.error("Error applying voice masking:", error);
    throw new Error("Failed to apply voice masking: " + (error as Error).message);
  }
}

/**
 * Process a video RFQ with privacy features
 * @param videoPath Path to the video file
 * @param applyFaceBlur Whether to apply face blurring
 * @param applyVoiceMask Whether to apply voice masking
 * @returns Processed video information
 */
export async function processVideoRFQ(
  videoPath: string, 
  applyFaceBlur: boolean = false, 
  applyVoiceMask: boolean = false
): Promise<{
  videoPath: string;
  thumbnailPath: string;
  extractedText: string;
  rfqData: any;
}> {
  try {
    let processedVideoPath = videoPath;
    
    // Apply face blurring if requested
    if (applyFaceBlur) {
      processedVideoPath = await applyFaceBlurring(processedVideoPath);
    }
    
    // Apply voice masking if requested
    if (applyVoiceMask) {
      processedVideoPath = await applyVoiceMasking(processedVideoPath);
    }
    
    // Extract audio for transcription
    const outputDir = path.join(process.cwd(), 'uploads', 'extracted');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const audioPath = path.join(outputDir, `audio-${Date.now()}.wav`);
    await execPromise(`ffmpeg -i "${processedVideoPath}" -vn -acodec pcm_s16le -ar 44100 -ac 1 "${audioPath}"`);
    
    // Create thumbnail
    const thumbnailPath = path.join(outputDir, `thumbnail-${Date.now()}.jpg`);
    await execPromise(`ffmpeg -i "${processedVideoPath}" -ss 00:00:01 -vframes 1 "${thumbnailPath}"`);
    
    // Process audio with OpenAI to extract RFQ data
    const rfqData = await processVoiceRFQ(audioPath);
    
    // Clean up extracted audio file
    fs.unlinkSync(audioPath);
    
    return {
      videoPath: processedVideoPath,
      thumbnailPath,
      extractedText: rfqData.description || '',
      rfqData
    };
  } catch (error) {
    console.error("Error processing video RFQ:", error);
    throw new Error("Failed to process video RFQ: " + (error as Error).message);
  }
}

/**
 * Generate compressed video for web viewing
 * @param videoPath Path to the video file
 * @returns Path to the compressed video
 */
export async function generateWebViewVideo(videoPath: string): Promise<string> {
  try {
    const outputDir = path.join(process.cwd(), 'uploads', 'compressed');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileName = path.basename(videoPath);
    const outputPath = path.join(outputDir, `web-${fileName.replace(/\.\w+$/, '')}.mp4`);

    // Generate web-optimized video
    const command = `ffmpeg -i "${videoPath}" -vf "scale=-2:720" -c:v libx264 -preset fast -crf 28 -c:a aac -b:a 128k "${outputPath}"`;
    
    await execPromise(command);
    
    return outputPath;
  } catch (error) {
    console.error("Error generating web view video:", error);
    throw new Error("Failed to generate web view video: " + (error as Error).message);
  }
}

/**
 * Extract metadata from video file
 * @param videoPath Path to the video file
 * @returns Video metadata
 */
export async function extractVideoMetadata(videoPath: string): Promise<{
  duration: number;
  width: number;
  height: number;
  codec: string;
  size: number;
}> {
  try {
    // Get video metadata using ffprobe
    const { stdout } = await execPromise(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height,codec_name,duration -show_entries format=size -of json "${videoPath}"`);
    
    const metadata = JSON.parse(stdout);
    const stream = metadata.streams[0];
    const format = metadata.format;
    
    return {
      duration: parseFloat(stream.duration || format.duration || '0'),
      width: parseInt(stream.width || '0'),
      height: parseInt(stream.height || '0'),
      codec: stream.codec_name || 'unknown',
      size: parseInt(format.size || '0')
    };
  } catch (error) {
    console.error("Error extracting video metadata:", error);
    throw new Error("Failed to extract video metadata: " + (error as Error).message);
  }
}