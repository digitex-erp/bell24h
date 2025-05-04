
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { toast } from '../ui/use-toast';

interface VoiceRFQDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRFQCreated?: () => void;
}

export function VoiceRFQDialog({ open, onOpenChange, onRFQCreated }: VoiceRFQDialogProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState('');
  const [progress, setProgress] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        chunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/wav' });
        setAudioBlob(blob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setProgress(0);
      
      setTimeout(() => {
        if (mediaRecorder.current?.state === 'recording') {
          stopRecording();
        }
      }, 30000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: 'Error',
        description: 'Failed to start recording. Please check microphone permissions.',
        variant: 'destructive'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    if (!audioBlob) return;

    const formData = new FormData();
    formData.append('audio', audioBlob);

    try {
      setProgress(50);
      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to process voice input');
      
      const data = await response.json();
      setTranscription(data.transcription);
      setProgress(100);

      if (data.rfqDetails) {
        // Create RFQ with extracted details
        const rfqResponse = await fetch('/api/rfqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data.rfqDetails)
        });

        if (rfqResponse.ok) {
          toast({
            title: 'Success',
            description: 'RFQ created successfully from voice input'
          });
          onRFQCreated?.();
          onOpenChange(false);
        }
      }
    } catch (error) {
      console.error('Failed to submit voice RFQ:', error);
      toast({
        title: 'Error',
        description: 'Failed to process voice RFQ',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Voice RFQ</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Button 
            onClick={isRecording ? stopRecording : startRecording}
            variant={isRecording ? "destructive" : "default"}
            className="w-full"
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Button>

          {progress > 0 && (
            <Progress value={progress} className="w-full" />
          )}

          {transcription && (
            <div className="p-4 bg-gray-100 rounded">
              <h3 className="font-medium">Transcription:</h3>
              <p>{transcription}</p>
            </div>
          )}

          {audioBlob && !isRecording && (
            <Button onClick={handleSubmit} className="w-full">
              Submit Voice RFQ
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
