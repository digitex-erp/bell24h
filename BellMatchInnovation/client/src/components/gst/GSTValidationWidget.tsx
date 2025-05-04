import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Check, Info, Loader2, X, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

// Define GST validation result type
export type GSTValidationResult = {
  valid: boolean;
  message: string;
  gstin?: string;
  legal_name?: string;
  trade_name?: string;
  address?: string;
  state_code?: string;
  state_name?: string;
  business_type?: string;
  tax_payer_type?: string;
  status?: string;
  registration_date?: string;
};

interface GSTValidationWidgetProps {
  initialGstin?: string;
  onValidationComplete?: (result: GSTValidationResult) => void;
  showCard?: boolean;
  className?: string;
}

export function GSTValidationWidget({
  initialGstin = "",
  onValidationComplete,
  showCard = true,
  className = "",
}: GSTValidationWidgetProps) {
  const { toast } = useToast();
  const [gstin, setGstin] = useState(initialGstin);
  const [validationResult, setValidationResult] = useState<GSTValidationResult | null>(null);

  // GSTIN validation mutation
  const validateMutation = useMutation({
    mutationFn: async (gstinToValidate: string) => {
      const response = await apiRequest("POST", "/api/gst/validate", { gstin: gstinToValidate });
      return response.json();
    },
    onSuccess: (data: GSTValidationResult) => {
      setValidationResult(data);
      
      if (data.valid) {
        toast({
          title: "GST Validation Successful",
          description: "GSTIN has been successfully validated.",
        });
      } else {
        toast({
          title: "GST Validation Failed",
          description: data.message || "Unable to validate the GSTIN. Please check the number and try again.",
          variant: "destructive",
        });
      }
      
      if (onValidationComplete) {
        onValidationComplete(data);
      }
    },
    onError: (error: any) => {
      console.error("GST validation error:", error);
      toast({
        title: "GST Validation Error",
        description: "An error occurred while validating the GSTIN. Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Bulk validation mutation for multiple GSTINs
  const bulkValidateMutation = useMutation({
    mutationFn: async (gstinList: string[]) => {
      const response = await apiRequest("POST", "/api/gst/bulk-validate", { gstinList });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Bulk Validation Complete",
        description: `Successfully processed ${data.results?.length || 0} GSTIN numbers.`,
      });
    },
    onError: (error: any) => {
      console.error("Bulk GST validation error:", error);
      toast({
        title: "Bulk Validation Error",
        description: "An error occurred during bulk validation. Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Handle validation request
  const handleValidate = () => {
    if (!gstin || gstin.length !== 15) {
      toast({
        title: "Invalid GSTIN",
        description: "Please enter a valid 15-character GSTIN.",
        variant: "destructive",
      });
      return;
    }
    
    validateMutation.mutate(gstin);
  };

  // Form to validate GSTINs
  const ValidationForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="gstin">GST Identification Number (GSTIN)</Label>
        <div className="flex gap-2">
          <Input
            id="gstin"
            value={gstin}
            onChange={(e) => setGstin(e.target.value.toUpperCase())}
            placeholder="15-character GSTIN"
            maxLength={15}
            className="flex-1 uppercase"
            disabled={validateMutation.isPending}
          />
          <Button
            onClick={handleValidate}
            disabled={validateMutation.isPending || !gstin || gstin.length !== 15}
          >
            {validateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating
              </>
            ) : (
              "Validate"
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Enter a 15-character GSTIN to verify a business registration.
        </p>
      </div>
    </div>
  );

  // Display validation results
  const ValidationResults = () => {
    if (!validationResult) return null;

    if (validateMutation.isPending) {
      return (
        <div className="space-y-3 mt-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      );
    }

    if (validationResult.valid) {
      return (
        <Alert className="mt-4">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="flex items-center gap-2">
            GST Verification Successful
            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800">
              Verified
            </Badge>
          </AlertTitle>
          <AlertDescription className="mt-2">
            <div className="grid grid-cols-2 gap-2 text-sm mt-2">
              <div className="text-muted-foreground">GSTIN:</div>
              <div className="font-medium">{validationResult.gstin}</div>
              
              <div className="text-muted-foreground">Legal Name:</div>
              <div className="font-medium">{validationResult.legal_name || "N/A"}</div>
              
              <div className="text-muted-foreground">Trade Name:</div>
              <div className="font-medium">{validationResult.trade_name || "N/A"}</div>
              
              <div className="text-muted-foreground">Business Type:</div>
              <div className="font-medium">{validationResult.business_type || "N/A"}</div>
              
              <div className="text-muted-foreground">Taxpayer Type:</div>
              <div className="font-medium">{validationResult.tax_payer_type || "N/A"}</div>

              <div className="text-muted-foreground">State:</div>
              <div className="font-medium">{validationResult.state_name || "N/A"}</div>
              
              <div className="text-muted-foreground">Registration Date:</div>
              <div className="font-medium">
                {validationResult.registration_date ? new Date(validationResult.registration_date).toLocaleDateString() : "N/A"}
              </div>
              
              <div className="text-muted-foreground">Status:</div>
              <div className="font-medium">{validationResult.status || "Active"}</div>
            </div>
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => setValidationResult(null)}
              >
                Validate Another GSTIN
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      );
    } else {
      return (
        <Alert className="mt-4" variant="destructive">
          <X className="h-4 w-4" />
          <AlertTitle>GST Verification Failed</AlertTitle>
          <AlertDescription>
            {validationResult.message || "Unable to validate the GSTIN. Please check the number and try again."}
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => setValidationResult(null)}
              >
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      );
    }
  };

  // Render the complete component
  if (showCard) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            GST Validation
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={16} className="text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    GST (Goods and Services Tax) validation helps verify business legitimacy 
                    and improves procurement risk assessment.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <CardDescription>
            Verify GST registration details for suppliers and businesses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {validationResult ? <ValidationResults /> : <ValidationForm />}
        </CardContent>
        <CardFooter className="flex flex-col items-start pt-0">
          <div className="text-xs text-muted-foreground mt-2">
            <a 
              href="https://services.gst.gov.in/services/searchtp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center hover:underline text-primary"
            >
              View official GST portal <ExternalLink size={12} className="ml-1" />
            </a>
          </div>
        </CardFooter>
      </Card>
    );
  }

  // Simplified version without card container
  return (
    <div className={className}>
      {validationResult ? <ValidationResults /> : <ValidationForm />}
    </div>
  );
}