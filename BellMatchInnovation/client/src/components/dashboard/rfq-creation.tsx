import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { useVoiceRecognition } from '@/hooks/use-voice-recognition';
import { useVideoProcessing } from '@/hooks/use-video-processing';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PRODUCT_CATEGORIES, IMPLEMENTATION_STATUS } from '@/lib/constants';

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  type: z.enum(["text", "voice", "video"]),
  mediaUrl: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const RfqCreation = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"voice" | "video" | "text">("voice");
  
  // Voice recording
  const { 
    isRecording: isVoiceRecording, 
    startRecording: startVoiceRecording, 
    stopRecording: stopVoiceRecording,
    audioData,
    transcription,
    isProcessing: isVoiceProcessing,
    error: voiceError 
  } = useVoiceRecognition();
  
  // Video recording
  const { 
    isRecording: isVideoRecording, 
    startRecording: startVideoRecording, 
    stopRecording: stopVideoRecording,
    videoData,
    processedVideoUrl,
    isProcessing: isVideoProcessing,
    error: videoError 
  } = useVideoProcessing();

  // Form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      type: "text",
      mediaUrl: "",
    },
  });

  // Update form when transcription is available
  React.useEffect(() => {
    if (transcription) {
      const parsed = parseVoiceInput(transcription);
      if (parsed) {
        form.setValue("title", parsed.title);
        form.setValue("description", parsed.description);
        form.setValue("category", parsed.category || "");
        form.setValue("type", "voice");
        form.setValue("mediaUrl", audioData || "");
      }
    }
  }, [transcription, audioData, form]);

  // Update form when video is processed
  React.useEffect(() => {
    if (processedVideoUrl) {
      form.setValue("type", "video");
      form.setValue("mediaUrl", processedVideoUrl);
    }
  }, [processedVideoUrl, form]);

  const parseVoiceInput = (text: string) => {
    // Simple parsing logic - in production this would be more sophisticated with AI
    const lines = text.split(/\.\s+|\n+/);
    const title = lines[0]?.trim() || "";
    const description = lines.slice(1).join(". ").trim();
    
    // Try to detect category from the text
    const detectedCategory = PRODUCT_CATEGORIES.find(cat => 
      title.toLowerCase().includes(cat.toLowerCase()) || 
      description.toLowerCase().includes(cat.toLowerCase())
    );
    
    return {
      title,
      description,
      category: detectedCategory || "",
    };
  };

  const onSubmit = async (data: FormData) => {
    try {
      await apiRequest('POST', '/api/rfqs', data);
      
      // Reset form and state
      form.reset();
      if (activeTab === "voice") {
        stopVoiceRecording();
      } else if (activeTab === "video") {
        stopVideoRecording();
      }
      
      // Show success message
      toast({
        title: "RFQ Created",
        description: "Your request for quote has been submitted successfully.",
      });
      
      // Invalidate queries to refresh RFQ list
      queryClient.invalidateQueries({ queryKey: ['/api/rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
    } catch (error) {
      console.error("Error submitting RFQ:", error);
      toast({
        title: "Error",
        description: "Failed to create RFQ. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mb-8 bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-800">Create RFQ</h2>
        <p className="text-sm text-gray-500">Submit a new Request for Quote using voice, video, or text.</p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Voice RFQ */}
          <div className={`bg-gray-50 rounded-lg border border-gray-200 p-4 ${activeTab === 'voice' ? 'ring-2 ring-primary-200' : ''}`}>
            <div className="flex items-center mb-4" onClick={() => setActiveTab('voice')} role="button">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                <i className="fas fa-microphone text-primary-600"></i>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Voice RFQ</h3>
                <p className="text-xs text-gray-500">Record your requirements</p>
              </div>
            </div>
            
            <div 
              className="border border-gray-200 rounded-lg p-3 bg-white mb-3 flex flex-col items-center justify-center cursor-pointer"
              onClick={() => !isVoiceRecording && !isVoiceProcessing && startVoiceRecording()}
            >
              {isVoiceRecording ? (
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
              ) : isVoiceProcessing ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mb-2"></div>
                  <p className="text-xs text-gray-500">Processing audio...</p>
                </div>
              ) : transcription ? (
                <div className="text-center">
                  <i className="fas fa-check-circle text-success-500 text-xl mb-2"></i>
                  <p className="text-xs text-gray-700">Transcription complete</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{transcription}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center">Tap to record your RFQ in Hindi or English</p>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => stopVoiceRecording()}
                disabled={!isVoiceRecording}
              >
                <i className="fas fa-microphone-slash mr-2"></i>
                Stop
              </Button>
              <Button
                size="sm"
                className="flex-1"
                disabled={!transcription || isVoiceProcessing}
                onClick={() => form.handleSubmit(onSubmit)()}
              >
                <i className="fas fa-check mr-2"></i>
                Use
              </Button>
            </div>
            
            <div className="mt-3 text-xs text-gray-500 flex items-center">
              <i className="fas fa-info-circle mr-1 text-primary-500"></i>
              <span>Hindi language support ({IMPLEMENTATION_STATUS.VOICE_RFQ_HINDI}% complete)</span>
            </div>
          </div>
          
          {/* Video RFQ */}
          <div className={`bg-gray-50 rounded-lg border border-gray-200 p-4 ${activeTab === 'video' ? 'ring-2 ring-primary-200' : ''}`}>
            <div className="flex items-center mb-4" onClick={() => setActiveTab('video')} role="button">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                <i className="fas fa-video text-primary-600"></i>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Video RFQ</h3>
                <p className="text-xs text-gray-500">Show and explain your needs</p>
              </div>
            </div>
            
            <div 
              className="border border-gray-200 rounded-lg p-3 bg-white mb-3 relative min-h-[120px]"
              onClick={() => !isVideoRecording && !isVideoProcessing && !processedVideoUrl && startVideoRecording()}
            >
              {processedVideoUrl ? (
                <div className="w-full h-full">
                  <video src={processedVideoUrl} className="w-full h-full object-cover rounded" controls />
                </div>
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button 
                      className={`w-12 h-12 rounded-full ${isVideoRecording ? 'bg-danger-600' : 'bg-primary-600'} flex items-center justify-center text-white hover:${isVideoRecording ? 'bg-danger-700' : 'bg-primary-700'} focus:outline-none`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isVideoRecording) {
                          stopVideoRecording();
                        } else if (!isVideoProcessing) {
                          startVideoRecording();
                        }
                      }}
                    >
                      <i className={`fas ${isVideoRecording ? 'fa-stop' : isVideoProcessing ? 'fa-spinner fa-spin' : 'fa-video'}`}></i>
                    </button>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-gray-800 bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    <i className="fas fa-user-secret mr-1"></i>
                    <span>ID Protection On</span>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  stopVideoRecording();
                  // In a real app, we'd clear the processed video URL
                }}
                disabled={isVideoProcessing || (!isVideoRecording && !processedVideoUrl)}
              >
                <i className="fas fa-redo mr-2"></i>
                Retry
              </Button>
              <Button
                size="sm"
                className="flex-1"
                disabled={!processedVideoUrl || isVideoProcessing}
                onClick={() => form.handleSubmit(onSubmit)()}
              >
                <i className="fas fa-paper-plane mr-2"></i>
                Send
              </Button>
            </div>
            
            <div className="mt-3 text-xs text-gray-500 flex items-center">
              <i className="fas fa-info-circle mr-1 text-primary-500"></i>
              <span>Video processing ({IMPLEMENTATION_STATUS.VIDEO_RFQ_PROCESSING}% complete)</span>
            </div>
          </div>
          
          {/* Text RFQ */}
          <div className={`bg-gray-50 rounded-lg border border-gray-200 p-4 ${activeTab === 'text' ? 'ring-2 ring-primary-200' : ''}`}>
            <div className="flex items-center mb-4" onClick={() => setActiveTab('text')} role="button">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                <i className="fas fa-keyboard text-primary-600"></i>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Text RFQ</h3>
                <p className="text-xs text-gray-500">Type your requirements</p>
              </div>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what you're looking for..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between mb-1">
                        <FormLabel className="text-sm font-medium text-gray-700">Category</FormLabel>
                        <span className="text-xs text-primary-600">AI suggested</span>
                      </div>
                      <Select onValueChange={field.onChange} value={field.value}>
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
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full">
                  <i className="fas fa-paper-plane mr-2"></i>
                  Submit RFQ
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RfqCreation;
