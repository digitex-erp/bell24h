import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import VoiceRecorder from '@/components/rfq/VoiceRecorder';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';

interface RfqPreview {
  title: string;
  description: string;
  quantity: string;
  deadline: string;
  category: string;
  specifications: Record<string, any>;
  detectedLanguage?: string;
  originalTranscript?: string;
}

const VoiceRFQ: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [rfqPreview, setRfqPreview] = useState<RfqPreview | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('auto');

  // Handle recording status and timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAudioRecorded = (blob: Blob) => {
    setAudioBlob(blob);
    handleProcessAudio(blob);
  };

  const handleProcessAudio = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'voice_rfq.webm');
      formData.append('language', selectedLanguage);

      const response = await fetch('/api/voice-rfq/process', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to process voice RFQ');
      }

      const data = await response.json();
      setRfqPreview({
        title: data.title,
        description: data.description,
        quantity: data.quantity,
        deadline: new Date(data.deadline).toLocaleDateString(),
        category: data.category,
        specifications: data.specifications,
        detectedLanguage: data.detectedLanguage,
        originalTranscript: data.originalTranscript,
      });

      toast({
        title: 'Voice RFQ processed successfully!',
        description: 'You can now review and submit your RFQ.',
      });
    } catch (error) {
      console.error('Error processing voice RFQ:', error);
      toast({
        title: 'Error processing voice RFQ',
        description: 'Please try again or switch to text RFQ.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitRfq = async () => {
    // This would submit the RFQ after preview
    toast({
      title: 'RFQ submitted successfully!',
      description: 'Suppliers will be notified of your request.',
    });
    setLocation('/my-rfqs');
  };

  const handleEditRfq = () => {
    // Transfer to text RFQ with prefilled data
    setLocation('/create-rfq');
  };

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Voice RFQ Submission</h1>
          <Button variant="outline" onClick={() => setLocation('/create-rfq')}>
            <i className="fas fa-keyboard mr-2"></i>
            Switch to Text RFQ
          </Button>
        </div>

        <Card className="mt-6">
          <CardHeader className="bg-gradient-to-r from-primary-800 to-primary-900 text-white">
            <h2 className="text-xl font-semibold">Voice-Based RFQ Creation</h2>
            <p className="text-sm text-primary-100">
              Speak your RFQ requirements - our AI will convert your voice to a structured RFQ
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">
                  Speak your RFQ requirements into the microphone. Our AI will transcribe your speech and create a
                  structured RFQ document.
                </p>
                <div className="mt-4 mb-6 p-4 rounded-lg border border-gray-200 bg-white">
                  <h3 className="font-medium text-gray-900 mb-2">Select Language</h3>
                  <RadioGroup value={selectedLanguage} onValueChange={setSelectedLanguage} className="mt-2">
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="auto" id="auto" />
                        <Label htmlFor="auto">Auto Detect</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="en" id="english" />
                        <Label htmlFor="english">English</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hi" id="hindi" />
                        <Label htmlFor="hindi">Hindi</Label>
                      </div>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-gray-500 mt-2">
                    Select a language or let us automatically detect it for you.
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-check text-green-500"></i>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-700">Works with all major Indian languages and accents</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-check text-green-500"></i>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-700">
                        Automatically extracts key details like quantity, deadline, and specifications
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-check text-green-500"></i>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-700">Review and edit before submitting</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <VoiceRecorder
                    onRecordingStart={() => setIsRecording(true)}
                    onRecordingStop={() => setIsRecording(false)}
                    onAudioRecorded={handleAudioRecorded}
                  />

                  {isRecording && (
                    <div className="mt-4 text-center animate-pulse">
                      <p className="text-primary-700 font-medium">Recording... {formatTime(recordingTime)}</p>
                      <p className="text-sm text-gray-500 mt-1">Speak clearly about your requirements</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <div className="font-medium text-gray-900">Preview</div>
                  <div className="text-sm text-gray-500">
                    {isProcessing ? 'Processing...' : rfqPreview ? formatTime(recordingTime) : '00:00'}
                  </div>
                </div>

                {isProcessing ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ) : rfqPreview ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Title</div>
                      <div className="mt-1 text-gray-900">{rfqPreview.title}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Description</div>
                      <div className="mt-1 text-gray-900">{rfqPreview.description}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Quantity</div>
                      <div className="mt-1 text-gray-900">{rfqPreview.quantity}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Deadline</div>
                      <div className="mt-1 text-gray-900">{rfqPreview.deadline}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Category</div>
                      <div className="mt-1 text-gray-900">{rfqPreview.category}</div>
                    </div>
                    
                    {rfqPreview.detectedLanguage && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Detected Language</div>
                        <div className="mt-1 text-gray-900">
                          {rfqPreview.detectedLanguage === 'en' ? 'English' : 
                           rfqPreview.detectedLanguage === 'hi' ? 'Hindi' : 
                           rfqPreview.detectedLanguage}
                        </div>
                      </div>
                    )}
                    
                    {rfqPreview.originalTranscript && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Original Transcript</div>
                        <div className="mt-1 text-gray-900 text-sm italic">
                          {rfqPreview.originalTranscript}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-gray-500">
                    <p>RFQ preview will appear here after recording</p>
                  </div>
                )}

                {rfqPreview && (
                  <div className="mt-4 flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleEditRfq}>
                      Edit
                    </Button>
                    <Button size="sm" onClick={handleSubmitRfq}>
                      Submit RFQ
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceRFQ;
