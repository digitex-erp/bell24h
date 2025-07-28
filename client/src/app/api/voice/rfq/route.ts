import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const userId = formData.get('userId') as string;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Convert audio to base64 for OpenAI API
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    // Step 1: Transcribe audio using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], 'audio.webm', { type: 'audio/webm' }),
      model: 'whisper-1',
      language: 'en',
    });

    const transcribedText = transcription.text;

    // Step 2: Process with GPT-4 to extract RFQ details
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that extracts RFQ (Request for Quote) details from voice input. 
          Extract the following information in JSON format:
          {
            "productName": "Product name mentioned",
            "category": "Business category",
            "quantity": "Quantity required",
            "specifications": "Technical specifications",
            "budget": "Budget range",
            "location": "Delivery location",
            "urgency": "Urgency level (low/medium/high)",
            "additionalRequirements": "Any additional requirements"
          }
          
          If any field is not mentioned, use null. Be precise and extract only what is explicitly stated.`
        },
        {
          role: 'user',
          content: `Extract RFQ details from this voice input: "${transcribedText}"`
        }
      ],
      temperature: 0.1,
    });

    const rfqDetails = JSON.parse(gptResponse.choices[0].message.content || '{}');

    // Step 3: Create RFQ in database
    const rfqData = {
      userId,
      productName: rfqDetails.productName,
      category: rfqDetails.category,
      quantity: rfqDetails.quantity,
      specifications: rfqDetails.specifications,
      budget: rfqDetails.budget,
      location: rfqDetails.location,
      urgency: rfqDetails.urgency,
      additionalRequirements: rfqDetails.additionalRequirements,
      source: 'voice',
      transcribedText,
      status: 'draft'
    };

    // Here you would save to database
    // const savedRFQ = await prisma.rfq.create({ data: rfqData });

    return NextResponse.json({
      success: true,
      message: 'Voice RFQ processed successfully',
      data: {
        rfq: rfqData,
        transcription: transcribedText,
        confidence: transcription.confidence || 0.9
      }
    });

  } catch (error) {
    console.error('Voice RFQ processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process voice RFQ', details: error },
      { status: 500 }
    );
  }
} 