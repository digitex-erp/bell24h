import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface VoiceRFQResponse {
  success: boolean;
  transcription: string;
  rfqData: {
    title: string;
    description: string;
    category: string;
    quantity: number;
    unit: string;
    budget: number;
    currency: string;
    deadline: string;
    specifications: Record<string, any>;
    urgency: 'low' | 'medium' | 'high';
    location: string;
  };
  confidence: number;
  processingTime: number;
  language: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log('🎤 Voice RFQ endpoint hit');

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = (formData.get('language') as string) || 'en';
    const userId = formData.get('userId') as string;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Validate audio file
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Audio file too large. Maximum size is 25MB' },
        { status: 400 }
      );
    }

    const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/m4a', 'audio/webm', 'audio/ogg'];
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json(
        { error: 'Invalid audio format. Supported: WAV, MP3, M4A, WebM, OGG' },
        { status: 400 }
      );
    }

    console.log('🔊 Processing audio file...');

    // Convert File to buffer for OpenAI
    const audioBuffer = await audioFile.arrayBuffer();

    // Transcribe audio using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], 'audio.wav', { type: 'audio/wav' }),
      model: 'whisper-1',
      language: language,
      response_format: 'verbose_json',
    });

    console.log('📝 Transcription completed:', transcription.text);

    // Extract RFQ data using GPT-4
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert B2B procurement assistant. Extract structured RFQ (Request for Quote) data from the user's voice input. 
          
          Return ONLY a valid JSON object with these fields:
          {
            "title": "Brief RFQ title",
            "description": "Detailed description",
            "category": "Product category (e.g., Steel, Electronics, Textiles)",
            "quantity": number,
            "unit": "Unit of measurement (kg, pieces, meters, etc.)",
            "budget": number,
            "currency": "INR",
            "deadline": "YYYY-MM-DD",
            "specifications": {},
            "urgency": "low|medium|high",
            "location": "City/State"
          }
          
          If any field cannot be determined, use reasonable defaults.`,
        },
        {
          role: 'user',
          content: `Extract RFQ data from this voice input: "${transcription.text}"`,
        },
      ],
      temperature: 0.1,
      max_tokens: 500,
    });

    const rfqData = JSON.parse(gptResponse.choices[0].message.content || '{}');

    // Validate and set defaults
    const validatedRFQ = {
      title: rfqData.title || 'Voice RFQ',
      description: rfqData.description || transcription.text,
      category: rfqData.category || 'General',
      quantity: rfqData.quantity || 1,
      unit: rfqData.unit || 'pieces',
      budget: rfqData.budget || 10000,
      currency: rfqData.currency || 'INR',
      deadline:
        rfqData.deadline ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      specifications: rfqData.specifications || {},
      urgency: rfqData.urgency || 'medium',
      location: rfqData.location || 'India',
    };

    const processingTime = Date.now() - startTime;

    const response: VoiceRFQResponse = {
      success: true,
      transcription: transcription.text,
      rfqData: validatedRFQ,
      confidence: transcription.confidence || 0.85,
      processingTime,
      language,
    };

    console.log(`✅ Voice RFQ processed successfully in ${processingTime}ms`);

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Voice RFQ processing failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Voice RFQ processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    endpoint: '/api/voice-rfq',
    methods: ['POST', 'GET'],
    description: 'Voice-to-RFQ conversion using OpenAI Whisper and GPT-4',
    features: [
      'Speech-to-text transcription',
      'Automatic RFQ data extraction',
      'Multi-language support',
      'Confidence scoring',
      'Processing time tracking',
    ],
    supportedFormats: ['WAV', 'MP3', 'M4A', 'WebM', 'OGG'],
    maxFileSize: '25MB',
    usage: {
      upload: 'POST with FormData containing audio file',
      parameters: {
        audio: 'Audio file (required)',
        language: 'Language code (optional, default: en)',
        userId: 'User ID (optional)',
      },
    },
    example: {
      transcription: 'I need 1000 kg of steel pipes for construction project',
      rfqData: {
        title: 'Steel Pipes for Construction',
        description: 'Need 1000 kg of steel pipes for construction project',
        category: 'Steel',
        quantity: 1000,
        unit: 'kg',
        budget: 500000,
        currency: 'INR',
        deadline: '2024-02-15',
        urgency: 'medium',
        location: 'Mumbai',
      },
    },
  });
}
