import { storage } from "./storage";
import { RFQ, User, SupplierProfile, Category, InsertAIMatch } from "@shared/schema";
import { WebSocket } from "ws";

// Factors considered in scoring
type MatchFactor = {
  name: string;
  weight: number;
  score: number;
  explanation: string;
};

type MatchExplanation = {
  overall: {
    score: number;
    explanation: string;
  };
  factors: MatchFactor[];
  supplierInfo: {
    id: number;
    name: string;
    company: string;
    riskLevel: 'low' | 'medium' | 'high';
    specialties?: string[];
    certifications?: string[];
    avgRating?: number;
    totalOrders?: number;
    onTimeDeliveryRate?: number;
  };
};

// Mock AI matching algorithm - in a real implementation, this would use ML/AI techniques
export async function generateAIMatches(rfqId: number): Promise<void> {
  try {
    // Get the RFQ details
    const rfq = await storage.getRFQ(rfqId);
    if (!rfq) {
      console.error(`RFQ with ID ${rfqId} not found`);
      return;
    }

    // Get matching suppliers logic (this is simplified)
    // In a real implementation, this would use more sophisticated matching
    const suppliers = await getMatchingSuppliers(rfq);
    
    // Generate and store matches
    for (const supplier of suppliers) {
      const score = calculateMatchScore(rfq, supplier);
      
      // Create match explanation
      const factors = generateMatchFactors(rfq, supplier);
      
      // Insert the match into the database
      await storage.createAIMatch({
        rfqId: rfq.id,
        supplierId: supplier.id,
        score,
        explanation: {
          overall: { 
            score,
            explanation: `${supplier.name} (${supplier.company}) has a ${score}% match with your RFQ based on their expertise, past performance, and pricing.`
          },
          factors
        },
        factors
      });
      
      // Notify the supplier about the potential RFQ match
      // This would use the WebSocket implementation to send real-time notifications
    }
  } catch (error) {
    console.error('Error generating AI matches:', error);
  }
}

async function getMatchingSuppliers(rfq: RFQ): Promise<Array<User & { profile: SupplierProfile | undefined}>> {
  // In a real implementation, this would use a more sophisticated algorithm
  // Get suppliers that have worked in the same category
  const categoryId = rfq.categoryId;
  
  if (!categoryId) {
    return [];
  }
  
  // Get suppliers with profiles
  const suppliers = await storage.getSuppliersByCategory(categoryId);
  
  // Fetch profiles for each supplier
  const suppliersWithProfiles = await Promise.all(
    suppliers.map(async (supplier) => {
      const profile = await storage.getSupplierProfile(supplier.id);
      return {
        ...supplier,
        profile
      };
    })
  );
  
  return suppliersWithProfiles;
}

function calculateMatchScore(rfq: RFQ, supplier: User & { profile: SupplierProfile | undefined }): number {
  // This is a simplified scoring algorithm
  // In a real implementation, this would use ML/AI techniques
  
  // Base score
  let score = 75; // Start with a decent base score
  
  // Check if supplier has a profile
  if (!supplier.profile) {
    return Math.max(50, score - 25); // Reduce score for suppliers without profiles
  }
  
  // Sample scoring factors
  const riskFactor = getRiskFactor(supplier.profile);
  const specializationFactor = getSpecializationFactor(rfq, supplier.profile);
  const performanceFactor = getPerformanceFactor(supplier.profile);
  
  // Calculate final score
  score = score + riskFactor + specializationFactor + performanceFactor;
  
  // Ensure score is between 0 and 100
  return Math.min(100, Math.max(0, score));
}

function getRiskFactor(profile: SupplierProfile): number {
  // Lower risk = higher score
  switch (profile.riskLevel) {
    case 'low':
      return 10;
    case 'medium':
      return 0;
    case 'high':
      return -15;
    default:
      return 0;
  }
}

