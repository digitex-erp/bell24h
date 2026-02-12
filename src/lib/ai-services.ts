import { aiRouter } from '../lib/ai-model-router';

/**
 * Bell24H AI Service Implementations
 * 
 * Production-ready services using the AI model router
 * with proper GPT-4 fallback for critical functions
 */

// ==================== SAFE TO USE GPT-OSS-20B ====================

/**
 * RFQ Categorization - 80% cost savings with GPT-OSS-20B
 * ✅ Safe for general categorization tasks
 */
export async function categorizeRFQ(rfqText: string): Promise<string> {
  const result = await aiRouter.createChatCompletion(
    {
      taskType: 'rfq_categorization',
      criticality: 'medium',
      volume: 'high',
      accuracyRequirement: 'business',
    },
    [{
      role: 'user',
      content: `Analyze this RFQ and categorize it into the most appropriate industry:
      
RFQ Text: "${rfqText}"

Categories: Agriculture, Construction, Manufacturing, Chemicals, Electronics, Textiles, Automotive, Healthcare, Energy, Technology, Food & Beverage, Mining, Logistics, Other

Respond with just the category name. If multiple categories apply, choose the most relevant one.`
    }],
    { temperature: 0.3, maxTokens: 50 }
  );
  
  return result.response.choices[0].message.content.trim();
}

/**
 * Content Generation - 80% cost savings with GPT-OSS-20B
 * ✅ Perfect for marketing content, product descriptions
 */
export async function generateProductDescription(productData: {
  name: string;
  category: string;
  features: string[];
  specifications: Record<string, string>;
}): Promise<string> {
  const result = await aiRouter.createChatCompletion(
    {
      taskType: 'content_generation',
      criticality: 'medium',
      volume: 'high',
      accuracyRequirement: 'business',
    },
    [{
      role: 'user',
      content: `Create a compelling product description for B2B marketplace:

Product: ${productData.name}
Category: ${productData.category}
Features: ${productData.features.join(', ')}
Specifications: ${JSON.stringify(productData.specifications)}

Write a professional description that highlights key benefits for industrial buyers. Keep it under 200 words.`
    }],
    { temperature: 0.7, maxTokens: 300 }
  );
  
  return result.response.choices[0].message.content;
}

/**
 * Chat Support - 80% cost savings with GPT-OSS-20B
 * ✅ General customer support and FAQs
 */
export async function handleChatSupport(userMessage: string, context?: string): Promise<string> {
  const result = await aiRouter.createChatCompletion(
    {
      taskType: 'chat_support',
      criticality: 'medium',
      volume: 'high',
      accuracyRequirement: 'general',
    },
    [
      {
        role: 'system',
        content: 'You are a helpful assistant for Bell24H B2B marketplace. Answer questions about RFQs, suppliers, payments, and platform features. Be concise and professional.'
      },
      {
        role: 'user',
        content: context ? `${context}\n\nUser: ${userMessage}` : userMessage
      }
    ],
    { temperature: 0.5, maxTokens: 200 }
  );
  
  return result.response.choices[0].message.content;
}

// ==================== KEEP GPT-4 FOR CRITICAL FUNCTIONS ====================

/**
 * Risk Assessment - KEEP GPT-4 for accuracy
 * ❌ Critical function requiring highest accuracy
 */
export async function assessSupplierRisk(supplierData: {
  companyName: string;
  yearsInBusiness: number;
  previousContracts: number;
  rating: number;
  location: string;
  paymentHistory: string;
  financialIndicators?: Record<string, any>;
}): Promise<{
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  factors: string[];
  recommendations: string[];
}> {
  const result = await aiRouter.createChatCompletion(
    {
      taskType: 'risk_assessment',
      criticality: 'high',
      volume: 'medium',
      accuracyRequirement: 'legal',
    },
    [{
      role: 'user',
      content: `Assess supplier risk for Bell24H marketplace:

Company: ${supplierData.companyName}
Years in Business: ${supplierData.yearsInBusiness}
Previous Contracts: ${supplierData.previousContracts}
Rating: ${supplierData.rating}/5
Location: ${supplierData.location}
Payment History: ${supplierData.paymentHistory}
${supplierData.financialIndicators ? `Financial Indicators: ${JSON.stringify(supplierData.financialIndicators)}` : ''}

Provide risk assessment in JSON format:
{
  "riskLevel": "LOW|MEDIUM|HIGH",
  "confidence": 0-1,
  "factors": ["list of risk factors"],
  "recommendations": ["specific recommendations"]
}`
    }],
    { temperature: 0.1, maxTokens: 500 }
  );
  
  try {
    return JSON.parse(result.response.choices[0].message.content);
  } catch (error) {
    // Fallback parsing
    const content = result.response.choices[0].message.content;
    return {
      riskLevel: 'MEDIUM',
      confidence: 0.7,
      factors: ['Unable to parse detailed assessment'],
      recommendations: ['Manual review recommended']
    };
  }
}

/**
 * Fraud Detection - KEEP GPT-4 for accuracy
 * ❌ Critical function requiring highest accuracy
 */
