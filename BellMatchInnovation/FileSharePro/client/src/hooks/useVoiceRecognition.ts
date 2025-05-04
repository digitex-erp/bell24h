import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface VoiceRecognitionHook {
  text: string;
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  resetText: () => void;
  error: string | null;
}

/**
 * A hook for voice recognition with support for both direct browser API and
 * server-side processing (for Hindi language support)
 */
export function useVoiceRecognition(): VoiceRecognitionHook {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  // Cleanup function when component unmounts
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    // Reset any previous state
    setText("");
    setError(null);
    audioChunksRef.current = [];

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        try {
          // Create audio blob from all chunks
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Create form data for upload
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");
          
          // Call server for transcription (supports Hindi with OpenAI Whisper)
          const response = await fetch("/api/voice/transcribe", {
            method: "POST",
            body: formData,
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Transcription failed");
          }
          
          const result = await response.json();
          setText(result.text);
          
          // Show language detection notification if not English
          if (result.language && result.language !== "en") {
            toast({
              title: "Hindi Detected",
              description: "We've detected Hindi in your voice input. Translation support is enabled.",
            });
          }
        } catch (err) {
          const error = err as Error;
          console.error("Voice recognition error:", error);
          setError(error instanceof Error ? error.message : "Failed to process voice input");
          
          toast({
            title: "Voice Recognition Failed",
            description: error instanceof Error ? error.message : "Failed to process voice input",
            variant: "destructive"
          });
        } finally {
          setIsRecording(false);
          
          // Stop all audio tracks
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
        }
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
      // Show toast notification
      toast({
        title: "Recording Started",
        description: "Speak clearly. Recording will stop automatically after you finish speaking.",
      });
    } catch (error) {
      console.error("Failed to start recording:", error);
      setError(error instanceof Error ? error.message : "Failed to access microphone");
      
      toast({
        title: "Recording Error",
        description: "Could not access your microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Note: isRecording will be set to false in the onstop handler
    }
  };
  
  const resetText = () => {
    setText("");
  };
  
  return {
    text,
    isRecording,
    startRecording,
    stopRecording,
    resetText,
    error
  };
}

export default useVoiceRecognition;