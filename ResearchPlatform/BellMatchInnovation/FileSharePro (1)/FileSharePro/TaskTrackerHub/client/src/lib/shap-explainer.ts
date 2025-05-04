// This library implements a simplified version of SHAP (SHapley Additive exPlanations)
// for explainability of supplier recommendations

export interface ShapValue {
  feature: string;
  value: number;
  displayName: string;
}

export interface ShapExplanation {
  baseValue: number;
  outputValue: number;
  features: ShapValue[];
}

export interface SupplierFeatures {
  previousDeliveryPerformance?: number;
  priceCompetitiveness?: number;
  productQualityRating?: number;
  similarIndustryExperience?: number;
  financialStability?: number;
  timeInBusiness?: number;
  geographicProximity?: number;
  complianceScore?: number;
  responsiveness?: number;
  innovationCapability?: number;
  [key: string]: number | undefined;
}

export interface FeatureMetadata {
  displayName: string;
  importance: number;
  direction: 1 | -1; // 1 means higher is better, -1 means lower is better
}

// Mapping of feature keys to their display names and importance
const featureMetadata: Record<string, FeatureMetadata> = {
  previousDeliveryPerformance: { 
    displayName: "Previous Delivery Performance", 
    importance: 5, 
    direction: 1 
  },
  priceCompetitiveness: { 
    displayName: "Price Competitiveness", 
    importance: 4, 
    direction: 1 
  },
  productQualityRating: { 
    displayName: "Product Quality Rating", 
    importance: 4.5, 
    direction: 1 
  },
  similarIndustryExperience: { 
    displayName: "Similar Industry Experience", 
    importance: 3, 
    direction: 1 
  },
  financialStability: { 
    displayName: "Financial Stability", 
    importance: 3.5, 
    direction: 1 
  },
  timeInBusiness: { 
    displayName: "Time in Business", 
    importance: 2, 
    direction: 1 
  },
  geographicProximity: { 
    displayName: "Geographic Proximity", 
    importance: 2.5, 
    direction: 1 
  },
  complianceScore: { 
    displayName: "Compliance Score", 
    importance: 4, 
    direction: 1 
  },
  responsiveness: { 
    displayName: "Responsiveness", 
    importance: 3, 
    direction: 1 
  },
  innovationCapability: { 
    displayName: "Innovation Capability", 
    importance: 2, 
    direction: 1 
  }
};

// Normalization function to get values between 0 and 100
function normalizeValue(value: number, min: number, max: number): number {
  if (max === min) return 50; // Avoid division by zero
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}

/**
 * Calculates the SHAP values for a supplier based on their features
 * @param supplierFeatures The supplier's feature values
 * @param baselineFeatures The baseline feature values (industry average)
 * @returns SHAP explanation of the match score
 */
export function calculateShapValues(
  supplierFeatures: SupplierFeatures, 
  baselineFeatures: SupplierFeatures = {}
): ShapExplanation {
  // Define the base value (average supplier score)
  const baseValue = 50;
  
  // Calculate normalized feature values and contributions
  const shapValues: ShapValue[] = [];
  let totalContribution = 0;
  
  // Process each feature
  for (const [feature, value] of Object.entries(supplierFeatures)) {
    if (value === undefined) continue;
    
    const metadata = featureMetadata[feature] || { 
      displayName: feature, 
      importance: 1, 
      direction: 1 
    };
    
    // Get baseline value or default to 50%
    const baselineValue = baselineFeatures[feature] !== undefined 
      ? baselineFeatures[feature]! 
      : 50;
    
    // Calculate feature's contribution
    const normalizedValue = normalizeValue(value, 0, 100);
    const baselineNormalized = normalizeValue(baselineValue, 0, 100);
    
    // Apply direction (higher or lower is better)
    const valueDiff = metadata.direction * (normalizedValue - baselineNormalized);
    
    // Calculate contribution based on importance and difference from baseline
    const contribution = (valueDiff / 100) * metadata.importance;
    totalContribution += contribution;
    
    // Convert contribution to a percentage impact
    const percentContribution = (contribution / metadata.importance) * 100;
    
    shapValues.push({
      feature,
      value: percentContribution,
      displayName: metadata.displayName
    });
  }
  
  // Calculate final match score
  const outputValue = Math.min(100, Math.max(0, baseValue + totalContribution));
  
  // Sort features by absolute value
  shapValues.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  
  return {
    baseValue,
    outputValue,
    features: shapValues
  };
}

/**
 * Generates SHAP values with realistic data for a supplier
 * @param matchScore Desired overall match score (0-100)
 * @returns SHAP explanation with realistic feature values
 */
export function generateRealisticShapValues(matchScore: number): ShapExplanation {
  // Scale factors based on match score
  const scaleFactor = matchScore / 100;
  
  // Generate plausible feature values for a supplier with this match score
  const supplierFeatures: SupplierFeatures = {
    previousDeliveryPerformance: Math.min(100, 60 + (scaleFactor * 40)),
    priceCompetitiveness: Math.min(100, 50 + (scaleFactor * 50)),
    productQualityRating: Math.min(100, 70 + (scaleFactor * 30)),
    similarIndustryExperience: Math.min(100, 40 + (scaleFactor * 60))
  };
  
  if (matchScore > 75) {
    // High-scoring suppliers have more positive attributes
    supplierFeatures.financialStability = Math.min(100, 80 + (scaleFactor * 20));
    supplierFeatures.responsiveness = Math.min(100, 85 + (scaleFactor * 15));
  }
  
  // Add slight randomization
  for (const [key, value] of Object.entries(supplierFeatures)) {
    if (value === undefined) continue;
    supplierFeatures[key] = Math.min(100, Math.max(0, value + (Math.random() * 10 - 5)));
  }
  
  return calculateShapValues(supplierFeatures);
}
