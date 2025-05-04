import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Upload, Video, CheckCircle, XCircle } from 'lucide-react';

const VideoRFQ = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [faceBlur, setFaceBlur] = useState(true);
  const [voiceMask, setVoiceMask] = useState(true);
  
  const [rfqPreview, setRfqPreview] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a video file smaller than 100MB",
          variant: "destructive"
        });
        return;
      }
      
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Invalid file type",
          description: "Please select a video file",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Create a URL for the video preview
      if (videoPreviewRef.current) {
        videoPreviewRef.current.src = URL.createObjectURL(file);
      }
    }
  };
  
  const handleBrowseClick = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };
  
  const handleUploadVideo = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a video file to upload",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Create form data
    const formData = new FormData();
    formData.append('video', selectedFile);
    formData.append('applyFaceBlur', faceBlur.toString());
    formData.append('applyVoiceMask', voiceMask.toString());
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev < 90) return prev + 10;
          return prev;
        });
      }, 500);
      
      // Upload and process the video
      const response = await fetch('/api/rfqs/video/process', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      setIsUploading(false);
      setIsProcessing(true);
      
      const result = await response.json();
      setRfqPreview(result);
      setIsProcessing(false);
      
      toast({
        title: "Video processed successfully",
        description: "Your video RFQ has been processed. Please review and submit.",
      });
    } catch (error) {
      setIsUploading(false);
      setIsProcessing(false);
      console.error('Error uploading video:', error);
      
      toast({
        title: "Upload failed",
        description: `Failed to upload and process video: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  const handleSubmitRfq = async () => {
    if (!rfqPreview) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/rfqs/video/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rfqPreview)
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      toast({
        title: "RFQ created successfully",
        description: `Your video RFQ (${result.referenceNumber}) has been created successfully.`,
      });
      
      // Redirect to RFQ details page
      setLocation(`/rfqs/${result.id}`);
    } catch (error) {
      console.error('Error creating RFQ:', error);
      
      toast({
        title: "Failed to create RFQ",
        description: `Error: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditRfq = () => {
    // Allow the user to edit the extracted RFQ data
    if (!rfqPreview) return;
    
    // We're just going to show the form below the preview
    document.getElementById('rfq-edit-form')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!rfqPreview) return;
    
    const { name, value } = e.target;
    setRfqPreview(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (videoPreviewRef.current && videoPreviewRef.current.src) {
        URL.revokeObjectURL(videoPreviewRef.current.src);
      }
    };
  }, []);
  
  return (
    <div className="py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Create Video RFQ</h1>
          <Button
            variant="outline"
            onClick={() => setLocation('/create-rfq')}
          >
            Switch to Text RFQ
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Record or Upload Video</CardTitle>
            <CardDescription>
              Create an RFQ using video. Your video will be processed to extract the relevant information.
              We offer privacy features to protect your identity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                  <input
                    type="file"
                    ref={videoInputRef}
                    onChange={handleFileSelect}
                    accept="video/*"
                    className="hidden"
                  />
                  
                  {!selectedFile ? (
                    <div className="text-center">
                      <Video className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <Button onClick={handleBrowseClick}>
                          <Upload className="mr-2 h-4 w-4" />
                          Select Video
                        </Button>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        MP4, MOV, AVI, or WMV up to 100MB
                      </p>
                    </div>
                  ) : (
                    <div className="w-full">
                      <video
                        ref={videoPreviewRef}
                        controls
                        className="w-full h-48 object-cover rounded-md"
                      />
                      <div className="mt-2 flex justify-between">
                        <p className="text-sm truncate">{selectedFile.name}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            if (videoPreviewRef.current) {
                              URL.revokeObjectURL(videoPreviewRef.current.src);
                              videoPreviewRef.current.src = '';
                            }
                          }}
                          className="text-red-500 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="face-blur">Face Blur</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically blur faces in the video
                      </p>
                    </div>
                    <Switch
                      id="face-blur"
                      checked={faceBlur}
                      onCheckedChange={setFaceBlur}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="voice-mask">Voice Masking</Label>
                      <p className="text-sm text-muted-foreground">
                        Apply voice distortion to protect identity
                      </p>
                    </div>
                    <Switch
                      id="voice-mask"
                      checked={voiceMask}
                      onCheckedChange={setVoiceMask}
                    />
                  </div>
                </div>
                
                <Button
                  onClick={handleUploadVideo}
                  className="w-full"
                  disabled={!selectedFile || isUploading || isProcessing}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading... {uploadProgress}%
                    </>
                  ) : isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Video...
                    </>
                  ) : (
                    'Upload & Process Video'
                  )}
                </Button>
              </div>
              
              <div>
                {rfqPreview ? (
                  <div className="bg-teal-50 p-4 rounded-md">
                    <h3 className="text-lg font-medium flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Video Processed Successfully
                    </h3>
                    <p className="mt-1 text-sm">
                      We've extracted the following information from your video:
                    </p>
                    
                    <div className="mt-4 space-y-3">
                      <div>
                        <span className="text-sm font-medium">Title:</span>
                        <p className="text-sm">{rfqPreview.title}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Description:</span>
                        <p className="text-sm">{rfqPreview.description}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Category:</span>
                        <p className="text-sm">{rfqPreview.category}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Quantity:</span>
                        <p className="text-sm">{rfqPreview.quantity}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Deadline:</span>
                        <p className="text-sm">{new Date(rfqPreview.deadline).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Privacy Features:</span>
                        <p className="text-sm">
                          {rfqPreview.privacyFeatures.faceBlur ? '✓ Face Blur ' : '✗ Face Blur '}
                          {rfqPreview.privacyFeatures.voiceMask ? '✓ Voice Mask' : '✗ Voice Mask'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Video Duration:</span>
                        <p className="text-sm">{Math.floor(rfqPreview.duration / 60)}:{Math.floor(rfqPreview.duration % 60).toString().padStart(2, '0')}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <Button variant="outline" size="sm" onClick={handleEditRfq}>
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleSubmitRfq}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          'Submit RFQ'
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-center">
                    <div className="text-center p-6 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <h3 className="text-lg font-medium text-gray-700">How to create a Video RFQ</h3>
                      <ul className="mt-4 text-sm text-gray-600 space-y-2 text-left">
                        <li className="flex">
                          <span className="font-medium mr-2">1.</span>
                          Select a video file from your device
                        </li>
                        <li className="flex">
                          <span className="font-medium mr-2">2.</span>
                          Choose privacy features like face blur and voice masking
                        </li>
                        <li className="flex">
                          <span className="font-medium mr-2">3.</span>
                          Upload and process your video
                        </li>
                        <li className="flex">
                          <span className="font-medium mr-2">4.</span>
                          Review the extracted RFQ information
                        </li>
                        <li className="flex">
                          <span className="font-medium mr-2">5.</span>
                          Edit if necessary and submit your RFQ
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {rfqPreview && (
          <Card id="rfq-edit-form" className="mb-6">
            <CardHeader>
              <CardTitle>Edit RFQ Details</CardTitle>
              <CardDescription>
                Review and edit the information extracted from your video
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={rfqPreview.title || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={rfqPreview.description || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        name="category"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={rfqPreview.category || ''}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Category</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Chemicals">Chemicals</option>
                        <option value="Textiles">Textiles</option>
                        <option value="Auto Parts">Auto Parts</option>
                        <option value="Pharmaceuticals">Pharmaceuticals</option>
                        <option value="Food & Beverages">Food & Beverages</option>
                        <option value="Construction">Construction</option>
                        <option value="IT Services">IT Services</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        value={rfqPreview.quantity || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      name="deadline"
                      type="date"
                      value={rfqPreview.deadline ? new Date(rfqPreview.deadline).toISOString().split('T')[0] : ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={handleSubmitRfq}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit RFQ'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VideoRFQ;