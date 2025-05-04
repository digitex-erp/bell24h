import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RiskFactor, RiskScore, calculateRiskScore, generateSupplierRiskScore } from "@/lib/risk-scoring";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface SupplierRiskScoreProps {
  supplier: {
    id: number;
    name: string;
    riskScore?: number;
    financialStability?: number;
    qualityControl?: number;
    deliveryRecord?: number;
    complianceRisk?: number;
  };
}

export default function SupplierRiskScore({ supplier }: SupplierRiskScoreProps) {
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null);

  useEffect(() => {
    // If supplier has risk factors, calculate the score from them
    if (
      supplier.financialStability !== undefined ||
      supplier.qualityControl !== undefined ||
      supplier.deliveryRecord !== undefined ||
      supplier.complianceRisk !== undefined
    ) {
      const score = calculateRiskScore({
        financialStability: supplier.financialStability,
        qualityControl: supplier.qualityControl,
        deliveryRecord: supplier.deliveryRecord,
        complianceRisk: supplier.complianceRisk,
      });
      setRiskScore(score);
    } else if (supplier.riskScore !== undefined) {
      // If supplier has a risk score but no factors, generate factors based on the score
      const score = generateSupplierRiskScore(supplier.name, supplier.riskScore);
      setRiskScore(score);
    } else {
      // Generate a completely new score
      const score = generateSupplierRiskScore(supplier.name);
      setRiskScore(score);
    }
  }, [supplier]);

  if (!riskScore) {
    return (
      <div className="p-4 text-center">
        <p className="text-dark-500">Calculating risk score...</p>
      </div>
    );
  }

  // Get score color and icon
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  // Get factor status icon
  const getFactorIcon = (factor: RiskFactor) => {
    switch (factor.status) {
      case "good":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case "danger":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Overall Risk Score */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center">
          {getScoreIcon(riskScore.overallScore)}
          <div className="ml-2">
            <h3 className="font-medium text-dark-800">Overall Risk Score</h3>
            <p className="text-sm text-dark-500">
              {riskScore.scoreCategory === "low" && "Low risk supplier"}
              {riskScore.scoreCategory === "medium" && "Medium risk supplier"}
              {riskScore.scoreCategory === "high" && "High risk supplier"}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-dark-50">
          <span className={`text-2xl font-bold ${getScoreColor(riskScore.overallScore)}`}>
            {riskScore.overallScore}
          </span>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="space-y-4">
        <h3 className="font-medium text-dark-700">Risk Factor Breakdown</h3>
        
        {riskScore.factors.map((factor, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {getFactorIcon(factor)}
                <span className="ml-2 text-sm text-dark-700">
                  {factor.name === "financialStability" && "Financial Stability"}
                  {factor.name === "qualityControl" && "Quality Control"}
                  {factor.name === "deliveryRecord" && "Delivery Record"}
                  {factor.name === "complianceRisk" && "Compliance Risk"}
                </span>
              </div>
              <span className={`text-sm font-medium ${getScoreColor(factor.score)}`}>
                {factor.score}
              </span>
            </div>
            <Progress 
              value={factor.score} 
              className="h-2" 
              indicatorClassName={
                factor.status === "good" ? "bg-green-500" : 
                factor.status === "warning" ? "bg-yellow-500" : 
                "bg-red-500"
              }
            />
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="p-4 text-sm border rounded-lg bg-dark-50">
        <h3 className="font-medium text-dark-700 mb-2">Recommendations</h3>
        <ul className="space-y-1 text-dark-600">
          {riskScore.overallScore >= 80 ? (
            <>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                Suitable for strategic partnership
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                Consider long-term contracts
              </li>
            </>
          ) : riskScore.overallScore >= 60 ? (
            <>
              <li className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                Monitor performance closely
              </li>
              <li className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                Use milestone-based payments
              </li>
            </>
          ) : (
            <>
              <li className="flex items-center">
                <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                Use escrow for all transactions
              </li>
              <li className="flex items-center">
                <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                Consider alternative suppliers
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
