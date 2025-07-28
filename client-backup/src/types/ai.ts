/**
 * Types for AI explainability features (SHAP/LIME) and AI decision making
 */

export type ModelType = 
  | 'rfq_analysis' 
  | 'pricing' 
  | 'supplier_selection' 
  | 'inventory'
  | 'code_analysis';

export interface AIDecision<T = any> {
  confidence: number;
  reasoning: string;
  recommendations: string[];
  data: T;
  timestamp: string;
  modelVersion: string;
}

export interface AIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface AIRequestContext {
  rfqData?: RFQData;
  pricingModel?: PricingModel;
  codeSnippet?: string;
  [key: string]: any;
}

// Base interfaces for AI features
// Standardized FeatureImportance interface
export interface FeatureImportance {
  feature: string;
  importance: number;
  direction?: 'positive' | 'negative' | 'neutral';
  value?: number | string;
}


// Standardized ModelExplanation interface
export interface ModelExplanation {
  id: string;
  modelType: string;
  explainabilityType: 'shap' | 'lime' | string;
  features: FeatureImportance[];
  prediction: number | string;
  timestamp: string;
  confidence?: number;
  metadata?: Record<string, unknown>;
  modelId?: string;
  inputData?: Record<string, unknown> | null;
  explanation?: Record<string, unknown> | null;
  modelName?: string;
  predictionClass?: string;
  method?: string;
  actualValue?: number | string;
  instanceId?: string;
}


export interface ExplanationRequest {
  modelId: string;
  instanceId: string;
  explainabilityType: 'shap' | 'lime';
  features: Record<string, number | string | boolean>;
  options?: Record<string, any>;
}

export interface ExplanationResponse {
  success: boolean;
  explanation?: ModelExplanation;
  error?: string;
}

// RFQ and Pricing related types
export interface RFQData {
  id: string;
  items: RFQItem[];
  supplierId?: string;
  status: 'draft' | 'sent' | 'in_review' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  // Add more RFQ specific fields as needed
}

export interface RFQItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  // Add more item specific fields as needed
}

export interface PricingModel {
  id: string;
  name: string;
  type: 'fixed' | 'tiered' | 'dynamic';
  parameters: Record<string, any>;
  // Add more pricing model specific fields as needed
}
