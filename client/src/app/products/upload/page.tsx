'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FileUpload, { UploadedFile } from '@/components/ui/FileUpload';
import Link from 'next/link';

export default function ProductUploadPage() {
  const { data: session } = () => ({ data: { user: { id: "demo", email: "demo@bell24h.com", name: "Demo User" } }, status: "authenticated" });
  const router = useRouter();

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    category: '',
    price: { min: 0, max: 0, currency: 'INR' },
    minimumOrder: 1,
  });

  const [productImages, setProductImages] = useState<UploadedFile[]>([]);
  const [productVideos, setProductVideos] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check authentication
  if (!session) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <span>📦</span>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>Authentication Required</h2>
          <p className='text-gray-600 mb-6'>Please sign in to upload products</p>
          <Link
            href='/login'
            className='inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Prepare submission data
      const submissionData = {
        ...productData,
        images: productImages
          .filter(f => f.status === 'success')
          .map(f => ({
            url: f.cloudinaryUrl,
            publicId: f.cloudinaryPublicId,
          })),
        videos: productVideos
          .filter(f => f.status === 'success')
          .map(f => ({
            url: f.cloudinaryUrl,
            publicId: f.cloudinaryPublicId,
          })),
        uploadedBy: session.user?.email,
        createdAt: new Date().toISOString(),
      };

      console.log('Product submission data:', submissionData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert('Product uploaded successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to upload product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center space-x-4'>
              <Link href='/dashboard' className='text-gray-600 hover:text-blue-600'>
                <span>←</span>
              </Link>
              <div>
                <h1 className='text-xl font-bold text-gray-900'>Upload Product</h1>
                <p className='text-sm text-gray-600'>Add your product to Bell24H marketplace</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='bg-white rounded-xl shadow-lg p-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>Product Information</h2>

          <div className='space-y-6'>
            {/* Product Name */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Product Name *
              </label>
              <input
                type='text'
                value={productData.name}
                onChange={e => setProductData(prev => ({ ...prev, name: e.target.value }))}
                placeholder='Enter product name'
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white'
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Product Description *
              </label>
              <textarea
                value={productData.description}
                onChange={e => setProductData(prev => ({ ...prev, description: e.target.value }))}
                placeholder='Detailed product description'
                rows={4}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white'
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>Category *</label>
              <select
                value={productData.category}
                onChange={e => setProductData(prev => ({ ...prev, category: e.target.value }))}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white'
                required
              >
                <option value='' className='text-gray-500'>
                  Select category
                </option>
                <option value='electronics' className='text-gray-900'>
                  Electronics & Technology
                </option>
                <option value='machinery' className='text-gray-900'>
                  Industrial Machinery
                </option>
                <option value='chemicals' className='text-gray-900'>
                  Chemicals & Materials
                </option>
                <option value='automotive' className='text-gray-900'>
                  Automotive Parts
                </option>
                <option value='construction' className='text-gray-900'>
                  Construction Materials
                </option>
                <option value='textiles' className='text-gray-900'>
                  Textiles & Garments
                </option>
                <option value='food' className='text-gray-900'>
                  Food & Beverages
                </option>
                <option value='packaging' className='text-gray-900'>
                  Packaging & Printing
                </option>
                <option value='healthcare' className='text-gray-900'>
                  Healthcare & Medical
                </option>
                <option value='agriculture' className='text-gray-900'>
                  Agriculture & Farming
                </option>
              </select>
            </div>

            {/* Price Information */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Min Price *
                </label>
                <input
                  type='number'
                  value={productData.price.min}
                  onChange={e =>
                    setProductData(prev => ({
                      ...prev,
                      price: { ...prev.price, min: parseFloat(e.target.value) || 0 },
                    }))
                  }
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Max Price *
                </label>
                <input
                  type='number'
                  value={productData.price.max}
                  onChange={e =>
                    setProductData(prev => ({
                      ...prev,
                      price: { ...prev.price, max: parseFloat(e.target.value) || 0 },
                    }))
                  }
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>Currency</label>
                <select
                  value={productData.price.currency}
                  onChange={e =>
                    setProductData(prev => ({
                      ...prev,
                      price: { ...prev.price, currency: e.target.value },
                    }))
                  }
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white'
                >
                  <option value='INR' className='text-gray-900'>
                    INR
                  </option>
                  <option value='USD' className='text-gray-900'>
                    USD
                  </option>
                  <option value='EUR' className='text-gray-900'>
                    EUR
                  </option>
                </select>
              </div>
            </div>

            {/* Minimum Order */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Minimum Order Quantity *
              </label>
              <input
                type='number'
                value={productData.minimumOrder}
                onChange={e =>
                  setProductData(prev => ({ ...prev, minimumOrder: parseInt(e.target.value) || 1 }))
                }
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white'
                required
              />
            </div>

            {/* Product Images */}
            <div>
              <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
                <span>🖼️</span>
                Product Images
              </h3>
              <p className='text-sm text-gray-600 mb-4'>
                Upload high-quality images of your product. First image will be used as the main
                product image.
              </p>
              <span>📄</span>
            </div>

            {/* Product Videos */}
            <div>
              <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
                <span>🎥</span>
                Product Videos
              </h3>
              <p className='text-sm text-gray-600 mb-4'>
                Upload product demonstration videos to showcase your product in action. Maximum 3
                videos, 50MB each.
              </p>
              <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50'>
                <div className='text-center'>
                  <span>▶️</span>
                  <p className='text-gray-700 font-medium mb-2'>Upload Product Videos</p>
                  <p className='text-gray-500 text-sm mb-4'>
                    Drag & drop video files here or click to browse
                  </p>
                  <p className='text-gray-400 text-xs'>
                    Supported: mp4, mov, avi, webm • Max size: 50 MB • Up to 3 videos
                  </p>
                  <button className='mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition'>
                    <span>🎥</span>
                    Choose Videos
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className='flex justify-end pt-6 border-t border-gray-200'>
              <button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  !productData.name ||
                  !productData.description ||
                  !productData.category
                }
                className='inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium'
              >
                {isSubmitting ? (
                  <>
                    <div className='animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full' />
                    Publishing...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    Publish Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
