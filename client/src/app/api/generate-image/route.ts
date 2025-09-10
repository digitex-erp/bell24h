import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, size = '1024x1024' } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Generate image using DALL-E
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: size as "1024x1024" | "1792x1024" | "1024x1792",
      quality: "standard",
      n: 1,
    });

    const imageUrl = response.data[0]?.url;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt
    });

  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({
      error: 'Failed to generate image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
