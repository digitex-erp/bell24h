import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRfq } from "@/lib/api";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { FileDropzone } from "../ui/file-dropzone"; // Added import


// Define form schema with zod
const rfqFormSchema = z.object({
  rfqNumber: z.string().min(1, "RFQ number is required"),
  product: z.string().min(1, "Product name is required"),
  quantity: z.string().min(1, "Quantity is required"),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  video: z.any().optional(), // Added video field to schema
});

type RfqFormValues = z.infer<typeof rfqFormSchema>;

interface CreateRfqFormProps {
  onSuccess?: () => void;
}

export default function CreateRfqForm({ onSuccess }: CreateRfqFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0); // Added state for upload progress


  // Generate a unique RFQ number
  const generateRfqNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `RFQ-${year}-${random}`;
  };

  // Set up form with default values
  const form = useForm<RfqFormValues>({
    resolver: zodResolver(rfqFormSchema),
    defaultValues: {
      rfqNumber: generateRfqNumber(),
      product: "",
      quantity: "",
      description: "",
    },
  });

  // Create RFQ mutation
  const createRfqMutation = useMutation({
    mutationFn: createRfq,
    onSuccess: () => {
      toast({
        title: "RFQ Created",
        description: "Your RFQ has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/rfqs'] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error("Error creating RFQ:", error);
      toast({
        title: "Error",
        description: "Failed to create RFQ. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  // Form submission handler
  const onSubmit = async (data: RfqFormValues) => {
    setIsSubmitting(true);
    //Simulate upload - Replace with actual upload logic
    if(videoFile){
      // Simulate upload progress
      for (let i = 0; i <= 100; i++) {
        await new Promise(resolve => setTimeout(resolve, 30)); // Simulate upload time
        setUploadProgress(i);
      }
      data.video = videoFile;
    }
    createRfqMutation.mutate({
      ...data,
      status: "Active",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        {/* ...existing form fields... */}

        <div className="space-y-4">
          <FileDropzone
            accept="video/*"
            maxSize={100 * 1024 * 1024} // 100MB
            onDrop={(files) => {
              if (files?.[0]) {
                setVideoFile(files[0]);
              }
            }}
          />
          {videoFile && (
            <div className="text-sm text-gray-500">
              Selected video: {videoFile.name}
            </div>
          )}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create RFQ
          </Button>
        </div>
      </form>
    </Form>
  );
}