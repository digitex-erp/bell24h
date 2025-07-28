'use client';

import React, { useState } from 'react';
import { redirect, useRouter } from 'next/navigation';
import Link from 'next/link';
import RFQExplanationButton from '@/components/RFQExplanationButton';

interface FileAttachment {
  name: string;
  url: string;
  size: number;
  type: string;
}

interface RFQForm {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  quantity: string;
  unit: string;
  minBudget: string;
  maxBudget: string;
  deadline: string;
  priority: string;
  specifications: string;
  qualityStandards: string;
  deliveryTerms: string;
  paymentTerms: string;
  location: string;
  attachments: FileAttachment[];
  videoUrl: string;
}

// Video RFQ Uploader Component
const VideoRFQUploader = ({ onVideoUploaded }: { onVideoUploaded: (videoUrl: string) => void }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
      }
    }
  };

  const uploadVideo = async () => {
    if (!videoFile) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate video upload with progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          onVideoUploaded(URL.createObjectURL(videoFile));
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className='bg-white p-6 rounded-lg border border-gray-200'>
      <h3 className='text-lg font-semibold mb-4 flex items-center'>
        <span>🎥</span>
        Video RFQ Upload
      </h3>

      {!videoFile ? (
        <div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center'>
          <span>🎥</span>
          <p className='text-gray-600 mb-4'>
            Upload a video explaining your requirements to help suppliers understand your needs
            better.
          </p>
          <input
            type='file'
            accept='video/*'
            onChange={handleVideoSelect}
            className='hidden'
            id='video-upload'
          />
          <label
            htmlFor='video-upload'
            className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer inline-flex items-center'
          >
            <span>⬆️</span>
            Select Video
          </label>
        </div>
      ) : (
        <div className='space-y-4'>
          <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
            <div className='flex items-center'>
              <span>🎥</span>
              <span className='font-medium'>{videoFile.name}</span>
            </div>
            <button onClick={() => setVideoFile(null)} className='text-red-600 hover:text-red-800'>
              <span>❌</span>
            </button>
          </div>

          {uploading ? (
            <div className='space-y-2'>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className='text-sm text-gray-600'>Uploading... {uploadProgress}%</p>
            </div>
          ) : (
            <button
              onClick={uploadVideo}
              className='w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center'
            >
              <span>⬆️</span>
              Upload Video RFQ
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default function CreateRFQPage() {
  const { data: session, status } = () => ({ data: { user: { id: "demo", email: "demo@bell24h.com", name: "Demo User" } }, status: "authenticated" });
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [rfqForm, setRfqForm] = useState<RFQForm>({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    quantity: '',
    unit: 'pieces',
    minBudget: '',
    maxBudget: '',
    deadline: '',
    priority: 'medium',
    specifications: '',
    qualityStandards: '',
    deliveryTerms: '',
    paymentTerms: '',
    location: '',
    attachments: [],
    videoUrl: '',
  });

  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const categories = [
    {
      value: 'chemicals',
      label: 'Chemicals & Materials',
      subcategories: ['Industrial Chemicals', 'Raw Materials', 'Specialty Chemicals'],
    },
    {
      value: 'automotive',
      label: 'Automotive & Transportation',
      subcategories: ['Auto Parts', 'Components', 'Accessories'],
    },
    {
      value: 'electronics',
      label: 'Electronics & Technology',
      subcategories: ['Components', 'PCB', 'Semiconductors'],
    },
    {
      value: 'machinery',
      label: 'Machinery & Equipment',
      subcategories: ['Industrial Machinery', 'Tools', 'Equipment'],
    },
    {
      value: 'textiles',
      label: 'Textiles & Apparel',
      subcategories: ['Fabrics', 'Garments', 'Accessories'],
    },
    {
      value: 'food',
      label: 'Food & Agriculture',
      subcategories: ['Food Products', 'Agricultural Products', 'Processing'],
    },
  ];

  const units = ['pieces', 'kg', 'tons', 'meters', 'liters', 'boxes', 'sets', 'pairs'];
  const priorities = [
    { value: 'low', label: 'Low Priority', color: 'text-green-600 bg-green-100' },
    { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'high', label: 'High Priority', color: 'text-red-600 bg-red-100' },
  ];

  // Removed status loading check since mock auth always returns 'authenticated'

  if (!session) {
    redirect('/login');
  }

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);

    // Simulate file upload
    for (let file of Array.from(files)) {
      const fileUrl = URL.createObjectURL(file);
      setRfqForm(prev => ({
        ...prev,
        attachments: [
          ...prev.attachments,
          {
            name: file.name,
            url: fileUrl,
            size: file.size,
            type: file.type,
          },
        ],
      }));
    }

    setUploading(false);
  };

  const removeFile = (index: number) => {
    setRfqForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    // Implement voice recording logic
    setTimeout(() => {
      setIsRecording(false);
      setMessage({
        type: 'success',
        text: 'Voice recording processed! RFQ details have been auto-filled.',
      });
      // Auto-fill some demo data
      setRfqForm(prev => ({
        ...prev,
        title: 'Industrial Steel Pipes for Chemical Plant',
        description:
          'We need high-grade stainless steel pipes for our new chemical processing facility. The pipes should be corrosion-resistant and meet international standards.',
        category: 'chemicals',
        quantity: '500',
        unit: 'meters',
      }));
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // Include video URL in the form data
      const formDataWithVideo = {
        ...rfqForm,
        videoUrl: videoUrl,
      };

      const response = await fetch('/api/rfq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataWithVideo),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'RFQ created successfully!' });
        setTimeout(() => {
          router.push('/dashboard?tab=rfqs');
        }, 2000);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to create RFQ' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }

    setSubmitting(false);
  };

  const selectedCategory = categories.find(cat => cat.value === rfqForm.category);

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center space-x-4'>
              <Link
                href='/dashboard'
                className='flex items-center space-x-2 text-gray-600 hover:text-gray-900'
              >
                <span>←</span>
                <span>Back to Dashboard</span>
              </Link>
              <div className='h-6 border-l border-gray-300'></div>
              <h1 className='text-2xl font-bold text-gray-900'>Create New RFQ</h1>
            </div>
            <div className='flex space-x-4'>
              <button
                type='button'
                onClick={startVoiceRecording}
                disabled={isRecording}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  isRecording
                    ? 'bg-red-100 border-red-300 text-red-700'
                    : 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {isRecording ? <span>🎤</span> : <span>🎤</span>}
                <span>{isRecording ? 'Recording...' : 'Voice RFQ'}</span>
              </button>
              <button
                type='button'
                onClick={() => setShowVideoUpload(!showVideoUpload)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  showVideoUpload
                    ? 'bg-purple-100 border-purple-300 text-purple-700'
                    : 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200'
                }`}
              >
                {showVideoUpload ? <span>🎥</span> : <span>🎥</span>}
                <span>{showVideoUpload ? 'Hide Video' : 'Video RFQ'}</span>
              </button>
              <RFQExplanationButton
                rfqId='preview'
                rfqTitle={rfqForm.title || 'New RFQ'}
                className='flex-shrink-0'
              />
              <button
                type='submit'
                form='rfq-form'
                disabled={submitting}
                className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50'
              >
                <span>💾</span>
                <span>{submitting ? 'Creating...' : 'Create RFQ'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <span>✅</span>
            ) : (
              <AlertTriangle className='w-5 h-5' />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Form */}
          <div className='lg:col-span-2'>
            <form id='rfq-form' onSubmit={handleSubmit} className='space-y-6'>
              {/* Basic Information */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-6'>Basic Information</h3>

                <div className='space-y-6'>
                  {/* RFQ Title */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      RFQ Title *
                    </label>
                    <input
                      type='text'
                      required
                      value={rfqForm.title}
                      onChange={e => setRfqForm(prev => ({ ...prev, title: e.target.value }))}
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='e.g., Industrial Steel Pipes for Chemical Plant'
                    />
                  </div>

                  {/* Category & Subcategory */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Category *
                      </label>
                      <select
                        required
                        value={rfqForm.category}
                        onChange={e =>
                          setRfqForm(prev => ({
                            ...prev,
                            category: e.target.value,
                            subcategory: '',
                          }))
                        }
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      >
                        <option value=''>Select Category</option>
                        {categories.map(category => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Subcategory
                      </label>
                      <select
                        value={rfqForm.subcategory}
                        onChange={e =>
                          setRfqForm(prev => ({ ...prev, subcategory: e.target.value }))
                        }
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        disabled={!selectedCategory}
                      >
                        <option value=''>Select Subcategory</option>
                        {selectedCategory?.subcategories.map(sub => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Description *
                    </label>
                    <textarea
                      required
                      value={rfqForm.description}
                      onChange={e => setRfqForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='Detailed description of what you need, intended use, and any specific requirements...'
                    />
                  </div>

                  {/* Quantity & Unit */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Quantity *
                      </label>
                      <input
                        type='text'
                        required
                        value={rfqForm.quantity}
                        onChange={e => setRfqForm(prev => ({ ...prev, quantity: e.target.value }))}
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='e.g., 500, 1000, 2.5'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>Unit *</label>
                      <select
                        required
                        value={rfqForm.unit}
                        onChange={e => setRfqForm(prev => ({ ...prev, unit: e.target.value }))}
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      >
                        {units.map(unit => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget & Timeline */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-6'>Budget & Timeline</h3>

                <div className='space-y-6'>
                  {/* Budget Range */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Minimum Budget
                      </label>
                      <div className='relative'>
                        <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500'>
                          ₹
                        </span>
                        <input
                          type='text'
                          value={rfqForm.minBudget}
                          onChange={e =>
                            setRfqForm(prev => ({ ...prev, minBudget: e.target.value }))
                          }
                          className='w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          placeholder='10,00,000'
                        />
                      </div>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Maximum Budget
                      </label>
                      <div className='relative'>
                        <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500'>
                          ₹
                        </span>
                        <input
                          type='text'
                          value={rfqForm.maxBudget}
                          onChange={e =>
                            setRfqForm(prev => ({ ...prev, maxBudget: e.target.value }))
                          }
                          className='w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          placeholder='15,00,000'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Deadline & Priority */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Deadline *
                      </label>
                      <div className='relative'>
                        <span>📅</span>
                        <input
                          type='date'
                          required
                          value={rfqForm.deadline}
                          onChange={e =>
                            setRfqForm(prev => ({ ...prev, deadline: e.target.value }))
                          }
                          className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Priority
                      </label>
                      <select
                        value={rfqForm.priority}
                        onChange={e => setRfqForm(prev => ({ ...prev, priority: e.target.value }))}
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      >
                        {priorities.map(priority => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-6'>
                  Technical Specifications
                </h3>

                <div className='space-y-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Technical Specifications
                    </label>
                    <textarea
                      value={rfqForm.specifications}
                      onChange={e =>
                        setRfqForm(prev => ({ ...prev, specifications: e.target.value }))
                      }
                      rows={4}
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='Material specifications, dimensions, technical standards, certifications required...'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Quality Standards
                    </label>
                    <textarea
                      value={rfqForm.qualityStandards}
                      onChange={e =>
                        setRfqForm(prev => ({ ...prev, qualityStandards: e.target.value }))
                      }
                      rows={3}
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='ISO standards, industry certifications, testing requirements...'
                    />
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-6'>Terms & Conditions</h3>

                <div className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Delivery Terms
                      </label>
                      <input
                        type='text'
                        value={rfqForm.deliveryTerms}
                        onChange={e =>
                          setRfqForm(prev => ({ ...prev, deliveryTerms: e.target.value }))
                        }
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='e.g., FOB Mumbai, Door delivery, Ex-works'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Payment Terms
                      </label>
                      <input
                        type='text'
                        value={rfqForm.paymentTerms}
                        onChange={e =>
                          setRfqForm(prev => ({ ...prev, paymentTerms: e.target.value }))
                        }
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='e.g., 30% advance, 70% on delivery'
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Delivery Location
                    </label>
                    <div className='relative'>
                      <span>📍</span>
                      <input
                        type='text'
                        value={rfqForm.location}
                        onChange={e => setRfqForm(prev => ({ ...prev, location: e.target.value }))}
                        className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='City, State, Country'
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* File Attachments */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-6'>Attachments</h3>

                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                  }`}
                  onDragOver={e => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={e => {
                    e.preventDefault();
                    setDragActive(false);
                    handleFileUpload(e.dataTransfer.files);
                  }}
                >
                  <span>📄</span>
                  <p className='text-gray-600 mb-2'>Drag and drop files here, or</p>
                  <input
                    type='file'
                    multiple
                    onChange={e => e.target.files && handleFileUpload(e.target.files)}
                    className='hidden'
                    id='file-upload'
                  />
                  <label
                    htmlFor='file-upload'
                    className='bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors'
                  >
                    Choose Files
                  </label>
                  <p className='text-xs text-gray-500 mt-2'>
                    PDF, DOC, XLS, Images up to 10MB each
                  </p>
                </div>

                {/* File Preview */}
                {rfqForm.attachments.length > 0 && (
                  <div className='space-y-3 mt-4'>
                    {rfqForm.attachments.map((file, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                      >
                        <div className='flex items-center space-x-3'>
                          <span>📄</span>
                          <span className='text-sm font-medium'>{file.name}</span>
                          <span className='text-xs text-gray-500'>
                            ({(file.size / 1024 / 1024).toFixed(1)} MB)
                          </span>
                        </div>
                        <button
                          type='button'
                          onClick={() => removeFile(index)}
                          className='text-red-600 hover:text-red-800 transition-colors'
                        >
                          <span>❌</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video RFQ Upload Section */}
              {showVideoUpload && (
                <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-6 flex items-center'>
                    <span>🎥</span>
                    Video RFQ Upload
                  </h3>

                  <div className='space-y-4'>
                    <div className='bg-purple-50 border border-purple-200 rounded-lg p-4'>
                      <h4 className='font-medium text-purple-900 mb-2'>Why Use Video RFQs?</h4>
                      <ul className='text-sm text-purple-800 space-y-1'>
                        <li>• Better supplier understanding of your requirements</li>
                        <li>• Higher response rates from qualified suppliers</li>
                        <li>• Visual demonstration of complex specifications</li>
                        <li>• Faster communication and clarification</li>
                      </ul>
                    </div>

                    <VideoRFQUploader onVideoUploaded={url => setVideoUrl(url)} />

                    {videoUrl && (
                      <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                        <div className='flex items-center space-x-2'>
                          <span>✅</span>
                          <span className='text-green-800 font-medium'>
                            Video uploaded successfully!
                          </span>
                        </div>
                        <p className='text-sm text-green-700 mt-1'>
                          Your video will be included with this RFQ submission.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Sidebar - Tips & Preview */}
          <div className='space-y-6'>
            {/* RFQ Preview */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
              <h4 className='text-lg font-semibold text-gray-900 mb-4'>RFQ Preview</h4>
              <div className='space-y-3 text-sm'>
                <div>
                  <span className='font-medium text-gray-700'>Title:</span>
                  <p className='text-gray-900'>{rfqForm.title || 'RFQ Title'}</p>
                </div>
                <div>
                  <span className='font-medium text-gray-700'>Category:</span>
                  <p className='text-gray-900'>{selectedCategory?.label || 'Not selected'}</p>
                </div>
                <div>
                  <span className='font-medium text-gray-700'>Quantity:</span>
                  <p className='text-gray-900'>
                    {rfqForm.quantity ? `${rfqForm.quantity} ${rfqForm.unit}` : 'Not specified'}
                  </p>
                </div>
                <div>
                  <span className='font-medium text-gray-700'>Budget:</span>
                  <p className='text-gray-900'>
                    {rfqForm.minBudget || rfqForm.maxBudget
                      ? `₹${rfqForm.minBudget || '0'} - ₹${rfqForm.maxBudget || '0'}`
                      : 'Not specified'}
                  </p>
                </div>
                <div>
                  <span className='font-medium text-gray-700'>Deadline:</span>
                  <p className='text-gray-900'>{rfqForm.deadline || 'Not set'}</p>
                </div>
                <div>
                  <span className='font-medium text-gray-700'>Priority:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      priorities.find(p => p.value === rfqForm.priority)?.color ||
                      'text-gray-600 bg-gray-100'
                    }`}
                  >
                    {priorities.find(p => p.value === rfqForm.priority)?.label || 'Medium'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className='bg-blue-50 rounded-xl border border-blue-200 p-6'>
              <h4 className='text-lg font-semibold text-blue-900 mb-4'>
                Tips for Better Responses
              </h4>
              <div className='space-y-3 text-sm'>
                <div className='flex items-start space-x-2'>
                  <span>✅</span>
                  <span className='text-blue-800'>
                    Be specific about your requirements and quality standards
                  </span>
                </div>
                <div className='flex items-start space-x-2'>
                  <span>📦</span>
                  <span className='text-blue-800'>
                    Include technical specifications and certifications needed
                  </span>
                </div>
                <div className='flex items-start space-x-2'>
                  <span>🕐</span>
                  <span className='text-blue-800'>
                    Set realistic deadlines to get quality responses
                  </span>
                </div>
                <div className='flex items-start space-x-2'>
                  <span>$</span>
                  <span className='text-blue-800'>
                    Provide budget range to attract suitable suppliers
                  </span>
                </div>
              </div>
            </div>

            {/* Voice RFQ Info */}
            <div className='bg-green-50 rounded-xl border border-green-200 p-6'>
              <h4 className='text-lg font-semibold text-green-900 mb-4 flex items-center'>
                <span>🔊</span>
                Voice-Powered RFQ
              </h4>
              <p className='text-sm text-green-800 mb-3'>
                Use our AI-powered voice feature to create RFQs instantly. Just speak your
                requirements and our system will auto-fill the form.
              </p>
              <div className='text-xs text-green-700'>
                ✓ Natural language processing
                <br />
                ✓ Auto-categorization
                <br />
                ✓ Specification extraction
                <br />✓ 90%+ accuracy rate
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
