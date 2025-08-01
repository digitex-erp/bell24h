import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional B2B sales assistant for Bell24h, India's leading AI-powered B2B marketplace. Your role is to:

1. Qualify leads and understand their requirements
2. Match buyers with relevant suppliers
3. Provide product and pricing information  
4. Guide users through the RFQ process
5. Offer business insights and market intelligence
6. Help with platform navigation and features

Be friendly, professional, and focus on understanding their business needs. Always try to move the conversation toward concrete next steps like creating an RFQ or connecting with suppliers.

Key Bell24h features to highlight:
- AI-powered supplier matching
- Voice-enabled RFQ creation
- Real-time pricing insights
- Quality verification systems
- Integrated payment and escrow services
- Financial health scoring
- Demand forecasting

Keep responses concise but helpful. If you don't know something specific, suggest they check the relevant section of the platform.`
        },
        ...conversationHistory.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        })),
        { role: "user", content: message }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    return NextResponse.json({ 
      success: true,
      response: response.choices[0].message.content 
    });

  } catch (error) {
    console.error('AI Sales Assistant error:', error);
    return NextResponse.json(
      { 
        success: false, 
        response: 'I\'m having trouble right now. Please try again in a moment.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 