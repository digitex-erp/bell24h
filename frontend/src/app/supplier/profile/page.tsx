'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { categories } from '@/lib/api/rfq'
import { createSupplierProfile } from '@/lib/api/supplier'
import { useRouter } from 'next/navigation'

interface SupplierFormData {
  company_name: string
  description: string
  categories: string[]
  subcategories: string[]
  specialties: string
  certifications: string[]
  location: string
}

export default function SupplierProfilePage() {
  const router = useRouter()
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SupplierFormData>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const selectedCategories = watch('categories') || []
  const availableSubcategories = categories
    .filter(c => selectedCategories.includes(c.name))
    .flatMap(c => c.subcategories)

  const onSubmit = async (data: SupplierFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)
      await createSupplierProfile(data)
      router.push('/supplier/dashboard')
    } catch (err) {
      console.error('Error creating supplier profile:', err)
      setError('Failed to create supplier profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Create Supplier Profile</h2>
            <p className="mt-1 text-sm text-gray-500">
              Complete your supplier profile to start receiving relevant RFQs.
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Company Name */}
            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                type="text"
                {...register('company_name', {
                  required: 'Company name is required',
                  minLength: { value: 2, message: 'Company name must be at least 2 characters' },
                  maxLength: { value: 100, message: 'Company name must be at most 100 characters' }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.company_name && (
                <p className="mt-1 text-sm text-red-600">{errors.company_name.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Company Description
              </label>
              <textarea
                {...register('description', {
                  required: 'Description is required',
                  minLength: { value: 20, message: 'Description must be at least 20 characters' }
                })}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Categories</label>
              <div className="mt-2 space-y-2">
                {categories.map((category) => (
                  <div key={category.name} className="flex items-center">
                    <input
                      type="checkbox"
                      value={category.name}
                      {...register('categories', { required: 'Select at least one category' })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">{category.name}</label>
                  </div>
                ))}
              </div>
              {errors.categories && (
                <p className="mt-1 text-sm text-red-600">{errors.categories.message}</p>
              )}
            </div>

            {/* Subcategories */}
            {selectedCategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Subcategories</label>
                <div className="mt-2 space-y-2">
                  {availableSubcategories.map((subcategory) => (
                    <div key={subcategory} className="flex items-center">
                      <input
                        type="checkbox"
                        value={subcategory}
                        {...register('subcategories', { required: 'Select at least one subcategory' })}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">{subcategory}</label>
                    </div>
                  ))}
                </div>
                {errors.subcategories && (
                  <p className="mt-1 text-sm text-red-600">{errors.subcategories.message}</p>
                )}
              </div>
            )}

            {/* Specialties */}
            <div>
              <label htmlFor="specialties" className="block text-sm font-medium text-gray-700">
                Specialties
              </label>
              <textarea
                {...register('specialties', {
                  required: 'Specialties are required',
                  minLength: { value: 20, message: 'Specialties must be at least 20 characters' }
                })}
                rows={4}
                placeholder="Describe your company's specialties, expertise, and unique capabilities..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.specialties && (
                <p className="mt-1 text-sm text-red-600">{errors.specialties.message}</p>
              )}
            </div>

            {/* Certifications */}
            <div>
              <label htmlFor="certifications" className="block text-sm font-medium text-gray-700">
                Certifications (Optional)
              </label>
              <input
                type="text"
                {...register('certifications')}
                placeholder="ISO 9001, ISO 14001, etc. (comma-separated)"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                {...register('location', { required: 'Location is required' })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
