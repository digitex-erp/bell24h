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

export default function VoiceRFQForm() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Recording state
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');

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
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

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
        setRecordingTime((prev) => prev + 1);
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

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setRecordingState('stopped');

        // Create local playback URL
        const url = URL.createObjectURL(audioBlob);
        if (audioPlayerRef.current) {
          audioPlayerRef.current.src = url;
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecordingState('recording');
      setRecordingTime(0);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please grant permission and try again.');
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
    if (!audioBlob || !user) return;

    try {
      setRecordingState('uploading');

      // 1. Upload to InsForge Storage
      const fileName = `voice-rfq-${user.id}-${Date.now()}.webm`;
      const file = new File([audioBlob], fileName, { type: 'audio/webm' });

      const { data: uploadData, error: uploadError } = await insforge.storage
        .from('voice-rfqs')
        .uploadAuto(file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      setAudioUrl(uploadData.url);
      setRecordingState('analyzing');

      // 2. Analyze with AssemblyAI
      const response = await fetch('/api/rfqs/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'voice',
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
        category: '', // User needs to select category manually
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
          type: 'voice',
          status: 'open',
          is_public: true,
          audio_url: audioUrl,
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

      alert('Voice RFQ created successfully! 🎉');
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
    setAudioBlob(null);
    setAudioUrl('');
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
        <p className="text-lg mb-4">Please sign in to create a Voice RFQ</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-green-700">🎤 Create Voice RFQ</h2>

      {/* Recording Interface */}
      {(recordingState === 'idle' || recordingState === 'recording' || recordingState === 'stopped') && (
        <div className="mb-8">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4">
              {recordingState === 'idle' && 'Click the button below to start recording your requirements'}
              {recordingState === 'recording' && 'Speak clearly. Describe your product needs, quantity, and location.'}
              {recordingState === 'stopped' && 'Recording complete! Review your audio or record again.'}
            </p>

            {/* Visual Recording Indicator */}
            {recordingState === 'recording' && (
              <div className="flex justify-center items-center space-x-3 mb-4">
                <div className="relative">
                  <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-4 h-4 bg-red-600 rounded-full animate-ping"></div>
                </div>
                <span className="text-2xl font-mono font-bold text-red-600">
                  {formatTime(recordingTime)}
                </span>
              </div>
            )}

            {/* Waveform Visualization */}
            {recordingState === 'recording' && (
              <div className="flex justify-center items-center space-x-1 h-16">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-green-500 rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  ></div>
                ))}
              </div>
            )}

            {/* Audio Playback */}
            {recordingState === 'stopped' && (
              <div className="my-6">
                <audio ref={audioPlayerRef} controls className="w-full" />
              </div>
            )}
          </div>

          {/* Recording Controls */}
          <div className="flex justify-center space-x-4">
            {recordingState === 'idle' && (
              <button
                onClick={startRecording}
                className="px-8 py-4 bg-green-600 text-white rounded-full hover:bg-green-700 text-lg font-semibold shadow-lg flex items-center space-x-2"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
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
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-lg font-semibold text-blue-600">
            {recordingState === 'uploading' && '☁️ Uploading your voice recording...'}
            {recordingState === 'analyzing' && '🧠 AI is analyzing your requirements...'}
          </p>
          <p className="text-sm text-gray-500 mt-2">This may take 10-30 seconds</p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4 max-w-md mx-auto">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
      )}

      {/* Review & Edit Form */}
      {recordingState === 'review' && extractedData && (
        <form onSubmit={handleSubmit}>
          {/* AI Extraction Summary */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">✅ AI Analysis Complete!</h3>
            <div className="text-sm space-y-1 text-green-700">
              <p><strong>Language:</strong> {extractedData.language === 'en' ? '🇬🇧 English' : extractedData.language === 'hi' ? '🇮🇳 Hindi' : extractedData.language}</p>
              <p><strong>Confidence:</strong> {(extractedData.confidence * 100).toFixed(0)}%</p>
              <p><strong>Duration:</strong> {extractedData.duration.toFixed(1)}s</p>
            </div>
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-medium text-green-800">View Full Transcription</summary>
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
                className="w-full px-3 py-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Steel TMT Bars"
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
                className="w-full px-3 py-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500"
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
                  className="w-full px-3 py-2 border border-green-300 rounded-md"
                  placeholder="e.g., 1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Unit (AI Extracted)</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-green-300 rounded-md"
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
                className="w-full px-3 py-2 border border-green-300 rounded-md"
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
                className="flex-1 bg-green-600 text-white py-3 rounded-md hover:bg-green-700 font-semibold"
              >
                📤 Post Voice RFQ
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Language Support Info */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
        <p className="font-semibold mb-2">🌐 Multilingual Support</p>
        <p>Speak in your preferred language: Hindi, Tamil, Telugu, English, Marathi, and 30+ more languages are supported!</p>
      </div>
    </div>
  );
}