export async function detectPaymentFraud(paymentData: {
  amount: number;
  method: string;
  userId: string;
  supplierId: string;
  location: string;
  deviceFingerprint: string;
  transactionHistory: any[];
}): Promise<{
  fraudScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  flags: string[];
  action: 'APPROVE' | 'REVIEW' | 'BLOCK';
}> {
  const result = await aiRouter.createChatCompletion(
    {
      taskType: 'fraud_detection',
      criticality: 'high',
      volume: 'medium',
      accuracyRequirement: 'legal',
    },
    [{
      role: 'user',
      content: `Detect payment fraud for Bell24H transaction:

Amount: ₹${paymentData.amount}
Method: ${paymentData.method}
User ID: ${paymentData.userId}
Supplier ID: ${paymentData.supplierId}
Location: ${paymentData.location}
Device: ${paymentData.deviceFingerprint}
Transaction History: ${paymentData.transactionHistory.length} previous transactions

Provide fraud detection in JSON format:
{
  "fraudScore": 0-1,
  "riskLevel": "LOW|MEDIUM|HIGH",
  "flags": ["list of fraud indicators"],
  "action": "APPROVE|REVIEW|BLOCK"
}`
    }],
    { temperature: 0.1, maxTokens: 400 }
  );
  
  try {
    return JSON.parse(result.response.choices[0].message.content);
  } catch (error) {
    return {
      fraudScore: 0.5,
      riskLevel: 'MEDIUM',
      flags: ['Unable to parse detailed analysis'],
      action: 'REVIEW'
    };
  }
}

/**
 * Complex Sentiment Analysis - KEEP GPT-4 for nuance
 * ❌ Requires understanding of business context and negotiation subtleties
 */
export async function analyzeNegotiationSentiment(conversation: string): Promise<{
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  confidence: number;
  negotiationStage: 'INITIAL' | 'DISCUSSION' | 'NEGOTIATION' | 'CLOSING';
  keyInsights: string[];
  recommendedActions: string[];
}> {
  const result = await aiRouter.createChatCompletion(
    {
      taskType: 'sentiment_analysis',
      criticality: 'high',
      volume: 'medium',
      accuracyRequirement: 'business',
    },
    [{
      role: 'user',
      content: `Analyze negotiation sentiment for Bell24H RFQ discussion:

Conversation: "${conversation}"

Provide detailed analysis in JSON format:
{
  "sentiment": "POSITIVE|NEGATIVE|NEUTRAL",
  "confidence": 0-1,
  "negotiationStage": "INITIAL|DISCUSSION|NEGOTIATION|CLOSING",
  "keyInsights": ["list of key insights"],
  "recommendedActions": ["specific next steps"]
}`
    }],
    { temperature: 0.2, maxTokens: 600 }
  );
  
  try {
    return JSON.parse(result.response.choices[0].message.content);
  } catch (error) {
    return {
      sentiment: 'NEUTRAL',
      confidence: 0.5,
      negotiationStage: 'DISCUSSION',
      keyInsights: ['Unable to parse detailed sentiment'],
      recommendedActions: ['Manual review of conversation recommended']
    };
  }
}

// ==================== VOICE/VIDEO PROCESSING ====================

/**
 * Voice RFQ Processing - Minimax M2.1
 * ✅ Multimodal processing for voice content
 */
export async function processVoiceRFQ(audioTranscript: string, language: string = 'english'): Promise<{
  extractedDetails: Record<string, any>;
  productRequirements: string[];
  timeline: string;
  budget: string;
  contactInfo: Record<string, string>;
}> {
  const result = await aiRouter.createChatCompletion(
    {
      taskType: 'voice_processing',
      criticality: 'medium',
      volume: 'medium',
      accuracyRequirement: 'business',
    },
    [{
      role: 'user',
      content: `Extract RFQ details from voice transcript (${language}):

Transcript: "${audioTranscript}"

Provide structured output in JSON format:
{
  "extractedDetails": {"key": "value" pairs},
  "productRequirements": ["list of requirements"],
  "timeline": "delivery timeline",
  "budget": "budget information",
  "contactInfo": {"name": "", "phone": "", "email": ""}
}`
    }],
    { temperature: 0.3, maxTokens: 800 }
  );
  
  try {
    return JSON.parse(result.response.choices[0].message.content);
  } catch (error) {
    return {
      extractedDetails: {},
      productRequirements: ['Unable to parse voice transcript'],
      timeline: 'Unknown',
      budget: 'Unknown',
      contactInfo: {}
    };
  }
}

/**
 * Video Analysis - Minimax M2.1
 * ✅ Process product demonstration videos
 */
export async function analyzeProductVideo(videoDescription: string): Promise<{
  productType: string;
  keyFeatures: string[];
  qualityIndicators: string[];
  suggestedQuestions: string[];
}> {
  const result = await aiRouter.createChatCompletion(
    {
      taskType: 'video_analysis',
      criticality: 'medium',
      volume: 'medium',
      accuracyRequirement: 'business',
    },
    [{
      role: 'user',
      content: `Analyze product demonstration video:

Video Description: "${videoDescription}"

Provide analysis in JSON format:
{
  "productType": "identified product category",
  "keyFeatures": ["list of visible features"],
  "qualityIndicators": ["quality assessment points"],
  "suggestedQuestions": ["questions for supplier"]
}`
    }],
    { temperature: 0.4, maxTokens: 500 }
  );
  
  try {
    return JSON.parse(result.response.choices[0].message.content);
  } catch (error) {
    return {
      productType: 'Unknown',
      keyFeatures: ['Unable to analyze video content'],
      qualityIndicators: ['Manual review required'],
      suggestedQuestions: ['Please provide more details']
    };
  }
}