import { useState, useCallback, useEffect } from 'react';
import { videoToBase64, processVideoRfq } from '@/lib/openai';
import { VIDEO_RECORDING } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

export function useVideoProcessing() {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [videoData, setVideoData] = useState<string | null>(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  // Start video recording
  const startRecording = useCallback(async () => {
    setError(null);
    setVideoData(null);
    setProcessedVideoUrl(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      
      setVideoStream(stream);
      
      // Set up preview if needed
      const videoUrl = URL.createObjectURL(new MediaStream(stream.getVideoTracks()));
      setPreviewUrl(videoUrl);
      
      const recorder = new MediaRecorder(stream, {
        mimeType: VIDEO_RECORDING.MIME_TYPE
      });
      
      const videoChunks: BlobPart[] = [];
      
      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          videoChunks.push(event.data);
        }
      });
      
      recorder.addEventListener('stop', async () => {
        const videoBlob = new Blob(videoChunks, { type: VIDEO_RECORDING.MIME_TYPE });
        
        // Check file size
        if (videoBlob.size > VIDEO_RECORDING.MAX_FILE_SIZE_MB * 1024 * 1024) {
          setError(`Video size exceeds ${VIDEO_RECORDING.MAX_FILE_SIZE_MB}MB limit`);
          toast({
            title: "Error",
            description: `Video size exceeds ${VIDEO_RECORDING.MAX_FILE_SIZE_MB}MB limit. Please record a shorter video.`,
            variant: "destructive",
          });
          return;
        }
        
        // Process the video
        setIsProcessing(true);
        try {
          const base64Video = await videoToBase64(videoBlob);
          setVideoData(base64Video);
          
          // Create a local URL for preview
          const videoObjectUrl = URL.createObjectURL(videoBlob);
          setPreviewUrl(videoObjectUrl);
          
          // Process the video for identity masking and RFQ extraction
          const processedUrl = await processVideoRfq(base64Video);
          setProcessedVideoUrl(processedUrl);
        } catch (processError: any) {
          setError(processError.message || 'Error processing video');
          toast({
            title: "Error",
            description: "Failed to process video. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      });
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      // Auto-stop after maximum duration
      setTimeout(() => {
        if (recorder.state === 'recording') {
          stopRecording();
        }
      }, VIDEO_RECORDING.MAX_DURATION_SECONDS * 1000);
      
    } catch (err: any) {
      setError(err.message || 'Error accessing camera/microphone');
      toast({
        title: "Error",
        description: "Could not access your camera or microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);
  
  // Stop video recording
  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
    
    // Clean up the video stream
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
    }
  }, [mediaRecorder, videoStream]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
      
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
      
      // Revoke object URLs to prevent memory leaks
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [mediaRecorder, videoStream, previewUrl]);
  
  return {
    isRecording,
    startRecording,
    stopRecording,
    videoData,
    processedVideoUrl,
    previewUrl,
    isProcessing,
    error
  };
}
