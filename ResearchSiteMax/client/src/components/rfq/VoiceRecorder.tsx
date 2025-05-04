import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  onRecordingStart: () => void;
  onRecordingStop: () => void;
  onAudioRecorded: (blob: Blob) => void;
  maxDuration?: number; // Maximum recording duration in seconds
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingStart,
  onRecordingStop,
  onAudioRecorded,
  maxDuration = 120, // Default max duration: 2 minutes
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [visualizerValues, setVisualizerValues] = useState<number[]>(Array(20).fill(2));
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const visualizerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    // Cleanup function to stop recording and release resources
    return () => {
      stopRecording();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (visualizerIntervalRef.current) {
        clearInterval(visualizerIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // Request access to microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Set up audio context for visualizer
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      analyserRef.current = analyser;
      
      // Create media recorder instance
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Clear previous audio chunks
      audioChunksRef.current = [];
      
      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Handle recording stop event
      mediaRecorder.onstop = () => {
        // Create audio blob from chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Call callback with audio blob
        onAudioRecorded(audioBlob);
        
        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        
        if (visualizerIntervalRef.current) {
          clearInterval(visualizerIntervalRef.current);
          visualizerIntervalRef.current = null;
        }
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        
        // Reset state
        setIsRecording(false);
        setIsPaused(false);
        setRecordingTime(0);
        setVisualizerValues(Array(20).fill(2));
      };
      
      // Start recording
      mediaRecorder.start(1000); // Capture in 1 second chunks
      setIsRecording(true);
      onRecordingStart();
      
      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prevTime => {
          if (prevTime >= maxDuration - 1) {
            stopRecording();
            return maxDuration;
          }
          return prevTime + 1;
        });
      }, 1000);
      
      // Start visualizer
      updateVisualizer();
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Recording failed',
        description: 'Could not access microphone. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      onRecordingStop();
    }
  };

  const togglePause = () => {
    if (!mediaRecorderRef.current) return;
    
    if (isPaused) {
      // Resume recording
      mediaRecorderRef.current.resume();
      
      // Resume timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prevTime => {
          if (prevTime >= maxDuration - 1) {
            stopRecording();
            return maxDuration;
          }
          return prevTime + 1;
        });
      }, 1000);
      
      // Resume visualizer
      updateVisualizer();
      
      setIsPaused(false);
    } else {
      // Pause recording
      mediaRecorderRef.current.pause();
      
      // Pause timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      
      // Pause visualizer
      if (visualizerIntervalRef.current) {
        clearInterval(visualizerIntervalRef.current);
        visualizerIntervalRef.current = null;
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      setIsPaused(true);
    }
  };

  const updateVisualizer = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateAnalyser = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Sample the frequency data to get 20 values for the visualizer
      const sampleSize = Math.floor(dataArray.length / 20);
      const sampledData = Array(20).fill(0).map((_, i) => {
        const start = i * sampleSize;
        const end = start + sampleSize;
        let sum = 0;
        for (let j = start; j < end; j++) {
          sum += dataArray[j];
        }
        // Scale the value (0-255) to be between 2 and 50
        return 2 + (sum / sampleSize / 255) * 48;
      });
      
      setVisualizerValues(sampledData);
      
      animationFrameRef.current = requestAnimationFrame(updateAnalyser);
    };
    
    updateAnalyser();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center">
      {/* Visualizer */}
      {isRecording && (
        <div className="w-full h-16 mb-4 flex items-center justify-center">
          <div className="flex items-end h-16 w-full max-w-sm space-x-1">
            {visualizerValues.map((value, index) => (
              <div
                key={index}
                className={cn(
                  "w-full bg-primary-600 rounded-t",
                  isPaused ? "opacity-50" : "opacity-100"
                )}
                style={{ height: `${value}px`, transition: 'height 0.1s ease-in-out' }}
              ></div>
            ))}
          </div>
        </div>
      )}
      
      {/* Time display */}
      {isRecording && (
        <div className="text-sm font-medium mb-4 text-primary-800">
          {formatTime(recordingTime)} / {formatTime(maxDuration)}
        </div>
      )}
      
      {/* Controls */}
      <div className="flex space-x-4">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            className="bg-accent-500 hover:bg-accent-600 rounded-full h-14 w-14 p-0 flex items-center justify-center transition-all duration-300"
          >
            <i className="fas fa-microphone text-white text-lg"></i>
          </Button>
        ) : (
          <>
            {/* Pause/Resume button */}
            <Button
              onClick={togglePause}
              variant="outline"
              className="rounded-full h-12 w-12 p-0 flex items-center justify-center"
            >
              {isPaused ? (
                <i className="fas fa-play text-primary-800 text-lg"></i>
              ) : (
                <i className="fas fa-pause text-primary-800 text-lg"></i>
              )}
            </Button>
            
            {/* Stop button */}
            <Button
              onClick={stopRecording}
              className="bg-red-500 hover:bg-red-600 rounded-full h-14 w-14 p-0 flex items-center justify-center"
            >
              <i className="fas fa-stop text-white text-lg"></i>
            </Button>
          </>
        )}
      </div>
      
      {/* Tips */}
      {isRecording && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Speak clearly, at a natural pace</p>
          <p>Include product details, quantity, and deadline</p>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
