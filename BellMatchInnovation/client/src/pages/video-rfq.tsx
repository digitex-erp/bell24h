import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import MainLayout from '@/components/layout/main-layout';
import { useVideoProcessing } from '@/hooks/use-video-processing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { PRODUCT_CATEGORIES, IMPLEMENTATION_STATUS, VIDEO_RECORDING } from '@/lib/constants';

// Form schema for video RFQ validation
const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  quantity: z.number().optional(),
  budget: z.number().optional(),
  deadline: z.string().optional(),
  type: z.string().default("video"),
  mediaUrl: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const VideoRFQ = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  // Use video processing hook
  const {
    isRecording,
    startRecording,
    stopRecording,
    videoData,
    processedVideoUrl,
    previewUrl,
    isProcessing,
    error
  } = useVideoProcessing();

  // Setup form with react-hook-form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      quantity: undefined,
      budget: undefined,
      deadline: "",
      type: "video",
      mediaUrl: "",
    },
  });

  // Update video preview
  useEffect(() => {
    if (videoPreviewRef.current && previewUrl) {
      videoPreviewRef.current.src = previewUrl;
    }
  }, [previewUrl]);

  // Update form when processed video URL is available
  useEffect(() => {
    if (processedVideoUrl) {
      form.setValue("mediaUrl", processedVideoUrl);
      form.setValue("type", "video");
      
      // If title and description are empty, set default values
      if (!form.getValues("title")) {
        form.setValue("title", "Video RFQ - " + new Date().toLocaleDateString());
      }
      
      if (!form.getValues("description")) {
        form.setValue("description", "This is a video-based Request for Quote. Please watch the attached video for detailed requirements.");
      }
    }
  }, [processedVideoUrl, form]);

  // Submit RFQ mutation
  const submitRfqMutation = useMutation({
    mutationFn: (data: FormData) => apiRequest('POST', '/api/rfqs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rfqs'] });
      toast({
        title: "RFQ Created",
        description: "Your video RFQ has been successfully created.",
      });
      navigate("/rfqs");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create RFQ. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: FormData) => {
    submitRfqMutation.mutate(data);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Video-Based RFQ</h1>
            <p className="text-gray-500">Create a new Request for Quote using video</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Video Recording and Preview */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Video Input</CardTitle>
                <CardDescription>
                  Record a video to show and explain your requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">Video Processing</p>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-warning-500 h-2 rounded-full"
                          style={{ width: `${IMPLEMENTATION_STATUS.VIDEO_RFQ_PROCESSING}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{IMPLEMENTATION_STATUS.VIDEO_RFQ_PROCESSING}%</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div 
                      className={`border border-gray-200 rounded-lg ${isRecording ? 'bg-red-50 border-red-200' : 'bg-white'} p-2 relative min-h-[240px]`}
                    >
                      {isRecording || previewUrl ? (
                        <>
                          <video 
                            ref={videoPreviewRef}
                            autoPlay 
                            muted={isRecording}
                            playsInline
                            controls={!isRecording}
                            className="w-full h-full object-cover rounded"
                          />
                          {isRecording && (
                            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                              <i className="fas fa-circle mr-1"></i> REC
                            </div>
                          )}
                        </>
                      ) : isProcessing ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-2"></div>
                            <p className="text-sm text-gray-600">Processing video...</p>
                            <p className="text-xs text-gray-500 mt-1">Applying identity protection</p>
                          </div>
                        </div>
                      ) : processedVideoUrl ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <i className="fas fa-check-circle text-success-500 text-4xl"></i>
                        </div>
                      ) : (
                        <div 
                          className="absolute inset-0 flex items-center justify-center cursor-pointer"
                          onClick={() => !isRecording && !isProcessing && startRecording()}
                        >
                          <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white hover:bg-primary-700 mb-2">
                              <i className="fas fa-video text-xl"></i>
                            </div>
                            <p className="text-sm">Tap to start recording</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="absolute bottom-2 right-2 bg-gray-800 bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        <i className="fas fa-user-secret mr-1"></i>
                        <span>ID Protection</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="w-1/2"
                        onClick={() => {
                          if (isRecording) {
                            stopRecording();
                          } else {
                            // Reset and start again
                            form.reset();
                            startRecording();
                          }
                        }}
                        disabled={isProcessing}
                      >
                        {isRecording ? (
                          <>
                            <i className="fas fa-stop mr-2"></i>
                            Stop
                          </>
                        ) : (
                          <>
                            <i className="fas fa-redo mr-2"></i>
                            {previewUrl ? 'Retry' : 'Start'}
                          </>
                        )}
                      </Button>
                      <Button
                        className="w-1/2"
                        disabled={!processedVideoUrl || isRecording || isProcessing || submitRfqMutation.isPending}
                        onClick={form.handleSubmit(onSubmit)}
                      >
                        {submitRfqMutation.isPending ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane mr-2"></i>
                            Submit
                          </>
                        )}
                      </Button>
                    </div>

                    {error && (
                      <div className="text-xs text-danger-600 mt-2">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {error}
                      </div>
                    )}

                    <div className="text-xs text-gray-500 flex items-center">
                      <i className="fas fa-info-circle mr-1 text-primary-500"></i>
                      <span>Maximum video length: {VIDEO_RECORDING.MAX_DURATION_SECONDS / 60} minutes</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-100 pt-4">
                <div className="text-sm text-gray-500">
                  <p className="mb-2"><i className="fas fa-shield-alt mr-1"></i> Privacy Protection</p>
                  <p className="text-xs">Your identity will be automatically masked in the video to protect your privacy when shared with suppliers.</p>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* RFQ Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Video RFQ Details</span>
                  {processedVideoUrl && !isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <i className="fas fa-edit mr-2"></i>
                      Edit Details
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  Provide additional details for your video RFQ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="RFQ Title"
                              {...field}
                              disabled={!isEditing && !!processedVideoUrl}
                            />
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
                            <Textarea
                              placeholder="Provide additional details about your requirements"
                              className="min-h-32"
                              {...field}
                              disabled={!isEditing && !!processedVideoUrl}
                            />
                          </FormControl>
                          <FormDescription>
                            The video will be the primary way to communicate your requirements
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={!isEditing && !!processedVideoUrl}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PRODUCT_CATEGORIES.map((category) => (
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
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Quantity"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                value={field.value || ''}
                                disabled={!isEditing && !!processedVideoUrl}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Budget (₹) (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Budget"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                value={field.value || ''}
                                disabled={!isEditing && !!processedVideoUrl}
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
                          <FormItem>
                            <FormLabel>Deadline (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                disabled={!isEditing && !!processedVideoUrl}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {isEditing && (
                      <div className="pt-4 flex space-x-2">
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={submitRfqMutation.isPending || !processedVideoUrl}
                        >
                          {submitRfqMutation.isPending ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-paper-plane mr-2"></i>
                              Submit RFQ
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Video RFQ Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Benefits of Video RFQs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-3">
                  <i className="fas fa-eye"></i>
                </div>
                <h3 className="font-medium mb-1">Visual Clarity</h3>
                <p className="text-sm text-gray-500">Show exactly what you need, eliminating misunderstandings that can occur with text descriptions</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-3">
                  <i className="fas fa-user-secret"></i>
                </div>
                <h3 className="font-medium mb-1">Identity Protection</h3>
                <p className="text-sm text-gray-500">Our AI automatically masks your identity while preserving the important details of your request</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-3">
                  <i className="fas fa-handshake"></i>
                </div>
                <h3 className="font-medium mb-1">Better Responses</h3>
                <p className="text-sm text-gray-500">Suppliers can understand your requirements better, leading to more accurate quotes and proposals</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-3">
                  <i className="fas fa-clock"></i>
                </div>
                <h3 className="font-medium mb-1">Time Saving</h3>
                <p className="text-sm text-gray-500">Record your requirements in minutes instead of typing lengthy descriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default VideoRFQ;
