import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, X, Info } from "lucide-react";
import { MatchExplanation } from "@/types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface AIExplanationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierId: number | null;
}

export default function AIExplanationDialog({
  open,
  onOpenChange,
  supplierId,
}: AIExplanationDialogProps) {
  const [explanation, setExplanation] = useState<MatchExplanation | null>(null);

  // Only fetch when dialog is open and we have a supplierId
  const shouldFetch = open && supplierId !== null;
  
  const { data, isLoading } = useQuery({
    queryKey: [
      shouldFetch ? `/api/ai/explain-match/${supplierId}` : null
    ],
    enabled: shouldFetch,
  });

  useEffect(() => {
    if (data) {
      setExplanation(data);
    }
  }, [data]);

  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-amber-500";
    return "bg-red-500";
  };

  // Get risk color
  const getRiskColor = (level: string) => {
    switch (level) {
      case "low": return "text-green-800 bg-green-50";
      case "medium": return "text-amber-800 bg-amber-50";
      case "high": return "text-red-800 bg-red-50";
      default: return "text-green-800 bg-green-50";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sm:flex sm:items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
            <Info className="h-6 w-6 text-primary-600" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <DialogTitle>AI Match Explanation</DialogTitle>
            <DialogDescription>
              Here's how our AI determined this supplier is a good match for your RFQ.
            </DialogDescription>
          </div>
          <button 
            type="button" 
            className="ml-auto flex-shrink-0 bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={() => onOpenChange(false)}
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : explanation ? (
          <div className="mt-6">
            <div className="flex items-center mb-4">
              <Avatar className="h-12 w-12 rounded-full mr-4">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(explanation.supplierInfo.name)}&background=random`} alt={explanation.supplierInfo.name} />
                <AvatarFallback>{getInitials(explanation.supplierInfo.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-base font-medium text-neutral-800">{explanation.supplierInfo.name}</p>
                <p className="text-sm text-neutral-500">{explanation.overall.score}% Match Score</p>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-neutral-700 mb-2">Match Factors</h4>
              <div className="space-y-3">
                {explanation.factors.map((factor, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className={`${getScoreColor(factor.score)} h-4 rounded-full`} 
                        style={{ width: `${factor.score}%` }}
                      ></div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-neutral-700 w-24">
                      {factor.name} ({factor.score}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-neutral-700 mb-2">SHAP Analysis</h4>
              <p className="text-sm text-neutral-600 mb-4">
                Feature importance based on historical performance and your RFQ requirements:
              </p>
              <div className="h-48 bg-white p-4 rounded border border-gray-200 mb-2 flex flex-col">
                <p className="text-sm text-neutral-800 mb-2">Key influencing factors:</p>
                <ul className="space-y-2 text-sm">
                  {explanation.factors.map((factor, index) => (
                    <li key={index} className="flex items-center">
                      <span className={`w-2 h-2 rounded-full ${getScoreColor(factor.score)} mr-2`}></span>
                      <span className="text-neutral-700">{factor.explanation}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-auto text-xs text-neutral-500 italic">Based on analysis of 500+ similar RFQs</p>
              </div>
              <p className="text-xs text-neutral-500">
                {explanation.overall.explanation}
              </p>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-neutral-700 mb-2">Risk Assessment</h4>
              <div className={`flex items-center p-3 rounded-md ${getRiskColor(explanation.supplierInfo.riskLevel)}`}>
                <div className="flex-shrink-0">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{explanation.supplierInfo.riskLevel.charAt(0).toUpperCase() + explanation.supplierInfo.riskLevel.slice(1)} Risk Score</p>
                  <p className="text-xs mt-1">
                    {explanation.supplierInfo.totalOrders 
                      ? `This supplier has completed ${explanation.supplierInfo.totalOrders} orders with ${(explanation.supplierInfo.onTimeDeliveryRate || 0) * 100}% on-time delivery and ${explanation.supplierInfo.avgRating}/5 quality rating.`
                      : "Insufficient data to calculate detailed risk metrics."
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-neutral-500">
            No explanation data available
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button 
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Contact Supplier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
