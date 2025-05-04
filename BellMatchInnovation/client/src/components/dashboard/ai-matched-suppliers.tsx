import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { getMatchScoreColor, getRiskGradeDisplay } from '@/lib/utils';
import { getSupplierMatchExplanation } from '@/lib/openai';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SupplierMatchFactor {
  name: string;
  score: number;
}

interface Supplier {
  id: number;
  companyName: string;
  location: string;
  logo?: string;
  matchScore: number;
  verified: boolean;
  matchFactors?: SupplierMatchFactor[];
  riskGrade: string;
  riskScore: number;
  description: string;
  categories: string[];
}

const AiMatchedSuppliers = () => {
  const { toast } = useToast();
  const [explanationOpen, setExplanationOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [explanation, setExplanation] = useState<any | null>(null);

  // Fetch AI-matched suppliers
  const { data: suppliersData, isLoading } = useQuery({
    queryKey: ['/api/suppliers/matched'],
    refetchOnWindowFocus: false,
  });

  const handleSendRfq = async (supplierId: number) => {
    try {
      await apiRequest('POST', `/api/rfqs/invite/${supplierId}`, {});
      toast({
        title: 'Success',
        description: 'RFQ sent to supplier successfully',
      });
    } catch (error) {
      console.error('Error sending RFQ:', error);
      toast({
        title: 'Error',
        description: 'Failed to send RFQ. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleMessage = async (supplierId: number) => {
    try {
      // This would typically open a chat or messaging interface
      toast({
        title: 'Opening chat',
        description: 'Message functionality is being implemented',
      });
    } catch (error) {
      console.error('Error opening message interface:', error);
      toast({
        title: 'Error',
        description: 'Failed to open chat. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleShowExplanation = async (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setExplanationOpen(true);
    setExplanationLoading(true);

    try {
      // In a real app, we'd pass the most recent RFQ ID
      const rfqId = 1; // placeholder
      const explanation = await getSupplierMatchExplanation(rfqId, supplier.id);
      setExplanation(explanation);
    } catch (error) {
      console.error('Error fetching explanation:', error);
      toast({
        title: 'Error',
        description: 'Failed to load SHAP/LIME explanation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setExplanationLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-6">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">AI-Matched Suppliers</h2>
            <p className="text-sm text-gray-500">Top matches for your recent RFQs with SHAP/LIME explainability</p>
          </div>
          <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">
            View All
          </button>
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-40"></div>
                    <div className="h-3 bg-gray-200 rounded w-24 mt-2"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="h-5 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="mt-3">
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
              <div className="mt-3 flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const suppliers = suppliersData?.suppliers || [];

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-6">
      <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">AI-Matched Suppliers</h2>
          <p className="text-sm text-gray-500">Top matches for your recent RFQs with SHAP/LIME explainability</p>
        </div>
        <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">
          View All
        </button>
      </div>
      
      <div className="p-6">
        {suppliers.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-search text-gray-400 text-3xl mb-3"></i>
            <p className="text-gray-600">No matched suppliers yet.</p>
            <p className="text-sm text-gray-500 mt-1">Submit an RFQ to see AI-matched suppliers.</p>
          </div>
        ) : (
          suppliers.map((supplier: Supplier) => (
            <div key={supplier.id} className="mb-4 border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {supplier.logo ? (
                    <img src={supplier.logo} alt={supplier.companyName} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                      {supplier.companyName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-medium text-gray-800">{supplier.companyName}</h3>
                    <p className="text-sm text-gray-500">{supplier.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                    {supplier.matchScore}% Match
                  </span>
                  {supplier.verified && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      Verified
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mt-3">
                <div className="text-sm text-gray-600 mb-1 flex justify-between">
                  <span>Match Factors</span>
                  <button 
                    className="text-xs text-primary-600 hover:text-primary-800"
                    onClick={() => handleShowExplanation(supplier)}
                  >
                    <i className="fas fa-info-circle"></i> SHAP Details
                  </button>
                </div>
                
                {supplier.matchFactors ? supplier.matchFactors.map((factor, index) => (
                  <div key={index} className="flex space-x-2 mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${getMatchScoreColor(factor.score)} h-2 rounded-full`} 
                        style={{ width: `${factor.score}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">{factor.name} ({factor.score}%)</span>
                  </div>
                )) : (
                  // Mock match factors if not provided by API
                  [
                    { name: "Category Match", score: 90 },
                    { name: "Delivery Time", score: 85 },
                    { name: "Quality Rating", score: 95 }
                  ].map((factor, index) => (
                    <div key={index} className="flex space-x-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${getMatchScoreColor(factor.score)} h-2 rounded-full`} 
                          style={{ width: `${factor.score}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">{factor.name} ({factor.score}%)</span>
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-3 flex justify-between">
                <div className="text-sm flex items-center">
                  <span className="text-gray-500">Risk Score:</span>
                  {supplier.riskGrade && (
                    <>
                      <span className={`ml-1 font-medium ${getRiskGradeDisplay(supplier.riskGrade).colorClass}`}>
                        {getRiskGradeDisplay(supplier.riskGrade).text}
                      </span>
                      <i className={`fas fa-shield-alt ml-1 ${getRiskGradeDisplay(supplier.riskGrade).colorClass}`}></i>
                    </>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMessage(supplier.id)}
                  >
                    <i className="fas fa-comment mr-1"></i> Message
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSendRfq(supplier.id)}
                  >
                    <i className="fas fa-paper-plane mr-1"></i> Send RFQ
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={explanationOpen} onOpenChange={setExplanationOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Match Explanation</DialogTitle>
            <DialogDescription>
              {selectedSupplier && `SHAP/LIME explanation for ${selectedSupplier.companyName} match score`}
            </DialogDescription>
          </DialogHeader>
          
          {explanationLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          ) : explanation ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Overall Match Score: {selectedSupplier?.matchScore}%</h4>
                <p className="text-sm text-gray-600">{explanation.recommendation}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Contributing Factors</h4>
                <div className="space-y-3">
                  {explanation.factors.map((factor: any, index: number) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{factor.name}</span>
                        <span className="text-gray-600">Importance: {Math.round(factor.importance * 100)}%</span>
                      </div>
                      <div className="flex space-x-2 items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`${getMatchScoreColor(factor.score * 100)} h-2.5 rounded-full`} 
                            style={{ width: `${factor.score * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{Math.round(factor.score * 100)}%</span>
                      </div>
                      {factor.description && (
                        <p className="text-xs text-gray-500">{factor.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">Failed to load explanation details.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AiMatchedSuppliers;
