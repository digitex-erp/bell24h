import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertRfqSchema } from "@shared/schema";
import { useLocation } from "wouter";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Upload } from "lucide-react";

// Add frontend validation rules to the schema
const rfqFormSchema = insertRfqSchema
  .extend({
    deadline: z.date({
      required_error: "A deadline date is required",
    }),
    file: z.instanceof(FileList).optional(),
  })
  .refine((data) => {
    // Ensure deadline is at least tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return data.deadline >= tomorrow;
  }, {
    message: "Deadline must be at least tomorrow",
    path: ["deadline"],
  });

type RfqFormValues = z.infer<typeof rfqFormSchema>;

const categories = [
  "Apparel & Textiles",
  "Electronics",
  "Machinery",
  "Chemicals",
  "Food & Beverages",
  "Construction Materials",
  "Packaging & Printing",
  "Other",
];

export default function RfqForm() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const form = useForm<RfqFormValues>({
    resolver: zodResolver(rfqFormSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
      quantity: 0,
      budget: "0",
      location: "",
      deadline: new Date(new Date().setDate(new Date().getDate() + 7)),
      gstRequired: false,
    },
  });

  const createRfqMutation = useMutation({
    mutationFn: async (data: RfqFormValues) => {
      // Remove file from data before sending to API
      const { file, ...rfqData } = data;
      
      // Convert deadline to ISO string
      const rfqPayload = {
        ...rfqData,
        deadline: data.deadline.toISOString(),
      };
      
      const res = await apiRequest("POST", "/api/rfqs", rfqPayload);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rfqs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rfqs/user"] });
      
      toast({
        title: "RFQ Submitted",
        description: "Your RFQ has been successfully submitted. You will receive supplier responses soon.",
      });
      
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit RFQ",
        description: error.message || "There was a problem submitting your RFQ. Please try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: RfqFormValues) {
    createRfqMutation.mutate(data);
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900">Submit a Request for Quote</h2>
              <p className="mt-2 text-sm text-gray-500">Fill out the form below to get matched with suppliers</p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., 1000 Cotton T-shirts with Custom Logo" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detailed Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your requirements in detail..." 
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-3">
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 1000"
                            {...field}
                            onChange={e => field.onChange(
                              e.target.value === '' ? '' : parseInt(e.target.value, 10)
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-3">
                        <FormLabel>Budget (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="e.g., 50000"
                            {...field}
                            onChange={e => field.onChange(
                              e.target.value === '' ? '' : e.target.value
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-3">
                        <FormLabel>Delivery Location</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Mumbai, India"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-3">
                        <FormLabel>Required By</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return date < today;
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Upload Specifications</FormLabel>
                      <FormControl>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                          <div className="space-y-1 text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                              >
                                <span>Upload a file</span>
                                <input
                                  id="file-upload"
                                  name="file-upload"
                                  type="file"
                                  className="sr-only"
                                  onChange={(e) => onChange(e.target.files)}
                                  {...fieldProps}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PDF, DOC, DOCX, JPG, PNG up to 10MB
                            </p>
                            {value && value.length > 0 && (
                              <p className="text-xs text-green-500">
                                Selected: {value[0].name}
                              </p>
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gstRequired"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>GST compliance required</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createRfqMutation.isPending}
                >
                  {createRfqMutation.isPending ? "Submitting..." : "Submit RFQ"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}