function getSpecializationFactor(rfq: RFQ, profile: SupplierProfile): number {
  // Check if supplier specialties match the RFQ category
  // This is a simplified implementation
  if (!profile.specialties || !Array.isArray(profile.specialties)) {
    return 0;
  }
  
  // In a real implementation, this would check against the rfq.categoryId
  // and use more sophisticated NLP techniques
  return 5;
}

function getPerformanceFactor(profile: SupplierProfile): number {
  // Higher performance metrics = higher score
  let factor = 0;
  
  // Rating factor
  if (profile.avgRating) {
    factor += (profile.avgRating - 3) * 5; // 5 points per star above 3
  }
  
  // On-time delivery factor
  if (profile.onTimeDeliveryRate) {
    factor += (profile.onTimeDeliveryRate - 0.8) * 20; // Up to 4 points for 100% on-time
  }
  
  // Total orders factor (experience)
  if (profile.totalOrders) {
    if (profile.totalOrders > 50) factor += 5;
    else if (profile.totalOrders > 20) factor += 3;
    else if (profile.totalOrders > 5) factor += 1;
  }
  
  return factor;
}

function generateMatchFactors(rfq: RFQ, supplier: User & { profile: SupplierProfile | undefined }): MatchFactor[] {
  const factors: MatchFactor[] = [];
  
  // Product/specialty fit
  const productFitScore = supplier.profile?.specialties ? 90 : 70;
  factors.push({
    name: "Product fit",
    weight: 0.3,
    score: productFitScore,
    explanation: "Based on supplier's specialties and previous orders in similar categories"
  });
  
  // Quality factor
  const qualityScore = supplier.profile?.avgRating 
    ? Math.min(100, supplier.profile.avgRating * 20) // 5 stars = 100%
    : 75;
  factors.push({
    name: "Quality",
    weight: 0.25,
    score: qualityScore,
    explanation: "Based on supplier's quality ratings from previous buyers"
  });
  
  // Price factor (somewhat random in this demo)
  factors.push({
    name: "Price",
    weight: 0.2,
    score: 75 + Math.floor(Math.random() * 20 - 10), // 65-85% range
    explanation: "Based on supplier's previous pricing in relation to market averages"
  });
  
  // Delivery factor
  const deliveryScore = supplier.profile?.onTimeDeliveryRate 
    ? Math.min(100, supplier.profile.onTimeDeliveryRate * 100)
    : 80;
  factors.push({
    name: "Delivery",
    weight: 0.25,
    score: deliveryScore,
    explanation: "Based on supplier's on-time delivery performance"
  });
  
  return factors;
}

export async function explainMatch(matchId: number): Promise<MatchExplanation> {
  // In a real implementation, this would retrieve the match from the database
  // and generate a detailed explanation using SHAP/LIME techniques
  
  // For now, we'll return a mocked explanation
  return {
    overall: {
      score: 92,
      explanation: "This supplier is an excellent match for your RFQ based on their expertise in electronic components and strong quality ratings from previous buyers."
    },
    factors: [
      {
        name: "Product fit",
        weight: 0.3,
        score: 95,
        explanation: "Supplier has extensive experience with similar electronic components as requested in your RFQ."
      },
      {
        name: "Quality",
        weight: 0.25,
        score: 90,
        explanation: "Supplier has consistently received high quality ratings (4.8/5) from previous buyers."
      },
      {
        name: "Price",
        weight: 0.2,
        score: 75,
        explanation: "Supplier typically offers competitive pricing but not always the lowest cost option."
      },
      {
        name: "Delivery",
        weight: 0.25,
        score: 92,
        explanation: "Supplier has maintained a 92% on-time delivery rate across 32 previous orders."
      }
    ],
    supplierInfo: {
      id: 123,
      name: "TechSupply Solutions",
      company: "TechSupply Solutions Ltd.",
      riskLevel: "low",
      specialties: ["Electronics", "PCB Manufacturing", "Sensors"],
      certifications: ["ISO 9001", "ISO 14001"],
      avgRating: 4.8,
      totalOrders: 32,
      onTimeDeliveryRate: 0.97
    }
  };
}
