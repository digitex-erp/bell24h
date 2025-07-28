import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { rfqId, supplierId, matchScore } = await request.json();

    // Mock supplier and RFQ data (in real app, fetch from database)
    const supplierData = {
      id: supplierId,
      name: "Tech Solutions Ltd",
      category: "Electronics & Components",
      rating: 4.8,
      responseTime: "2 hours",
      location: "Mumbai, Maharashtra",
      experience: "15 years",
      certifications: ["ISO 9001", "CE Marking"],
      specialization: ["Semiconductors", "PCB Components"],
      pastProjects: 150,
      clientSatisfaction: 96
    };

    const rfqData = {
      id: rfqId,
      productName: "High-quality PCB Components",
      category: "Electronics & Components",
      quantity: "10,000 units",
      budget: "₹5-8 lakhs",
      urgency: "high",
      specifications: "ROHS compliant, lead-free",
      location: "Pune, Maharashtra"
    };

    // Generate AI explanation using GPT-4
    const explanation = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an AI explainability expert. Explain why a supplier was matched to a buyer's RFQ using SHAP/LIME-style explanations. 
          
          Provide explanations in this JSON format:
          {
            "matchScore": "numerical score",
            "primaryReasons": ["reason1", "reason2", "reason3"],
            "categoryMatch": "explanation",
            "locationAdvantage": "explanation", 
            "experienceRelevance": "explanation",
            "certificationMatch": "explanation",
            "riskFactors": ["risk1", "risk2"],
            "confidenceLevel": "high/medium/low",
            "alternativeSuppliers": ["supplier1", "supplier2"],
            "recommendation": "detailed recommendation"
          }
          
          Be specific, data-driven, and explain the matching logic clearly.`
        },
        {
          role: 'user',
          content: `Explain why supplier ${supplierData.name} (${JSON.stringify(supplierData)}) was matched to RFQ ${rfqData.productName} (${JSON.stringify(rfqData)}) with match score ${matchScore}.`
        }
      ],
      temperature: 0.3,
    });

    const explanationData = JSON.parse(explanation.choices[0].message.content || '{}');

    // Calculate SHAP-like feature importance scores
    const featureImportance = {
      categoryMatch: 0.35,
      locationProximity: 0.25,
      experienceLevel: 0.20,
      certificationMatch: 0.15,
      responseTime: 0.05
    };

    return NextResponse.json({
      success: true,
      data: {
        explanation: explanationData,
        featureImportance,
        supplier: supplierData,
        rfq: rfqData,
        matchScore,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI explainability error:', error);
    return NextResponse.json(
      { error: 'Failed to generate explanation', details: error },
      { status: 500 }
    );
  }
} 