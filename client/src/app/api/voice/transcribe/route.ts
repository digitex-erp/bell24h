import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({
        error: 'No audio file provided',
        success: false
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/webm', 'audio/ogg'];
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json({
        error: 'Unsupported audio format. Supported: WAV, MP3, MPEG, WebM, OGG',
        success: false
      }, { status: 400 });
    }

    // Validate file size (10MB limit)
    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (audioFile.size > maxBytes) {
      return NextResponse.json({
        error: 'File too large. Maximum size is 10MB',
        success: false
      }, { status: 400 });
    }

    // Mock transcription process - in production, integrate with actual speech-to-text APIs
    // like Google Speech-to-Text, Azure Cognitive Services, AWS Transcribe, etc.
    const transcription = await mockSpeechToText(audioFile);

    return NextResponse.json({
      success: true,
      data: {
        transcription: transcription.text,
        confidence: transcription.confidence,
        duration: transcription.duration,
        language: transcription.language,
        wordTimings: transcription.wordTimings,
        metadata: {
          originalFileName: audioFile.name,
          fileSize: audioFile.size,
          mimeType: audioFile.type,
          processedAt: new Date().toISOString(),
          processingTime: transcription.processingTime
        }
      }
    });

  } catch (error) {
    console.error('Voice transcription error:', error);
    return NextResponse.json({
      error: 'Failed to process voice transcription',
      success: false
    }, { status: 500 });
  }
}

async function mockSpeechToText(audioFile: File) {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

  // Mock transcription based on file content or generate sample text
  const fileName = audioFile.name.toLowerCase();
  let mockTranscription = '';

  // Determine content based on filename or generate realistic sample
  if (fileName.includes('rfq') || fileName.includes('quote') || fileName.includes('requirement')) {
    mockTranscription = getRFQTranscription();
  } else if (fileName.includes('feedback') || fileName.includes('review')) {
    mockTranscription = getFeedbackTranscription();
  } else {
    mockTranscription = getGeneralBusinessTranscription();
  }

  // Generate word timings (mock)
  const words = mockTranscription.split(' ');
  const wordTimings = words.map((word, index) => ({
    word,
    start: index * 0.3 + Math.random() * 0.2,
    end: (index + 1) * 0.3 + Math.random() * 0.2,
    confidence: 0.85 + Math.random() * 0.14 // 0.85-0.99
  }));

  return {
    text: mockTranscription,
    confidence: 0.92 + Math.random() * 0.07, // 0.92-0.99
    language: 'en-IN', // Indian English
    duration: mockTranscription.length * 0.05, // Rough estimate: 50ms per character
    processingTime: Math.random() * 2 + 1, // 1-3 seconds
    wordTimings
  };
}

function getRFQTranscription() {
  return "Hi, we are looking to purchase industrial valves for our manufacturing plant. We need approximately 500 units of stainless steel ball valves, size 2 inches, with pressure rating of 300 PSI. The valves should be compliant with IS standards and have PTFE seals. Delivery required within 30 days from order confirmation. Please provide quotation with all applicable taxes and transportation charges. We prefer suppliers who can provide installation support as well.";
}

function getFeedbackTranscription() {
  return "Thank you for providing the quotation for the industrial pumps. Your pricing is very competitive, and we appreciate the detailed technical specifications you included. However, we would like to know about your delivery timeline and whether you provide on-site installation services. Also, could you confirm if these pumps are covered under any warranty period and what the maintenance schedule would be? Overall, we're very impressed with your response time and professionalism.";
}

function getGeneralBusinessTranscription() {
  return "I wanted to discuss the upcoming project requirements for our new facility. We're planning to set up a manufacturing unit for automotive components and would need regular supply of cold rolled steel sheets. The specifications are CR4 grade steel, thickness 2 millimeters, width 1250 millimeters, and we would need approximately 100 metric tons per month. Please let me know your capabilities and pricing structure. Also, what are your minimum order quantities and payment terms?";
}

export async function GET() {
  // Health check endpoint
  return NextResponse.json({
    success: true,
    message: 'Voice transcription service is active',
    supportedFormats: ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/webm', 'audio/ogg'],
    maxFileSize: '10MB',
    supportedLanguages: ['en-IN', 'hi-IN', 'mr-IN', 'ta-IN', 'te-IN']
  });
}
