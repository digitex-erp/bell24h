'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, Square, Upload } from 'lucide-react';

interface VoiceRFQProps {
  onRFQCreated: (rfqData: any) => void;
  userId: string;
}

interface RFQData {
  productName: string;
  category: string;
  quantity: string;
  specifications: string;
  budget: string;
  location: string;
  urgency: 'low' | 'medium' | 'high';
  additionalRequirements: string;
}

export default function VoiceRFQ({ onRFQCreated, userId }: VoiceRFQProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState('');
  const [rfqData, setRfqData] = useState<RFQData | null>(null);
  const [error, setError] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      setError('Failed to access microphone. Please check permissions.');
      console.error('Recording error:', error);
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

  const processVoiceRFQ = async () => {
    if (!audioBlob) {
      setError('No audio recorded. Please record your RFQ first.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-rfq.webm');
      formData.append('userId', userId);

      const response = await fetch('/api/voice/rfq', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setTranscription(result.data.transcription);
        setRfqData(result.data.rfq);
        onRFQCreated(result.data.rfq);
      } else {
        setError(result.error || 'Failed to process voice RFQ');
      }
    } catch (error) {
      setError('Failed to process voice RFQ. Please try again.');
      console.error('Voice RFQ processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setTranscription('');
    setRfqData(null);
    setRecordingTime(0);
    setError('');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🎤 Voice RFQ Creation
        </h2>
        <p className="text-gray-600">
          Speak your requirements and let AI create your RFQ automatically
        </p>
      </div>

      {/* Recording Controls */}
      <div className="flex justify-center items-center space-x-4 mb-6">
        {!isRecording && !audioBlob && (
          <button
            onClick={startRecording}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Mic className="w-5 h-5" />
            <span>Start Recording</span>
          </button>
        )}

        {isRecording && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span>Recording {formatTime(recordingTime)}</span>
            </div>
            <button
              onClick={stopRecording}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Square className="w-4 h-4" />
              <span>Stop</span>
            </button>
          </div>
        )}

        {audioBlob && !isRecording && (
          <div className="flex items-center space-x-4">
            <button
              onClick={processVoiceRFQ}
              disabled={isProcessing}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isProcessing ? 'Processing...' : 'Process RFQ'}</span>
            </button>
            <button
              onClick={resetRecording}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Transcription Display */}
      {transcription && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            📝 Transcribed Text
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">{transcription}</p>
          </div>
        </div>
      )}

      {/* RFQ Data Display */}
      {rfqData && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            📋 Generated RFQ
          </h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                <p className="text-gray-900">{rfqData.productName || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <p className="text-gray-900">{rfqData.category || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <p className="text-gray-900">{rfqData.quantity || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Budget</label>
                <p className="text-gray-900">{rfqData.budget || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <p className="text-gray-900">{rfqData.location || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Urgency</label>
                <p className="text-gray-900 capitalize">{rfqData.urgency || 'Not specified'}</p>
              </div>
            </div>
            {rfqData.specifications && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Specifications</label>
                <p className="text-gray-900">{rfqData.specifications}</p>
              </div>
            )}
            {rfqData.additionalRequirements && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Additional Requirements</label>
                <p className="text-gray-900">{rfqData.additionalRequirements}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">💡 Voice RFQ Tips</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Speak clearly and at a normal pace</li>
          <li>• Mention product name, quantity, and budget</li>
          <li>• Include specifications and delivery location</li>
          <li>• Specify urgency level (low/medium/high)</li>
          <li>• Keep recording under 2 minutes for best results</li>
        </ul>
      </div>
    </div>
  );
} 