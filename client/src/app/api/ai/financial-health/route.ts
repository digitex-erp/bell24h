import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { gstNumber, companyData, bankStatements } = await request.json();

    const healthAnalysis = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert credit risk analyst specializing in Indian MSME and manufacturing companies. Analyze supplier data and provide a comprehensive financial health score. Consider GST filing patterns, business registration, payment history, and industry reputation.`
        },
        {
          role: "user",
          content: `
          Analyze financial health for:
          GST Number: ${gstNumber}
          Company Data: ${JSON.stringify(companyData)}
          Bank Statements: ${JSON.stringify(bankStatements)}
          
          Consider:
          - GST filing regularity and compliance
          - Financial stability indicators
          - Business registration status
          - Payment history patterns
          - Industry reputation signals
          - Compliance track record
          - Cash flow analysis
          - Credit utilization patterns
          
          Return JSON response:
          {
            "healthScore": number (0-100),
            "riskLevel": "low|medium|high",
            "creditRating": "A+|A|B+|B|C|D",
            "strengths": string[],
            "concerns": string[],
            "recommendation": string,
            "trustBadge": "verified|caution|unverified",
            "creditLimit": number,
            "paymentTerms": string,
            "confidence": number (0-100),
            "lastUpdated": string
          }
          `
        }
      ],
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(healthAnalysis.choices[0].message.content);
    
    // Add timestamp
    analysis.lastUpdated = new Date().toISOString();
    analysis.reportId = `FH-${Date.now()}`;

    return NextResponse.json({
      success: true,
      data: analysis,
      message: 'Financial health analysis completed'
    });

  } catch (error) {
    console.error('Financial health analysis error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Analysis failed. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 