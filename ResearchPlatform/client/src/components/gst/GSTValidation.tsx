import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Alert, 
  AlertDescription, 
  AlertTitle
} from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  AlertCircle, 
  ArrowRight, 
  CheckCircle, 
  FileTextIcon, 
  Loader2, 
  UploadCloud, 
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { validateGst, getBusinessDetails, verifyInvoice, bulkValidateGst } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

// Form schema for single GSTIN validation
const gstinSchema = z.object({
  gstin: z.string()
    .min(15, "GSTIN must be 15 characters")
    .max(15, "GSTIN must be 15 characters")
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format"),
});

// Form schema for invoice verification
const invoiceSchema = z.object({
  gstin: z.string()
    .min(15, "GSTIN must be 15 characters")
    .max(15, "GSTIN must be 15 characters")
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

// Form schema for bulk validation
const bulkGstinSchema = z.object({
  gstinList: z.string().min(1, "At least one GSTIN is required"),
});

type GstinFormValues = z.infer<typeof gstinSchema>;
type InvoiceFormValues = z.infer<typeof invoiceSchema>;
type BulkGstinFormValues = z.infer<typeof bulkGstinSchema>;

export default function GSTValidation() {
  const [businessDetails, setBusinessDetails] = useState<any | null>(null);
  const [validationResult, setValidationResult] = useState<any | null>(null);
  const [invoiceResult, setInvoiceResult] = useState<any | null>(null);
  const [bulkResults, setBulkResults] = useState<any | null>(null);
  
  const { toast } = useToast();

  // Form for single GSTIN validation
  const gstinForm = useForm<GstinFormValues>({
    resolver: zodResolver(gstinSchema),
    defaultValues: {
      gstin: "",
    },
  });

  // Form for invoice verification
  const invoiceForm = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      gstin: "",
      invoiceNumber: "",
      invoiceDate: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD
    },
  });

  // Form for bulk validation
  const bulkForm = useForm<BulkGstinFormValues>({
    resolver: zodResolver(bulkGstinSchema),
    defaultValues: {
      gstinList: "",
    },
  });

  // Mutation for GSTIN validation
  const validateMutation = useMutation({
    mutationFn: (gstin: string) => validateGst(gstin),
    onSuccess: (data) => {
      setValidationResult(data);
      if (data.valid) {
        toast({
          title: "Validation Successful",
          description: "The GSTIN is valid.",
        });
      } else {
        toast({
          title: "Validation Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Validation Error",
        description: "Failed to validate GSTIN. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for business details
  const businessDetailsMutation = useMutation({
    mutationFn: (gstin: string) => getBusinessDetails(gstin),
    onSuccess: (data) => {
      setBusinessDetails(data);
      toast({
        title: "Business Details Retrieved",
        description: `Details for ${data.businessName} have been fetched.`,
      });
    },
    onError: () => {
      setBusinessDetails(null);
      toast({
        title: "Retrieval Error",
        description: "Failed to get business details. Please verify the GSTIN.",
        variant: "destructive",
      });
    },
  });

  // Mutation for invoice verification
  const invoiceMutation = useMutation({
    mutationFn: (data: { gstin: string; invoiceNumber: string; invoiceDate: string }) => 
      verifyInvoice(data.gstin, data.invoiceNumber, data.invoiceDate),
    onSuccess: (data) => {
      setInvoiceResult(data);
      if (data.verified) {
        toast({
          title: "Invoice Verified",
          description: "The invoice has been successfully verified.",
        });
      } else {
        toast({
          title: "Invoice Verification Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Verification Error",
        description: "Failed to verify invoice. Please check your details and try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for bulk validation
  const bulkValidationMutation = useMutation({
    mutationFn: (gstinList: string[]) => bulkValidateGst(gstinList),
    onSuccess: (data) => {
      setBulkResults(data);
      toast({
        title: "Bulk Validation Complete",
        description: data.overallStatus,
      });
    },
    onError: () => {
      toast({
        title: "Bulk Validation Error",
        description: "Failed to perform bulk validation. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle single GSTIN validation
  const onValidateSubmit = (data: GstinFormValues) => {
    setValidationResult(null); // Clear previous results
    setBusinessDetails(null);
    validateMutation.mutate(data.gstin);
  };

  // Handle fetch business details
  const onFetchDetails = () => {
    const gstin = gstinForm.getValues().gstin;
    if (gstin && validationResult?.valid) {
      businessDetailsMutation.mutate(gstin);
    } else {
      toast({
        title: "Validation Required",
        description: "Please validate the GSTIN first.",
        variant: "destructive",
      });
    }
  };

  // Handle invoice verification
  const onInvoiceSubmit = (data: InvoiceFormValues) => {
    setInvoiceResult(null); // Clear previous results
    invoiceMutation.mutate(data);
  };

  // Handle bulk validation
  const onBulkSubmit = (data: BulkGstinFormValues) => {
    setBulkResults(null); // Clear previous results
    
    // Parse and clean up GSTIN list
    const gstinList = data.gstinList
      .split(/[\n,]/) // Split by newline or comma
      .map(gstin => gstin.trim())
      .filter(gstin => gstin.length === 15); // Only keep valid length GSTINs
    
    if (gstinList.length === 0) {
      toast({
        title: "Invalid Input",
        description: "No valid GSTINs found. Please enter GSTINs separated by commas or new lines.",
        variant: "destructive",
      });
      return;
    }
    
    bulkValidationMutation.mutate(gstinList);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">GST Validation System</h2>
        <p className="text-muted-foreground">Validate GST identification numbers and verify invoices</p>
      </div>

      <Tabs defaultValue="validate" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="validate">GSTIN Validation</TabsTrigger>
          <TabsTrigger value="invoice">Invoice Verification</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Validation</TabsTrigger>
        </TabsList>
        
        {/* GSTIN Validation Tab */}
        <TabsContent value="validate">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                GSTIN Validation
              </CardTitle>
              <CardDescription>
                Validate a Goods and Services Tax Identification Number
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={gstinForm.handleSubmit(onValidateSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    placeholder="27AADCB2230M1ZT"
                    {...gstinForm.register("gstin")}
                    className="uppercase"
                  />
                  {gstinForm.formState.errors.gstin && (
                    <p className="text-sm text-destructive">{gstinForm.formState.errors.gstin.message}</p>
                  )}
                </div>

                <div className="pt-2 flex gap-2">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={validateMutation.isPending}
                  >
                    {validateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      "Validate GSTIN"
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onFetchDetails}
                    disabled={!validationResult?.valid || businessDetailsMutation.isPending}
                  >
                    {businessDetailsMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      <>
                        Business Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* Validation Result */}
              {validationResult && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-medium">Validation Results</h3>
                  <Alert variant={validationResult.valid ? "default" : "destructive"}>
                    {validationResult.valid ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertTitle>
                      {validationResult.valid ? "Valid GSTIN" : "Invalid GSTIN"}
                    </AlertTitle>
                    <AlertDescription>
                      {validationResult.message}
                    </AlertDescription>
                  </Alert>

                  {validationResult.valid && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Format Valid</p>
                        <p className="font-medium">
                          {validationResult.formatValid ? "Yes" : "No"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Checksum Valid</p>
                        <p className="font-medium">
                          {validationResult.checksumValid ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Business Details */}
              {businessDetails && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-medium">Business Details</h3>
                  <div className="border rounded-md p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Business Name</p>
                        <p className="font-medium">{businessDetails.businessName}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">GSTIN</p>
                        <p className="font-medium">{businessDetails.gstin}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Registration Type</p>
                        <p className="font-medium">{businessDetails.registrationType}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-medium">
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              businessDetails.status === "Active" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {businessDetails.status}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-muted-foreground">Address</p>
                      <p className="font-medium">{businessDetails.address}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Invoice Verification Tab */}
        <TabsContent value="invoice">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileTextIcon className="h-5 w-5 mr-2" />
                Invoice Verification
              </CardTitle>
              <CardDescription>
                Verify an invoice against the GST database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={invoiceForm.handleSubmit(onInvoiceSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice-gstin">GSTIN</Label>
                  <Input
                    id="invoice-gstin"
                    placeholder="27AADCB2230M1ZT"
                    {...invoiceForm.register("gstin")}
                    className="uppercase"
                  />
                  {invoiceForm.formState.errors.gstin && (
                    <p className="text-sm text-destructive">{invoiceForm.formState.errors.gstin.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <Input
                      id="invoiceNumber"
                      placeholder="INV-001"
                      {...invoiceForm.register("invoiceNumber")}
                    />
                    {invoiceForm.formState.errors.invoiceNumber && (
                      <p className="text-sm text-destructive">{invoiceForm.formState.errors.invoiceNumber.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoiceDate">Invoice Date</Label>
                    <Input
                      id="invoiceDate"
                      type="date"
                      {...invoiceForm.register("invoiceDate")}
                    />
                    {invoiceForm.formState.errors.invoiceDate && (
                      <p className="text-sm text-destructive">{invoiceForm.formState.errors.invoiceDate.message}</p>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={invoiceMutation.isPending}
                  >
                    {invoiceMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Invoice"
                    )}
                  </Button>
                </div>
              </form>

              {/* Invoice Verification Result */}
              {invoiceResult && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-medium">Verification Results</h3>
                  <Alert variant={invoiceResult.verified ? "default" : "destructive"}>
                    {invoiceResult.verified ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertTitle>
                      {invoiceResult.verified ? "Invoice Verified" : "Verification Failed"}
                    </AlertTitle>
                    <AlertDescription>
                      {invoiceResult.message}
                    </AlertDescription>
                  </Alert>

                  {invoiceResult.verified && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">GSTIN</p>
                        <p className="font-medium">{invoiceResult.gstin}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Invoice Number</p>
                        <p className="font-medium">{invoiceResult.invoiceNumber}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Invoice Date</p>
                        <p className="font-medium">{new Date(invoiceResult.invoiceDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Bulk Validation Tab */}
        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UploadCloud className="h-5 w-5 mr-2" />
                Bulk GSTIN Validation
              </CardTitle>
              <CardDescription>
                Validate multiple GSTINs at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={bulkForm.handleSubmit(onBulkSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gstinList">Enter GSTINs (one per line or comma-separated)</Label>
                  <textarea
                    id="gstinList"
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="27AADCB2230M1ZT,
29AAFCD5862R1ZR,
06BZAHM6385P6Z2"
                    {...bulkForm.register("gstinList")}
                  ></textarea>
                  {bulkForm.formState.errors.gstinList && (
                    <p className="text-sm text-destructive">{bulkForm.formState.errors.gstinList.message}</p>
                  )}
                </div>

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={bulkValidationMutation.isPending}
                  >
                    {bulkValidationMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      "Validate All GSTINs"
                    )}
                  </Button>
                </div>
              </form>

              {/* Bulk Validation Results */}
              {bulkResults && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Validation Results</h3>
                    <span className="text-sm text-muted-foreground">{bulkResults.overallStatus}</span>
                  </div>
                  
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>GSTIN</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Message</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bulkResults.results.map((result: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono">{result.gstin}</TableCell>
                            <TableCell>
                              {result.valid ? (
                                <span className="flex items-center text-green-600">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Valid
                                </span>
                              ) : (
                                <span className="flex items-center text-red-600">
                                  <AlertCircle className="h-4 w-4 mr-1" />
                                  Invalid
                                </span>
                              )}
                            </TableCell>
                            <TableCell>{result.message}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Note: For large batches, the validation process may take some time to complete.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
