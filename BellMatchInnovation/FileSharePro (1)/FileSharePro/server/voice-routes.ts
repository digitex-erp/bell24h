import { FastifyInstance } from 'fastify';
import { openai } from './openai';
import ffmpeg from 'fluent-ffmpeg';
import { ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import path from 'path';
import fs from 'fs';

ffmpeg.setFffmpegPath(ffmpegPath);

interface VoiceRFQRequest {
  audio: Buffer;
  language?: string;
}

export async function voiceRoutes(app: FastifyInstance) {
  app.post('/api/voice/transcribe', async (request, reply) => {
    try {
      const data = await request.file();
      if (!data) {
        return reply.code(400).send({ error: 'No audio file uploaded' });
      }

      const fileBuffer = await data.toBuffer();
      const tmpFile = path.join(__dirname, '../uploads', `${Date.now()}.wav`);
      await fs.promises.writeFile(tmpFile, fileBuffer);

      // Convert audio to required format
      await new Promise((resolve, reject) => {
        ffmpeg(tmpFile)
          .toFormat('wav')
          .save(tmpFile)
          .on('end', resolve)
          .on('error', reject);
      });

      const transcriptionResponse = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tmpFile),
        model: "whisper-1",
        language: request.query.language || 'en'
      });

      await fs.promises.unlink(tmpFile);

      const rfqDetails = await extractRFQDetails(transcriptionResponse.text);

      return {
        transcription: transcriptionResponse.text,
        rfqDetails
      };
    } catch (error) {
      console.error('Voice transcription error:', error);
      return reply.code(500).send({ error: 'Failed to process voice input' });
    }
  });
  app.post('/api/video/upload', async (req, reply) => {
    try {
      const data = await req.file();
      if (!data) {
        return reply.code(400).send({ error: 'No video file uploaded' });
      }

      const result = await handleVideoUpload(data);
      return result;
    } catch (error) {
      console.error('Video upload error:', error);
      return reply.code(500).send({ error: 'Failed to process video RFQ' });
    }
  });
}

async function extractRFQDetails(text: string) {
  const prompt = `Extract RFQ details from the following text. Return JSON with keys: title, description, quantity, category, budget. Text: "${text}"`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  try {
    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Failed to parse RFQ details:', error);
    return null;
  }
}

async function handleVideoUpload(data: any) {
    //Implementation for video handling would go here.  This is a placeholder.
    return {message: "Video upload successful"};
}