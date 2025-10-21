import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function VoiceRFQ() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [processing, setProcessing] = useState(false)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const router = useRouter()

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)
      
      const chunks: BlobPart[] = []
      mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioBlob(blob)
      }
      
      mediaRecorder.current.start()
      setIsRecording(true)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      toast.error('Could not access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop()
      setIsRecording(false)
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  const submitVoiceRFQ = async () => {
    if (!audioBlob) return

    try {
      setProcessing(true)
      const formData = new FormData()
      formData.append('audio', audioBlob)

      const response = await fetch('/api/v1/ai/voice-rfq', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to process voice RFQ')
      }

      const data = await response.json()
      toast.success('RFQ created successfully!')
      router.push(`/rfq/${data.id}`)
    } catch (err) {
      console.error('Error submitting voice RFQ:', err)
      toast.error('Failed to create RFQ from voice')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Create RFQ using Voice
        </h2>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Click the microphone button and describe your RFQ requirements clearly.
            We'll convert your voice into a structured RFQ automatically.
          </p>
          
          <div className="flex justify-center py-8">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-4 rounded-full ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white shadow-lg transition-all duration-200 transform hover:scale-105`}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isRecording ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M5 12h14"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                )}
              </svg>
            </button>
          </div>

          {isRecording && (
            <div className="flex justify-center">
              <div className="animate-pulse text-red-600 font-medium">
                Recording...
              </div>
            </div>
          )}

          {audioBlob && !isRecording && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <audio src={URL.createObjectURL(audioBlob)} controls />
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={submitVoiceRFQ}
                  disabled={processing}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Create RFQ from Recording'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
