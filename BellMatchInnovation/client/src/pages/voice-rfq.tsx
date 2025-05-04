import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import MainLayout from '@/components/layout/main-layout';
import { useVoiceRecognition } from '@/hooks/use-voice-recognition';
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
import { PRODUCT_CATEGORIES, IMPLEMENTATION_STATUS, SUPPORTED_LANGUAGES } from '@/lib/constants';

// Form schema for RFQ validation
const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  quantity: z.number().optional(),
  budget: z.number().optional(),
  deadline: z.string().optional(),
  type: z.string().default("voice"),
  mediaUrl: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const VoiceRFQ = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [language, setLanguage] = useState<string>("en");

  // Use voice recognition hook
  const { 
    isRecording, 
    startRecording, 
    stopRecording, 
    audioData, 
    transcription, 
    extractedRfq,
    isProcessing, 
    error 
  } = useVoiceRecognition();

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
      type: "voice",
      mediaUrl: "",
    },
  });

  // Update form with extracted RFQ data
  useEffect(() => {
    if (extractedRfq) {
      form.setValue("title", extractedRfq.title);
      form.setValue("description", extractedRfq.description);
      if (extractedRfq.category) {
        form.setValue("category", extractedRfq.category);
      }
      if (extractedRfq.quantity) {
        form.setValue("quantity", extractedRfq.quantity);
      }
      if (extractedRfq.budget) {
        form.setValue("budget", extractedRfq.budget);
      }
      if (extractedRfq.deadline) {
        form.setValue("deadline", extractedRfq.deadline);
      }
    } else if (transcription) {
      // If we have transcription but no extracted data, use it as description
      form.setValue("description", transcription);
      
      // Try to extract a title from the first sentence or first 50 characters
      const title = transcription.split('.')[0].trim();
      form.setValue("title", title.length > 50 ? title.substring(0, 47) + '...' : title);
    }
    
    // Set media URL if audio data is available
    if (audioData) {
      form.setValue("mediaUrl", audioData);
      form.setValue("type", "voice");
    }
  }, [extractedRfq, transcription, audioData, form]);
  
  // Submit RFQ mutation
  const submitRfqMutation = useMutation({
    mutationFn: (data: FormData) => apiRequest('POST', '/api/rfqs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rfqs'] });
      toast({
        title: "RFQ Created",
        description: "Your voice RFQ has been successfully created.",
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
            <h1 className="text-2xl font-bold text-gray-800">Voice-Based RFQ</h1>
            <p className="text-gray-500">Create a new Request for Quote using voice input</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Voice Recording and Transcription */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Voice Input</CardTitle>
                <CardDescription>
                  Record your requirements in multiple languages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">Language Support</p>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-warning-500 h-2 rounded-full"
                          style={{ width: `${IMPLEMENTATION_STATUS.VOICE_RFQ_HINDI}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{IMPLEMENTATION_STATUS.VOICE_RFQ_HINDI}%</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium">Select Language</p>
                      <Select 
                        value={language} 
                        onValueChange={(value) => setLanguage(value)}
                        disabled={isRecording || isProcessing}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORTED_LANGUAGES.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              <div className="flex items-center">
                                <span>{lang.name}</span>
                                {lang.implementation < 100 && (
                                  <span className="ml-2 text-xs text-amber-500">
                                    ({lang.implementation}%)
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div 
                      className={`border border-gray-200 rounded-lg ${isRecording ? 'bg-red-50 border-red-200' : 'bg-white'} p-6 cursor-pointer flex flex-col items-center justify-center h-40`}
                      onClick={() => !isRecording && !isProcessing && !audioData ? startRecording() : null}
                    >
                      {isRecording ? (
                        <div className="text-center">
                          <div className="recording-wave">
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                          <p className="text-sm text-red-600 font-medium">Recording in progress...</p>
                        </div>
                      ) : isProcessing ? (
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
                          <p className="text-sm text-gray-600">Processing your audio...</p>
                        </div>
                      ) : audioData ? (
                        <div className="text-center">
                          <div className="mb-2 text-success-500">
                            <i className="fas fa-check-circle text-2xl"></i>
                          </div>
                          <p className="text-sm text-gray-600">Audio recorded successfully!</p>
                          <button 
                            className="mt-2 text-xs text-primary-600 hover:text-primary-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Reset recorded data and start again
                              form.reset();
                              startRecording();
                            }}
                          >
                            Record again
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="mb-2 text-primary-500">
                            <i className="fas fa-microphone text-2xl"></i>
                          </div>
                          <p className="text-sm text-gray-600">Tap to start recording</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Speak clearly in {SUPPORTED_LANGUAGES.find(lang => lang.code === language)?.name || 'English'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={stopRecording}
                        disabled={!isRecording}
                      >
                        <i className="fas fa-stop mr-2"></i>
                        Stop Recording
                      </Button>
                    </div>

                    {error && (
                      <div className="text-xs text-danger-600 mt-2">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {error}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-100 pt-4">
                <div className="text-sm text-gray-500 flex items-center">
                  <i className="fas fa-info-circle mr-1 text-primary-500"></i>
                  <span>Speak clearly for better transcription results</span>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* RFQ Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Request for Quote</span>
                  {!isEditing && transcription && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <i className="fas fa-edit mr-2"></i>
                      Edit Details
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  {transcription ? 'Verify and edit the extracted RFQ details' : 'Complete your RFQ details after recording'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                    <p className="text-gray-600">Processing your voice input...</p>
                    <p className="text-sm text-gray-500 mt-2">Extracting RFQ details with AI</p>
                  </div>
                ) : transcription ? (
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
                                disabled={!isEditing && !!transcription}
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
                                placeholder="Describe your requirements in detail"
                                className="min-h-32"
                                {...field}
                                disabled={!isEditing && !!transcription}
                              />
                            </FormControl>
                            <FormDescription>
                              {transcription && !isEditing && (
                                <span className="text-xs text-gray-500">
                                  This was automatically transcribed from your voice input
                                </span>
                              )}
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
                                disabled={!isEditing && !!transcription}
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
                                  disabled={!isEditing && !!transcription}
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
                                  disabled={!isEditing && !!transcription}
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
                                  disabled={!isEditing && !!transcription}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="pt-4">
                        {isEditing ? (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              type="button"
                              onClick={() => setIsEditing(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={submitRfqMutation.isPending}
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
                        ) : (
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={submitRfqMutation.isPending}
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
                        )}
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <i className="fas fa-microphone-alt text-4xl mb-4"></i>
                    <p className="text-gray-600">Record your voice to generate an RFQ</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Your RFQ details will appear here after processing
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Using Voice RFQ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-3">
                  <i className="fas fa-microphone"></i>
                </div>
                <h3 className="font-medium mb-1">Record Your Requirements</h3>
                <p className="text-sm text-gray-500">Speak clearly about what you need, including product specifications, quantity, and timeline</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-3">
                  <i className="fas fa-magic"></i>
                </div>
                <h3 className="font-medium mb-1">AI Extracts RFQ Details</h3>
                <p className="text-sm text-gray-500">Our AI technology automatically processes your voice input and extracts key RFQ information</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-3">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h3 className="font-medium mb-1">Review and Submit</h3>
                <p className="text-sm text-gray-500">Verify the extracted information, make any necessary edits, and submit your RFQ</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default VoiceRFQ;
