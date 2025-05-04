import { ExternalLink, AlertTriangle, Check, Info, Search, Shield } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GSTValidationWidget, GSTValidationResult } from "@/components/gst/GSTValidationWidget";

interface SupplierProps {
  id: number;
  companyName: string;
  gstin?: string;
  gstinVerified?: boolean;
  gstinVerificationDate?: string;
  legalName?: string;
  tradeName?: string;
  taxPayerType?: string;
  businessType?: string;
  registrationDate?: string;
  complianceRating?: number;
  location: string;
  verificationScore?: number;
  riskScore?: number;
  riskGrade?: string;
}

export function SupplierVerificationCard({ supplier }: { supplier: SupplierProps }) {
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);
  const [showValidationForm, setShowValidationForm] = useState(false);
  
  // Mutation for updating supplier verification
  const updateVerificationMutation = useMutation({
    mutationFn: async (validationResult: GSTValidationResult) => {
      return apiRequest("PUT", `/api/suppliers/${supplier.id}`, {
        gstin: validationResult.gstin,
        gstinVerified: validationResult.valid,
        gstinVerificationDate: new Date().toISOString(),
        legalName: validationResult.legal_name,
        tradeName: validationResult.trade_name,
        taxPayerType: validationResult.tax_payer_type,
        businessType: validationResult.business_type,
        registrationDate: validationResult.registration_date,
      });
    },
    onSuccess: () => {
      toast({
        title: "Verification Updated",
        description: "Supplier verification status has been updated.",
      });
      setShowValidationForm(false);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update verification status. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle validation completion
  const handleValidationComplete = (result: GSTValidationResult) => {
    if (result.valid) {
      updateVerificationMutation.mutate(result);
    }
  };
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };
  
  // Calculate verification status
  const getVerificationStatus = () => {
    if (supplier.gstinVerified) {
      return {
        label: "Verified",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <Check className="h-3.5 w-3.5 text-green-600" />,
      };
    } else if (supplier.gstin) {
      return {
        label: "Pending Verification",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <AlertTriangle className="h-3.5 w-3.5 text-yellow-600" />,
      };
    } else {
      return {
        label: "Not Verified",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: <Info className="h-3.5 w-3.5 text-red-600" />,
      };
    }
  };
  
  // Calculate risk level
  const getRiskLevel = () => {
    if (!supplier.riskScore) return null;
    
    if (supplier.riskScore < 2) {
      return {
        label: "Low Risk",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <Shield className="h-3.5 w-3.5 text-green-600" />,
      };
    } else if (supplier.riskScore < 3.5) {
      return {
        label: "Medium Risk",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <Shield className="h-3.5 w-3.5 text-yellow-600" />,
      };
    } else {
      return {
        label: "High Risk",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: <Shield className="h-3.5 w-3.5 text-red-600" />,
      };
    }
  };
  
  const status = getVerificationStatus();
  const riskLevel = getRiskLevel();
  
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{supplier.companyName}</span>
          <Badge className={`${status.color} ml-2 flex items-center gap-1`} variant="outline">
            {status.icon} {status.label}
          </Badge>
        </CardTitle>
        <CardDescription>
          <div className="flex items-center gap-1">
            <span>{supplier.location}</span>
            {riskLevel && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`${riskLevel.color} ml-1 text-xs px-2 py-0.5 rounded-full flex items-center gap-1`}>
                    {riskLevel.icon} {riskLevel.label}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Risk Score: {supplier.riskScore}/5</p>
                  <p>Risk Grade: {supplier.riskGrade || "N/A"}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        {supplier.gstinVerified ? (
          <>
            <div className="text-sm mt-2 space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Legal Name:</span>
                <span className="font-medium">{supplier.legalName || "N/A"}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">GSTIN:</span>
                <span className="font-medium">{supplier.gstin}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verified On:</span>
                <span className="font-medium">{formatDate(supplier.gstinVerificationDate)}</span>
              </div>
              
              {showDetails && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Business Type:</span>
                    <span className="font-medium">{supplier.businessType || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxpayer Type:</span>
                    <span className="font-medium">{supplier.taxPayerType || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registration Date:</span>
                    <span className="font-medium">{formatDate(supplier.registrationDate)}</span>
                  </div>
                </>
              )}
            </div>
            
            <Button 
              variant="link" 
              onClick={() => setShowDetails(!showDetails)} 
              className="p-0 h-auto text-xs text-primary mt-2"
            >
              {showDetails ? "Show Less" : "Show More"}
            </Button>
          </>
        ) : (
          <div className="text-sm mt-4">
            {supplier.gstin ? (
              <div className="flex flex-col items-center">
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 mb-2">
                  Pending Verification
                </Badge>
                <p className="text-center text-muted-foreground mb-2">
                  GSTIN {supplier.gstin} is pending verification.
                </p>
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => setShowValidationForm(true)}
                >
                  <Search className="h-3.5 w-3.5 mr-1.5" />
                  Verify Now
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Badge variant="outline" className="bg-red-50 text-red-700 mb-2">
                  Not Verified
                </Badge>
                <p className="text-center text-muted-foreground mb-2">
                  This supplier has not provided their GST information.
                </p>
                <Button 
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowValidationForm(true)}
                >
                  <Search className="h-3.5 w-3.5 mr-1.5" />
                  Add GST Verification
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col items-start pt-0">
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          {supplier.gstinVerified ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-600" />
              <span>GST verification adds trust and reliability to supplier profiles.</span>
            </>
          ) : (
            <>
              <Info className="h-3.5 w-3.5 text-amber-600" />
              <span>Verified suppliers get priority in RFQ matching.</span>
            </>
          )}
        </div>
      </CardFooter>
      
      {/* GST Validation Dialog */}
      <Dialog open={showValidationForm} onOpenChange={setShowValidationForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>GST Verification for {supplier.companyName}</DialogTitle>
            <DialogDescription>
              Enter the 15-character GSTIN to verify this supplier's GST registration.
            </DialogDescription>
          </DialogHeader>
          
          <GSTValidationWidget 
            initialGstin={supplier.gstin} 
            onValidationComplete={handleValidationComplete}
            showCard={false}
          />
          
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <a 
              href="https://services.gst.gov.in/services/searchtp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-primary flex items-center hover:underline"
            >
              Check on official GST portal <ExternalLink size={12} className="ml-1" />
            </a>
            
            <Button variant="outline" size="sm" onClick={() => setShowValidationForm(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}