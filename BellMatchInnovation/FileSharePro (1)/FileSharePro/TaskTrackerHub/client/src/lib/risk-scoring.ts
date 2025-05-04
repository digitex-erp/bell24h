// Aladin-inspired supplier risk scoring algorithm

export interface RiskFactor {
  name: string;
  score: number;
  status: 'good' | 'warning' | 'danger';
  weight: number;
}

export interface RiskScore {
  overallScore: number;
  scoreCategory: 'low' | 'medium' | 'high';
  factors: RiskFactor[];
}

// Define risk factor weights
const riskFactorWeights = {
  financialStability: 0.3,
  qualityControl: 0.25,
  deliveryRecord: 0.25,
  complianceRisk: 0.2
};

/**
 * Calculate the risk status based on a factor score
 * @param score The factor score
 * @returns The risk status (good, warning, danger)
 */
function getRiskStatus(score: number): 'good' | 'warning' | 'danger' {
  if (score >= 80) return 'good';
  if (score >= 60) return 'warning';
  return 'danger';
}

/**
 * Calculate the risk category based on overall score
 * @param score The overall risk score
 * @returns The risk category (low, medium, high)
 */
function getRiskCategory(score: number): 'low' | 'medium' | 'high' {
  if (score >= 80) return 'low';
  if (score >= 60) return 'medium';
  return 'high';
}

/**
 * Calculate the risk score for a supplier based on multiple factors
 * @param factors Object containing risk factor scores
 * @returns Calculated risk score with breakdown
 */
export function calculateRiskScore(factors: {
  financialStability?: number;
  qualityControl?: number;
  deliveryRecord?: number;
  complianceRisk?: number;
}): RiskScore {
  // Default values if not provided
  const financialStability = factors.financialStability ?? 70;
  const qualityControl = factors.qualityControl ?? 75;
  const deliveryRecord = factors.deliveryRecord ?? 80;
  const complianceRisk = factors.complianceRisk ?? 65;
  
  // Create risk factors array with status
  const riskFactors: RiskFactor[] = [
    {
      name: 'financialStability',
      score: financialStability,
      status: getRiskStatus(financialStability),
      weight: riskFactorWeights.financialStability
    },
    {
      name: 'qualityControl',
      score: qualityControl,
      status: getRiskStatus(qualityControl),
      weight: riskFactorWeights.qualityControl
    },
    {
      name: 'deliveryRecord',
      score: deliveryRecord,
      status: getRiskStatus(deliveryRecord),
      weight: riskFactorWeights.deliveryRecord
    },
    {
      name: 'complianceRisk',
      score: complianceRisk,
      status: getRiskStatus(complianceRisk),
      weight: riskFactorWeights.complianceRisk
    }
  ];
  
  // Calculate weighted average
  const overallScore = Math.round(
    (financialStability * riskFactorWeights.financialStability) +
    (qualityControl * riskFactorWeights.qualityControl) +
    (deliveryRecord * riskFactorWeights.deliveryRecord) +
    (complianceRisk * riskFactorWeights.complianceRisk)
  );
  
  return {
    overallScore,
    scoreCategory: getRiskCategory(overallScore),
    factors: riskFactors
  };
}

/**
 * Generate a risk score for a supplier
 * @param baseName The base name of the supplier (for consistent generation)
 * @param baseScore Optional base score to generate around
 * @returns Generated risk score
 */
export function generateSupplierRiskScore(
  baseName: string,
  baseScore?: number
): RiskScore {
  // Use hash of base name to generate consistent scores for the same supplier
  let hash = 0;
  for (let i = 0; i < baseName.length; i++) {
    hash = ((hash << 5) - hash) + baseName.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Generate a base score if not provided
  const targetScore = baseScore ?? Math.abs(hash % 40) + 60; // 60-100 range
  
  // Generate factor scores that will average approximately to the target
  const variation = 15; // How much factors can vary from target
  
  const factors = {
    financialStability: Math.max(0, Math.min(100, targetScore + (Math.abs(hash % variation) * (hash % 2 ? 1 : -1)))),
    qualityControl: Math.max(0, Math.min(100, targetScore + (Math.abs((hash >> 3) % variation) * ((hash >> 3) % 2 ? 1 : -1)))),
    deliveryRecord: Math.max(0, Math.min(100, targetScore + (Math.abs((hash >> 6) % variation) * ((hash >> 6) % 2 ? 1 : -1)))),
    complianceRisk: Math.max(0, Math.min(100, targetScore + (Math.abs((hash >> 9) % variation) * ((hash >> 9) % 2 ? 1 : -1))))
  };
  
  return calculateRiskScore(factors);
}
