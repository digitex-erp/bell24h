import { useState, useEffect, useCallback } from "react";
import { VoiceRecognitionResult } from "@/types";

// SpeechRecognition browser compatibility
const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

// Check if speech recognition is available in this browser
const isSpeechRecognitionAvailable = !!SpeechRecognition;

export function useVoiceRecognition() {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [recognition, setRecognition] = useState<any>(null);
  
  // Initialize speech recognition
  useEffect(() => {
    if (!isSpeechRecognitionAvailable) {
      setError("Speech recognition is not supported in your browser. Please try Chrome or Edge.");
      return;
    }
    
    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = "en-US"; // Default to English, can be expanded to include Hindi
    
    recognitionInstance.onresult = (event: any) => {
      // Get the transcript from the latest result
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join(" ");
      
      setText(transcript);
    };
    
    recognitionInstance.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
    };
    
    recognitionInstance.onend = () => {
      setIsRecording(false);
    };
    
    setRecognition(recognitionInstance);
    
    return () => {
      if (recognitionInstance) {
        recognitionInstance.abort();
      }
    };
  }, []);
  
  // Start recording
  const startRecording = useCallback(() => {
    if (!recognition) {
      setError("Speech recognition is not available");
      return false;
    }
    
    setError(undefined);
    setText("");
    
    try {
      recognition.start();
      setIsRecording(true);
      return true;
    } catch (err) {
      console.error("Failed to start recording:", err);
      setError("Failed to start recording. Please try again.");
      return false;
    }
  }, [recognition]);
  
  // Stop recording
  const stopRecording = useCallback(() => {
    if (!recognition) {
      return false;
    }
    
    try {
      recognition.stop();
      setIsRecording(false);
      return true;
    } catch (err) {
      console.error("Failed to stop recording:", err);
      setError("Failed to stop recording. Please refresh the page.");
      return false;
    }
  }, [recognition]);
  
  return {
    text,
    isRecording,
    startRecording,
    stopRecording,
    error,
    isSupported: isSpeechRecognitionAvailable
  };
}
