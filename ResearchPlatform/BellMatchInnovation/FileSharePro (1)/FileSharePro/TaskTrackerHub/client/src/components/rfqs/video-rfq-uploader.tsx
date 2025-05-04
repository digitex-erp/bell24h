
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRfq } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Video } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const videoRfqSchema = z.object({
  product: z.string().min(1, "Product name is required"),
  quantity: z.string().min(1, "Quantity is required"),
  description: z.string().optional(),
  budget: z.string().min(1, "Budget is required"),
  dueDate: z.string().min(1, "Due date is required"),
  videoFile: z.any().optional(),
});

type VideoRfqFormValues = z.infer<typeof videoRfqSchema>;

interface VideoRfqUploaderProps {
  onSuccess?: () => void;
}

export default function VideoRfqUploader({ onSuccess }: VideoRfqUploaderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<VideoRfqFormValues>({
    resolver: zodResolver(videoRfqSchema),
  });

  const [successPrediction, setSuccessPrediction] = useState<{
    successRate: number;
    confidence: number;
    factors: string[];
    recommendations: string[];
  } | null>(null);

  const createRfqMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // First get success prediction
      const predictionResponse = await fetch('/api/bid-prediction/analyze', {
        method: 'POST',
        body: data
      });
      const prediction = await predictionResponse.json();
      setSuccessPrediction(prediction);

      // Then create the RFQ with video
      const response = await createRfq(data, {
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / (progressEvent.total || 0)) * 100;
          setUploadProgress(Math.round(progress));
        },
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Video RFQ Created",
        description: "Your video RFQ has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/rfqs'] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error("Error creating RFQ:", error);
      toast({
        title: "Error",
        description: "Failed to create video RFQ. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  });

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Video size must be less than 100MB",
          variant: "destructive",
        });
        return;
      }
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const onSubmit = async (data: VideoRfqFormValues) => {
    setIsSubmitting(true);
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    if (videoFile) {
      formData.append('video', videoFile);
    }

    createRfqMutation.mutate(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="product"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input placeholder="Enter quantity" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget (₹)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter budget" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter RFQ description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <Label htmlFor="video">Video Upload</Label>
          <Input
            id="video"
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="mt-2"
          />
          {videoPreview && (
            <video
              src={videoPreview}
              controls
              className="mt-4 max-w-full h-auto rounded-lg"
            />
          )}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-gray-500">Uploading: {uploadProgress}%</p>
            </div>
          )}
          
          {successPrediction && (
            <div className="mt-4 p-4 border rounded-lg bg-background">
              <h3 className="font-semibold">RFQ Success Prediction</h3>
              <div className="mt-2">
                <Progress value={successPrediction.successRate * 100} 
                  className="bg-secondary" />
                <p className="text-sm mt-1">
                  Success Rate: {Math.round(successPrediction.successRate * 100)}%
                  <span className="text-muted-foreground ml-2">
                    (Confidence: {Math.round(successPrediction.confidence * 100)}%)
                  </span>
                </p>
              </div>
              {successPrediction.factors.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Key Factors:</p>
                  <ul className="text-sm list-disc list-inside">
                    {successPrediction.factors.map((factor, i) => (
                      <li key={i}>{factor}</li>
                    ))}
                  </ul>
                </div>
              )}
              {successPrediction.recommendations.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Recommendations:</p>
                  <ul className="text-sm list-disc list-inside">
                    {successPrediction.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Video RFQ
        </Button>
      </form>
    </Form>
  );
}
