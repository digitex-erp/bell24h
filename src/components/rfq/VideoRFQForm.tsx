'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@insforge/nextjs';
import { insforge } from '@/lib/insforge';
import { useRouter } from 'next/navigation';

type RecordingState = 'idle' | 'recording' | 'stopped' | 'uploading' | 'analyzing' | 'review';

interface ExtractedData {
  productName: string;
  quantity: number;
  unit: string;
  deliveryTimeline: string;
  location: string;
  additionalRequirements: string;
  extractedText: string;
  confidence: number;
  language: string;
  duration: number;
}

export default function VideoRFQForm() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Recording state
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');

  // AI Analysis
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  // Form data (editable after AI extraction)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    quantity: '',
    unit: 'kg',
    budget_min: '',
    budget_max: '',
    location: '',
    deadline: '',
  });

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const videoPlaybackRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await insforge.database
        .from('categories')
        .select('id, name, slug')
        .is('parent_id', null)
        .order('name', { ascending: true });

      if (!error && data) {
        setCategories(data);
      }
    }

    fetchCategories();
  }, []);

  // Timer effect
  useEffect(() => {
    if (recordingState === 'recording') {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          // Auto-stop at 2 minutes
          if (prev >= 120) {
            stopRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recordingState]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: true,
      });

      streamRef.current = stream;

      // Show preview
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus',
      });

      videoChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        setVideoBlob(videoBlob);
        setRecordingState('stopped');

        // Create playback URL
        const url = URL.createObjectURL(videoBlob);
        if (videoPlaybackRef.current) {
          videoPlaybackRef.current.src = url;
        }

        // Stop camera stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        // Clear preview
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = null;
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecordingState('recording');
      setRecordingTime(0);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access camera. Please grant permission and try again.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // Upload and analyze
  const uploadAndAnalyze = async () => {
    if (!videoBlob || !user) return;

    try {
      setRecordingState('uploading');

      // 1. Upload to InsForge Storage
      const fileName = `video-rfq-${user.id}-${Date.now()}.webm`;
      const file = new File([videoBlob], fileName, { type: 'video/webm' });

      const { data: uploadData, error: uploadError } = await insforge.storage
        .from('video-rfqs')
        .uploadAuto(file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      setVideoUrl(uploadData.url);
      setRecordingState('analyzing');

      // 2. Analyze with AI (audio transcription)
      const response = await fetch('/api/rfqs/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'video',
          fileUrl: uploadData.url,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const result = await response.json();

      // 3. Set extracted data
      setExtractedData(result.analysis);

      // 4. Pre-fill form with AI-extracted data
      setFormData({
        title: result.analysis.productName || '',
        description: result.analysis.additionalRequirements || '',
        category: '',
        quantity: result.analysis.quantity?.toString() || '',
        unit: result.analysis.unit || 'kg',
        budget_min: '',
        budget_max: '',
        location: result.analysis.location || '',
        deadline: '',
      });

      setRecordingState('review');

    } catch (error: any) {
      console.error('Error uploading/analyzing:', error);
      alert(`Error: ${error.message}`);
      setRecordingState('stopped');
    }
  };

  // Submit final RFQ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Please sign in to create an RFQ');
      return;
    }

    try {
      const { data, error } = await insforge.database
        .from('rfqs')
        .insert([{
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          quantity: Number(formData.quantity),
          unit: formData.unit,
          budget_min: formData.budget_min ? Number(formData.budget_min) : null,
          budget_max: formData.budget_max ? Number(formData.budget_max) : null,
          location: formData.location,
          deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
          type: 'video',
          status: 'open',
          is_public: true,
          video_url: videoUrl,
          transcription: extractedData?.extractedText || '',
          extracted_data: extractedData ? {
            confidence: extractedData.confidence,
            language: extractedData.language,
            duration: extractedData.duration,
            deliveryTimeline: extractedData.deliveryTimeline,
          } : null,
        }])
        .select();

      if (error) {
        throw error;
      }

      alert('Video RFQ created successfully! 🎉');
      router.push('/dashboard/rfqs');
    } catch (error: any) {
      console.error('Error creating RFQ:', error);
      alert(`Error: ${error.message || 'Failed to create RFQ'}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset form
  const resetForm = () => {
    setRecordingState('idle');
    setRecordingTime(0);
    setVideoBlob(null);
    setVideoUrl('');
    setExtractedData(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      quantity: '',
      unit: 'kg',
      budget_min: '',
      budget_max: '',
      location: '',
      deadline: '',
    });
  };

  if (!isLoaded) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-lg mb-4">Please sign in to create a Video RFQ</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-purple-700">🎥 Create Video RFQ</h2>

      {/* Recording Interface */}
      {(recordingState === 'idle' || recordingState === 'recording' || recordingState === 'stopped') && (
        <div className="mb-8">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4">
              {recordingState === 'idle' && 'Click the button below to start recording your product demo'}
              {recordingState === 'recording' && 'Show your product. Speak clearly. Describe requirements.'}
              {recordingState === 'stopped' && 'Recording complete! Review your video or record again.'}
            </p>

            {/* Camera Preview (while recording) */}
            {recordingState === 'recording' && (
              <div className="relative mb-4 bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoPreviewRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-auto max-h-96"
                />
                {/* Recording Indicator Overlay */}
                <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-600 px-3 py-1 rounded-full">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white font-mono font-bold">{formatTime(recordingTime)}</span>
                </div>
                {/* Max Duration Warning */}
                {recordingTime >= 110 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 px-4 py-2 rounded-lg">
                    <span className="text-black font-semibold">
                      {120 - recordingTime}s remaining!
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Video Playback (after stopped) */}
            {recordingState === 'stopped' && (
              <div className="my-6 bg-black rounded-lg overflow-hidden">
                <video ref={videoPlaybackRef} controls className="w-full h-auto max-h-96" />
              </div>
            )}
          </div>

          {/* Recording Controls */}
          <div className="flex justify-center space-x-4">
            {recordingState === 'idle' && (
              <button
                onClick={startRecording}
                className="px-8 py-4 bg-purple-600 text-white rounded-full hover:bg-purple-700 text-lg font-semibold shadow-lg flex items-center space-x-2"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                <span>Start Recording</span>
              </button>
            )}

            {recordingState === 'recording' && (
              <button
                onClick={stopRecording}
                className="px-8 py-4 bg-red-600 text-white rounded-full hover:bg-red-700 text-lg font-semibold shadow-lg"
              >
                ⏹ Stop Recording
              </button>
            )}

            {recordingState === 'stopped' && (
              <>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  🔄 Record Again
                </button>
                <button
                  onClick={uploadAndAnalyze}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  ✨ Analyze with AI
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Processing States */}
      {(recordingState === 'uploading' || recordingState === 'analyzing') && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mb-4"></div>
          <p className="text-lg font-semibold text-purple-600">
            {recordingState === 'uploading' && '☁️ Uploading your video...'}
            {recordingState === 'analyzing' && '🧠 AI is analyzing your video...'}
          </p>
          <p className="text-sm text-gray-500 mt-2">This may take 10-45 seconds</p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4 max-w-md mx-auto">
            <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
      )}

      {/* Review & Edit Form */}
      {recordingState === 'review' && extractedData && (
        <form onSubmit={handleSubmit}>
          {/* AI Extraction Summary */}
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">✅ AI Analysis Complete!</h3>
            <div className="text-sm space-y-1 text-purple-700">
              <p><strong>Language:</strong> {extractedData.language === 'en' ? '🇬🇧 English' : extractedData.language === 'hi' ? '🇮🇳 Hindi' : extractedData.language}</p>
              <p><strong>Confidence:</strong> {(extractedData.confidence * 100).toFixed(0)}%</p>
              <p><strong>Duration:</strong> {extractedData.duration.toFixed(1)}s</p>
            </div>
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-medium text-purple-800">View Full Transcription</summary>
              <p className="mt-2 text-sm text-gray-700 italic">&quot;{extractedData.extractedText}&quot;</p>
            </details>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product/Service Title * (AI Extracted)</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Industrial Machinery Parts"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description * (AI Extracted)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500"
                placeholder="Additional requirements..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Quantity * (AI Extracted)</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-purple-300 rounded-md"
                  placeholder="e.g., 100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Unit (AI Extracted)</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-purple-300 rounded-md"
                >
                  <option value="units">Units</option>
                  <option value="kg">Kilograms</option>
                  <option value="tons">Tons</option>
                  <option value="liters">Liters</option>
                  <option value="meters">Meters</option>
                  <option value="pieces">Pieces</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Min Budget (₹)</label>
                <input
                  type="number"
                  name="budget_min"
                  value={formData.budget_min}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., 50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Max Budget (₹)</label>
                <input
                  type="number"
                  name="budget_max"
                  value={formData.budget_max}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., 75000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location * (AI Extracted)</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-purple-300 rounded-md"
                placeholder="e.g., Mumbai, Maharashtra"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Deadline (Optional)</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-500 text-white py-3 rounded-md hover:bg-gray-600"
              >
                ↩️ Start Over
              </button>
              <button
                type="submit"
                className="flex-1 bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 font-semibold"
              >
                📤 Post Video RFQ
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Feature Info */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
        <p className="font-semibold mb-2">🎬 Video RFQ Tips</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Show the product clearly - zoom in on important details</li>
          <li>Speak your requirements - mention quantity, quality, delivery</li>
          <li>Record in good lighting for better visibility</li>
          <li>Maximum duration: 2 minutes (auto-stops)</li>
          <li>Works in Hindi, Tamil, Telugu, English, and 30+ languages</li>
        </ul>
      </div>
    </div>
  );
}
