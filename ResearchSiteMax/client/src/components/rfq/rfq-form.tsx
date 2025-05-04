import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { VoiceInput } from "@/components/rfq/voice-input";
import { FileText, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const rfqFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  quantity: z.string().min(1, "Quantity is required"),
  unit: z.string().min(1, "Unit is required"),
  deadline: z.string().refine((val) => new Date(val) > new Date(), {
    message: "Deadline must be in the future",
  }),
});

type RfqFormValues = z.infer<typeof rfqFormSchema>;

interface RfqFormProps {
  onClose: () => void;
}

export function RfqForm({ onClose }: RfqFormProps) {
  const [isVoiceInputActive, setIsVoiceInputActive] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const defaultValues: Partial<RfqFormValues> = {
    title: "",
    category: "",
    description: "",
    quantity: "",
    unit: "piece",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  };

  const form = useForm<RfqFormValues>({
    resolver: zodResolver(rfqFormSchema),
    defaultValues,
  });

  const createRfq = useMutation({
    mutationFn: async (values: RfqFormValues) => {
      const { category: categoryId, ...rest } = values;
      const rfqData = {
        ...rest,
        categoryId: parseInt(categoryId),
        quantity: parseInt(values.quantity),
      };
      const response = await apiRequest("POST", "/api/rfqs", rfqData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "RFQ Created",
        description: "Your RFQ has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rfqs"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create RFQ",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: RfqFormValues) => {
    createRfq.mutate(values);
  };

  const handleVoiceInput = (transcript: string) => {
    // This is a simple implementation. In a production app, you would use AI to extract
    // structured data from the transcript and fill the form fields properly.
    form.setValue("description", transcript);
    setIsVoiceInputActive(false);
  };

  return (
    <div>
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
          <FileText className="h-6 w-6 text-primary-600" />
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Create New RFQ
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Fill in the details below to create a new Request for Quotation.
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RFQ Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Industrial Automation Parts"
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
                    {categories.map((category: any) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detailed description of your requirements..."
                    {...field}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 100"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="piece">Piece</SelectItem>
                      <SelectItem value="kg">Kilogram</SelectItem>
                      <SelectItem value="liter">Liter</SelectItem>
                      <SelectItem value="meter">Meter</SelectItem>
                      <SelectItem value="set">Set</SelectItem>
                      <SelectItem value="unit">Unit</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Submission Deadline</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel className="block text-sm font-medium text-gray-700">
              Or use voice to create RFQ
            </FormLabel>
            <Button
              type="button"
              variant="outline"
              className="mt-1 inline-flex items-center"
              onClick={() => setIsVoiceInputActive(true)}
            >
              <Mic className="h-5 w-5 mr-2 text-gray-400" />
              Record Voice
            </Button>
          </div>

          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <Button
              type="submit"
              className="w-full sm:col-start-2"
              disabled={createRfq.isPending}
            >
              {createRfq.isPending ? "Creating..." : "Create RFQ"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full sm:mt-0 sm:col-start-1"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>

      {isVoiceInputActive && (
        <VoiceInput
          onTranscriptReceived={handleVoiceInput}
          onCancel={() => setIsVoiceInputActive(false)}
        />
      )}
    </div>
  );
}
