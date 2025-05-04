import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQuote } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// Define form schema with zod
const quoteFormSchema = z.object({
  supplierId: z.coerce.number({
    required_error: "Please select a supplier",
    invalid_type_error: "Please select a supplier",
  }),
  price: z.string().min(1, "Price is required"),
  deliveryTime: z.string().min(1, "Delivery time is required"),
  notes: z.string().optional(),
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

interface QuoteSubmissionFormProps {
  rfqId: number;
  onSuccess?: () => void;
}

export default function QuoteSubmissionForm({ rfqId, onSuccess }: QuoteSubmissionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch suppliers for dropdown
  const { data: suppliers, isLoading: isLoadingSuppliers } = useQuery({ 
    queryKey: ['/api/suppliers']
  });
  
  // Set up form with default values
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      price: "",
      deliveryTime: "",
      notes: "",
    },
  });
  
  // Create Quote mutation
  const createQuoteMutation = useMutation({
    mutationFn: createQuote,
    onSuccess: () => {
      toast({
        title: "Quote Submitted",
        description: "Your quote has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/quotes/rfq', rfqId] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error("Error submitting quote:", error);
      toast({
        title: "Error",
        description: "Failed to submit quote. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });
  
  // Form submission handler
  const onSubmit = async (data: QuoteFormValues) => {
    setIsSubmitting(true);
    createQuoteMutation.mutate({
      rfqId,
      ...data,
      status: "pending",
    });
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="supplierId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value?.toString()}
                disabled={isLoadingSuppliers}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingSuppliers ? (
                    <SelectItem value="loading" disabled>Loading suppliers...</SelectItem>
                  ) : suppliers?.length ? (
                    suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No suppliers available</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (₹)</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="e.g., 75000" 
                  type="text" 
                  inputMode="decimal"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="deliveryTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery Time</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., 2-3 weeks" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Any additional information about your quote" 
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Quote
          </Button>
        </div>
      </form>
    </Form>
  );
}
