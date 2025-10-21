'use client'

import { useState, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { TrashIcon } from '@heroicons/react/24/outline'

interface ProductVideo {
  title: string
  description?: string
  video_url: string
  thumbnail_url: string
  public_id: string
}

interface ProductShowcaseProps {
  supplierId: number
  existingVideos?: ProductVideo[]
  onVideoAdded?: (video: ProductVideo) => void
  onVideoDeleted?: (publicId: string) => void
}

export default function ProductShowcase({
  supplierId,
  existingVideos = [],
  onVideoAdded,
  onVideoDeleted
}: ProductShowcaseProps) {
  const [uploading, setUploading] = useState(false)
  const [videos, setVideos] = useState<ProductVideo[]>(existingVideos)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    try {
      setUploading(true)
      
      const formData = new FormData()
      formData.append('video', selectedFile)
      formData.append('title', title)
      if (description) {
        formData.append('description', description)
      }
      
      const response = await fetch(`/api/v1/video/product-video/${supplierId}`, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Failed to upload product video')
      }
      
      const data = await response.json()
      
      const newVideo: ProductVideo = {
        title,
        description,
        video_url: data.video_url,
        thumbnail_url: data.thumbnail_url,
        public_id: data.public_id
      }
      
      setVideos([...videos, newVideo])
      if (onVideoAdded) {
        onVideoAdded(newVideo)
      }
      
      // Reset form
      setTitle('')
      setDescription('')
      setSelectedFile(null)
      setShowUploadForm(false)
      if (fileInput.current) {
        fileInput.current.value = ''
      }
      
      toast.success('Video uploaded successfully!')
    } catch (err) {
      console.error('Error uploading video:', err)
      toast.error('Failed to upload video')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (publicId: string) => {
    try {
      const response = await fetch(
        `/api/v1/video/product-video/${supplierId}/${publicId}`,
        {
          method: 'DELETE'
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to delete video')
      }
      
      setVideos(videos.filter(v => v.public_id !== publicId))
      if (onVideoDeleted) {
        onVideoDeleted(publicId)
      }
      
      toast.success('Video deleted successfully!')
    } catch (err) {
      console.error('Error deleting video:', err)
      toast.error('Failed to delete video')
    }
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="text-xl font-semibold text-gray-900">
            Product Showcase Videos
          </h2>
          <p className="mt-2 text-sm text-gray-700">
            Upload videos showcasing your products and manufacturing process.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {showUploadForm ? 'Cancel Upload' : 'Add Video'}
          </button>
        </div>
      </div>

      {showUploadForm && (
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
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
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Video File
              </label>
              <input
                ref={fileInput}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                required
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Video'}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <div
            key={video.public_id}
            className="relative bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="aspect-w-16 aspect-h-9">
              <video
                src={video.video_url}
                poster={video.thumbnail_url}
                controls
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900">{video.title}</h3>
              {video.description && (
                <p className="mt-1 text-sm text-gray-500">{video.description}</p>
              )}
              
              <button
                type="button"
                onClick={() => handleDelete(video.public_id)}
                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-lg text-gray-500 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
