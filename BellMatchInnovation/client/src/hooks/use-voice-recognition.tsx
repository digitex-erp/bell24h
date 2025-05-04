import { useState, useEffect, useCallback } from 'react';
import { transcribeAudio, extractRfqFromText, audioToBase64 } from '@/lib/openai';
import { VOICE_RECORDING } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

// Helper function to validate audio format
function isValidAudioFormat(mimeType: string): boolean {
  return VOICE_RECORDING.SUPPORTED_MIME_TYPES.includes(mimeType);
}

// Helper function to check file size
function isValidFileSize(size: number): boolean {
  const maxSizeBytes = VOICE_RECORDING.MAX_FILE_SIZE_MB * 1024 * 1024;
  return size <= maxSizeBytes;
}

export function useVoiceRecognition() {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioData, setAudioData] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [extractedRfq, setExtractedRfq] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const { toast } = useToast();

  // Start recording audio
  const startRecording = useCallback(async () => {
    setError(null);
    setAudioData(null);
    setTranscription(null);
    setExtractedRfq(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: VOICE_RECORDING.MIME_TYPE
      });
      
      const audioChunks: BlobPart[] = [];
      
      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      });
      
      recorder.addEventListener('stop', async () => {
        const audioBlob = new Blob(audioChunks, { type: VOICE_RECORDING.MIME_TYPE });
        
        // Validate audio format and size
        if (!isValidAudioFormat(audioBlob.type)) {
          setIsProcessing(false);
          setError(`Unsupported audio format: ${audioBlob.type}. Please use one of: ${VOICE_RECORDING.SUPPORTED_MIME_TYPES.join(', ')}`);
          toast({
            title: "Unsupported Format",
            description: `The audio format ${audioBlob.type} is not supported. Please use a supported format.`,
            variant: "destructive",
          });
          return;
        }
        
        if (!isValidFileSize(audioBlob.size)) {
          setIsProcessing(false);
          setError(`Audio file too large (${(audioBlob.size / (1024 * 1024)).toFixed(2)} MB). Maximum allowed size is ${VOICE_RECORDING.MAX_FILE_SIZE_MB} MB.`);
          toast({
            title: "File Too Large",
            description: `The audio recording exceeds the ${VOICE_RECORDING.MAX_FILE_SIZE_MB} MB limit. Please record a shorter message.`,
            variant: "destructive",
          });
          return;
        }
        
        // Audio passed validation, start processing
        setIsProcessing(true);
        try {
          // Convert to base64
          const base64Audio = await audioToBase64(audioBlob);
          setAudioData(base64Audio);
          
          // Transcribe the audio
          const result = await transcribeAudio(base64Audio, language || undefined);
          
          if (!result.success || !result.text) {
            throw new Error(result.error || "Failed to transcribe audio. The service returned an empty result.");
          }
          
          setTranscription(result.text);
          
          // Detect language if not provided
          if (!language && result.language) {
            setLanguage(result.language || 'en');
          }
          
          // Extract RFQ data
          try {
            const rfqData = await extractRfqFromText(result.text, result.language);
            setExtractedRfq(rfqData);
          } catch (extractError: any) {
            console.error('Error extracting RFQ data:', extractError);
            toast({
              title: "Partial Processing",
              description: "Audio was transcribed but we couldn't extract structured data from it. You can edit the details manually."
            });
            // We don't set an error here as having the transcription is still useful
          }
        } catch (processError: any) {
          setError(processError.message || 'Error processing audio');
          toast({
            title: "Processing Error",
            description: processError.message || "Failed to process audio. Please try again.",
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
      }, VOICE_RECORDING.MAX_DURATION_SECONDS * 1000);
      
    } catch (err: any) {
      setError(err.message || 'Error accessing microphone');
      toast({
        title: "Error",
        description: "Could not access your microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [language, toast]);
  
  // Stop recording audio
  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      
      // Stop all tracks in the stream
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      
      setIsRecording(false);
    }
  }, [mediaRecorder]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaRecorder]);
  
  return {
    isRecording,
    startRecording,
    stopRecording,
    audioData,
    transcription,
    extractedRfq,
    isProcessing,
    error,
    language,
    setLanguage
  };
}
