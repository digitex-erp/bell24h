'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, VideoOff, Upload, Play, Square, Trash2, Camera, FileVideo } from 'lucide-react';

export default function VideoRFQPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState('');
  const [rfqData, setRfqData] = useState<any>(null);
  const [error, setError] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setVideoBlob(blob);
        setVideoUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError('');
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to start recording. Please check camera and microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setUploadedFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setError('');
    } else {
      setError('Please select a valid video file (MP4, MOV, AVI)');
    }
  };

  const processVideoRFQ = async () => {
    const videoToProcess = videoBlob || uploadedFile;
    
    if (!videoToProcess) {
      setError('No video to process. Please record or upload a video first.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('video', videoToProcess, 'video-rfq.webm');
      formData.append('type', videoBlob ? 'recording' : 'upload');

      const response = await fetch('/api/video-rfq', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setTranscription(result.transcription);
        setRfqData(result.extractedInfo);
      } else {
        setError(result.error || 'Failed to process video RFQ');
      }
    } catch (error) {
      console.error('Video RFQ processing error:', error);
      
      // Provide fallback mock data for testing
      const mockTranscription = "I need 50 units of industrial machinery for our manufacturing plant in Mumbai. Budget is around 2 lakhs. Need delivery within 3 weeks.";
      const mockRfqData = {
        title: "Industrial Machinery - 50 units",
        description: mockTranscription,
        category: "Machinery & Equipment",
        subcategory: "Industrial Machinery",
        quantity: 50,
        unit: "units",
        budget: 200000,
        currency: "INR",
        location: "Mumbai",
        deliveryDeadline: "3 weeks",
        priority: "medium",
        specifications: ["Industrial grade", "Manufacturing use"],
        requirements: ["Quality certification", "Installation support"]
      };

      setTranscription(mockTranscription);
      setRfqData(mockRfqData);
      setError('Using demo data - API connection failed. This is normal for testing.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetVideo = () => {
    setVideoBlob(null);
    setUploadedFile(null);
    setVideoUrl(null);
    setTranscription('');
    setRfqData(null);
    setRecordingTime(0);
    setError('');
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900 flex items-center'>
              <Video className="w-6 h-6 mr-2" />
              Video-Based RFQ Submission
            </h2>
            <p className='text-gray-600'>
              Submit RFQs using video with privacy masking and AI analysis
            </p>
          </div>
          <div className='bg-purple-50 rounded-lg p-4'>
            <div className='text-2xl font-bold text-purple-600'>24</div>
            <div className='text-sm text-purple-700'>Video RFQs</div>
          </div>
        </div>
      </div>

      {/* Video Upload Section */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Record Video RFQ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Record Video RFQ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className='bg-gray-100 rounded-lg h-48 flex items-center justify-center relative'>
              {videoUrl ? (
                <video 
                  ref={videoRef}
                  src={videoUrl} 
                  controls 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className='text-center'>
                  <Video className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className='text-gray-500'>Click to start recording</p>
                  {recordingTime > 0 && (
                    <div className="text-2xl font-bold text-red-600 mt-2">
                      {formatTime(recordingTime)}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  disabled={!!videoUrl}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  className="flex-1 bg-gray-500 hover:bg-gray-600"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </Button>
              )}
              
              {videoUrl && (
                <Button
                  onClick={resetVideo}
                  variant="outline"
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upload Video RFQ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Upload Video RFQ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className='border-2 border-dashed border-gray-300 rounded-lg h-48 flex items-center justify-center cursor-pointer hover:border-purple-400 transition-colors'
              onClick={() => fileInputRef.current?.click()}
            >
              <div className='text-center'>
                <FileVideo className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className='text-gray-500'>Drop video file here or click to browse</p>
                <p className='text-xs text-gray-400 mt-1'>MP4, MOV, AVI up to 100MB</p>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <div className="flex gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
                variant="outline"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
              
              {uploadedFile && (
                <Button
                  onClick={resetVideo}
                  variant="outline"
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Process Video Button */}
      {(videoBlob || uploadedFile) && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">Ready to Process Video RFQ</h3>
              <Button
                onClick={processVideoRFQ}
                disabled={isUploading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing Video...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Process Video RFQ
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className={`px-4 py-3 rounded ${
              error.includes('demo data') 
                ? 'bg-yellow-100 border border-yellow-400 text-yellow-700' 
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              <div className="flex items-center">
                <span className="mr-2">
                  {error.includes('demo data') ? '⚠️' : '❌'}
                </span>
                <span>{error}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transcription Display */}
      {transcription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Play className="w-5 h-5 mr-2" />
              Video Transcription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">{transcription}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* RFQ Data Display */}
      {rfqData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileVideo className="w-5 h-5 mr-2" />
              Extracted RFQ Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 p-4 rounded-lg space-y-2">
              <div><strong>Title:</strong> {rfqData.title}</div>
              <div><strong>Category:</strong> {rfqData.category}</div>
              <div><strong>Subcategory:</strong> {rfqData.subcategory}</div>
              <div><strong>Quantity:</strong> {rfqData.quantity} {rfqData.unit}</div>
              <div><strong>Budget:</strong> ₹{rfqData.budget?.toLocaleString()}</div>
              <div><strong>Location:</strong> {rfqData.location}</div>
              <div><strong>Delivery:</strong> {rfqData.deliveryDeadline}</div>
              <div><strong>Priority:</strong> {rfqData.priority}</div>
              {rfqData.specifications && (
                <div>
                  <strong>Specifications:</strong>
                  <ul className="list-disc list-inside ml-2">
                    {rfqData.specifications.map((spec: string, index: number) => (
                      <li key={index}>{spec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Privacy & Security Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <span>🛡️</span>
            Privacy & Security Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='bg-green-50 rounded-lg p-4'>
              <span>🛡️</span>
              <h4 className='font-medium text-gray-900 mb-1'>Privacy Masking</h4>
              <p className='text-sm text-gray-600'>Automatic face and sensitive data blurring</p>
            </div>
            <div className='bg-blue-50 rounded-lg p-4'>
              <span>🎥</span>
              <h4 className='font-medium text-gray-900 mb-1'>AI Analysis</h4>
              <p className='text-sm text-gray-600'>Automatic RFQ extraction from video content</p>
            </div>
            <div className='bg-purple-50 rounded-lg p-4'>
              <span>📄</span>
              <h4 className='font-medium text-gray-900 mb-1'>Secure Storage</h4>
              <p className='text-sm text-gray-600'>Encrypted video storage with access controls</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Video RFQs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Video RFQs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {[1, 2, 3].map(i => (
              <div key={i} className='border border-gray-200 rounded-lg p-4 hover:bg-gray-50'>
                <div className='flex justify-between items-center'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-16 h-12 bg-gray-200 rounded flex items-center justify-center'>
                      <Play className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <h4 className='font-medium text-gray-900'>Manufacturing Equipment RFQ #{i}</h4>
                      <p className='text-sm text-gray-500'>Uploaded 2 hours ago • 2:34 duration</p>
                    </div>
                  </div>
                  <div className='flex space-x-2'>
                    <Button variant="outline" size="sm">View</Button>
                    <Button size="sm">Process</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
