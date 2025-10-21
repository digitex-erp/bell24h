'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface VideoRFQProps {
  onSuccess?: (rfqId: number) => void
  defaultValues?: {
    title?: string
    description?: string
    categories?: string[]
  }
}

export default function VideoRFQ({ onSuccess, defaultValues }: VideoRFQProps) {
  const [recording, setRecording] = useState(false)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState(defaultValues?.title || '')
  const [description, setDescription] = useState(defaultValues?.description || '')
  const [categories, setCategories] = useState<string[]>(defaultValues?.categories || [])
  const [maskIdentity, setMaskIdentity] = useState(true)
  
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const videoPreview = useRef<HTMLVideoElement>(null)
  const router = useRouter()

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      if (videoPreview.current) {
        videoPreview.current.srcObject = stream
      }
      
      const chunks: BlobPart[] = []
      mediaRecorder.current = new MediaRecorder(stream)
      
      mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        setVideoBlob(blob)
        if (videoPreview.current) {
          videoPreview.current.src = URL.createObjectURL(blob)
        }
      }
      
      mediaRecorder.current.start()
      setRecording(true)
    } catch (err) {
      console.error('Error accessing camera:', err)
      toast.error('Could not access camera and microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && recording) {
      mediaRecorder.current.stop()
      setRecording(false)
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoBlob) return
    
    try {
      setUploading(true)
      
      const formData = new FormData()
      formData.append('video', videoBlob)
      formData.append('rfq_data', JSON.stringify({
        title,
        description,
        categories
      }))
      formData.append('mask_identity', String(maskIdentity))
      
      const response = await fetch('/api/v1/video/rfq-video', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Failed to upload RFQ video')
      }
      
      const data = await response.json()
      toast.success('RFQ video uploaded successfully!')
      
      if (onSuccess) {
        onSuccess(data.rfq_id)
      } else {
        router.push(`/rfq/${data.rfq_id}`)
      }
    } catch (err) {
      console.error('Error uploading video:', err)
      toast.error('Failed to upload RFQ video')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Create Video RFQ
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Categories
                </label>
                <input
                  type="text"
                  value={categories.join(', ')}
                  onChange={(e) => setCategories(e.target.value.split(',').map(c => c.trim()))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter categories separated by commas"
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={maskIdentity}
                  onChange={(e) => setMaskIdentity(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Mask my identity (blur face and modify voice)
                </label>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex flex-col items-center space-y-4">
              <video
                ref={videoPreview}
                className="w-full aspect-video bg-black rounded-lg"
                autoPlay
                muted
                playsInline
              />
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={recording ? stopRecording : startRecording}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    recording
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  {recording ? 'Stop Recording' : 'Start Recording'}
                </button>
                
                {videoBlob && !recording && (
                  <button
                    type="submit"
                    disabled={uploading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Submit RFQ'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
