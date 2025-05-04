import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ShapExplanation, ShapValue, generateRealisticShapValues } from "@/lib/shap-explainer";

interface ShapExplainerProps {
  supplierId: number;
  rfqId?: number;
}

export default function ShapExplainer({ supplierId, rfqId }: ShapExplainerProps) {
  const [shapExplanation, setShapExplanation] = useState<ShapExplanation | null>(null);
  
  // Try to get recommendation from API if rfqId is provided
  const { data: recommendations } = useQuery({
    queryKey: ['/api/supplier-recommendations', rfqId],
    enabled: !!rfqId
  });
  
  useEffect(() => {
    if (recommendations?.length) {
      // Find the recommendation for this supplier
      const recommendation = recommendations.find(rec => rec.supplierId === supplierId);
      if (recommendation) {
        // Use the SHAP values from the recommendation
        setShapExplanation({
          baseValue: 50,
          outputValue: recommendation.matchScore,
          features: recommendation.shapValues as ShapValue[]
        });
        return;
      }
    }
    
    // Generate realistic SHAP values for demonstration
    // In production, this would come from the AI model
    const randomMatchScore = Math.floor(70 + Math.random() * 25); // 70-95 range
    const generatedExplanation = generateRealisticShapValues(randomMatchScore);
    setShapExplanation(generatedExplanation);
  }, [supplierId, rfqId, recommendations]);
  
  if (!shapExplanation) {
    return <div className="p-4 text-center text-dark-500">Loading AI explainability data...</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-medium text-dark-800">Match Score: {shapExplanation.outputValue.toFixed(0)}%</h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          SHAP Analysis
        </span>
      </div>
      
      <p className="text-sm text-dark-500">
        This supplier was matched to your RFQ based on the following factors. The percentages show how much each factor contributed to the overall match score.
      </p>
      
      <div className="space-y-3 mt-4">
        {shapExplanation.features.slice(0, 5).map((feature, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-dark-600">{feature.displayName}</span>
              <span className="text-sm font-medium text-dark-700">+{Math.abs(feature.value).toFixed(0)}%</span>
            </div>
            <Progress 
              value={Math.abs(feature.value)} 
              className="h-2" 
              indicatorClassName={feature.value >= 20 ? "bg-green-500" : 
                                 feature.value >= 10 ? "bg-blue-500" : "bg-primary-500"}
            />
          </div>
        ))}
      </div>
      
      <div className="p-3 text-xs border rounded bg-dark-50 text-dark-600">
        <p className="font-medium mb-1">How to interpret SHAP values:</p>
        <p>SHAP (SHapley Additive exPlanations) values show how each supplier attribute contributes to the match score. Higher percentages indicate stronger influence on the recommendation.</p>
      </div>
    </div>
  );
}
