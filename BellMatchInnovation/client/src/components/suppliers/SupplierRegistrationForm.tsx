import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Check, Info, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiSelect, Option } from "@/components/ui/multi-select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Define form schema for supplier registration
const supplierFormSchema = z.object({
  companyName: z.string().min(3, "Company name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  gstin: z.string().length(15, "GSTIN must be 15 characters").optional(),
  categories: z.array(z.object({
    value: z.string(),
    label: z.string()
  })).min(1, "Please select at least one category"),
});

type SupplierFormValues = z.infer<typeof supplierFormSchema>;

// Define GST validation result type
type GSTValidationResult = {
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

export default function SupplierRegistrationForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const [validatingGST, setValidatingGST] = useState(false);
  const [gstValidationResult, setGstValidationResult] = useState<GSTValidationResult | null>(null);
  
  // Available categories for selection
  const categoryOptions: Option[] = [
    { value: "electronics", label: "Electronics" },
    { value: "textiles", label: "Textiles" },
    { value: "automotive", label: "Automotive" },
    { value: "chemicals", label: "Chemicals" },
    { value: "pharmaceuticals", label: "Pharmaceuticals" },
    { value: "food_processing", label: "Food Processing" },
    { value: "machinery", label: "Machinery" },
    { value: "software", label: "Software & IT" },
    { value: "construction", label: "Construction" },
    { value: "metals", label: "Metals & Mining" },
    { value: "agriculture", label: "Agriculture" },
    { value: "logistics", label: "Logistics & Transport" },
  ];
  
  // Initialize form
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      companyName: "",
      description: "",
      location: "",
      gstin: "",
      categories: [],
    },
  });
  
  // Form submission mutation
  const registerMutation = useMutation({
    mutationFn: async (data: SupplierFormValues) => {
      // Extract category values from options
      const categories = data.categories.map(c => c.value);
      
      // Prepare data for submission
      const supplierData = {
        ...data,
        categories,
        // If GST was validated, include validation result
        ...(gstValidationResult?.valid ? {
          gstinVerified: true,
          legalName: gstValidationResult.legal_name,
          tradeName: gstValidationResult.trade_name,
          taxPayerType: gstValidationResult.tax_payer_type,
          businessType: gstValidationResult.business_type,
          registrationDate: gstValidationResult.registration_date,
        } : {})
      };
      
      return apiRequest("POST", "/api/suppliers/register", supplierData);
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "Your supplier profile has been created successfully.",
      });
      
      // Reset form
      form.reset();
      setGstValidationResult(null);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "There was an error registering your supplier profile. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = async (values: SupplierFormValues) => {
    // If GSTIN provided but not yet validated, validate first
    if (values.gstin && !gstValidationResult?.valid) {
      await validateGST(values.gstin);
      return;
    }
    
    // Otherwise proceed with registration
    registerMutation.mutate(values);
  };
  
  // Validate GST number
  const validateGST = async (gstin: string) => {
    if (!gstin || gstin.length !== 15) {
      toast({
        title: "Invalid GSTIN",
        description: "Please provide a valid 15-character GSTIN.",
        variant: "destructive",
      });
      return;
    }
    
    setValidatingGST(true);
    
    try {
      const response = await apiRequest("POST", "/api/gst/validate", { gstin });
      const result = await response.json();
      
      setGstValidationResult(result);
      
      if (result.valid) {
        toast({
          title: "GST Validation Successful",
          description: "Your GSTIN has been successfully validated.",
        });
      } else {
        toast({
          title: "GST Validation Failed",
          description: result.message || "Unable to validate the GSTIN. Please check the number and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("GST validation error:", error);
      toast({
        title: "GST Validation Error",
        description: "An error occurred while validating your GSTIN. Please try again later.",
        variant: "destructive",
      });
      setGstValidationResult(null);
    } finally {
      setValidatingGST(false);
    }
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Supplier Registration</CardTitle>
        <CardDescription>Register as a supplier on Bell24h marketplace to receive RFQs and connect with buyers.</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="Your company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Description*</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of your company, products, and services" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location*</FormLabel>
                  <FormControl>
                    <Input placeholder="Business location (city, state)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="categories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Categories*</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={categoryOptions}
                      placeholder="Select business categories"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Select all categories that apply to your business.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="gstin"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>GST Identification Number (GSTIN)</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info size={16} className="text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Provide your 15-character GSTIN to verify your business. 
                            Verified businesses get priority in the marketplace.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <div className="flex gap-2">
                    <FormControl className="flex-1">
                      <Input 
                        placeholder="15-character GSTIN" 
                        maxLength={15}
                        {...field}
                        className="uppercase"
                      />
                    </FormControl>
                    
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => validateGST(field.value || '')}
                      disabled={validatingGST || !field.value || field.value.length !== 15 || gstValidationResult?.valid}
                    >
                      {validatingGST ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                          Validating
                        </>
                      ) : gstValidationResult?.valid ? (
                        <>
                          <Check className="mr-2 h-4 w-4" /> 
                          Verified
                        </>
                      ) : (
                        "Validate"
                      )}
                    </Button>
                  </div>
                  
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Show GST Validation Details if available */}
            {gstValidationResult?.valid && (
              <Alert>
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle className="flex items-center gap-2">
                  GST Verification Successful
                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800">
                    Verified
                  </Badge>
                </AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                    <div className="text-muted-foreground">Legal Name:</div>
                    <div className="font-medium">{gstValidationResult.legal_name}</div>
                    
                    <div className="text-muted-foreground">Trade Name:</div>
                    <div className="font-medium">{gstValidationResult.trade_name}</div>
                    
                    <div className="text-muted-foreground">Business Type:</div>
                    <div className="font-medium">{gstValidationResult.business_type}</div>
                    
                    <div className="text-muted-foreground">Taxpayer Type:</div>
                    <div className="font-medium">{gstValidationResult.tax_payer_type}</div>
                    
                    <div className="text-muted-foreground">Registration Date:</div>
                    <div className="font-medium">
                      {gstValidationResult.registration_date ? new Date(gstValidationResult.registration_date).toLocaleDateString() : "N/A"}
                    </div>
                    
                    <div className="text-muted-foreground">Status:</div>
                    <div className="font-medium">{gstValidationResult.status || "Active"}</div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full"
                disabled={registerMutation.isPending || validatingGST}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Registering...
                  </>
                ) : (
                  "Register as Supplier"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      
      <CardFooter className="flex flex-col items-start border-t pt-6">
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Benefits of GST verification:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Higher trust rating with buyers</li>
            <li>Priority in search results</li>
            <li>Lower risk score for faster payments</li>
            <li>Eligibility for early payment options</li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  );
}