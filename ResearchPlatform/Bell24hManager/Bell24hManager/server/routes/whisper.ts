import { Router } from 'express';
import multer from 'multer';
import { OpenAIService } from '../services/openai-service';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const openai = new OpenAIService();

router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const audioBuffer = req.file?.buffer;
    const language = req.body.language || 'en-IN';

    if (!audioBuffer) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const transcription = await openai.transcribeAudio(audioBuffer, language);
    res.json({ text: transcription });
  } catch (error) {
    console.error('Whisper API error:', error);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

export default router;