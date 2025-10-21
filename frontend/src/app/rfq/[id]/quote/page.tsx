'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { createQuotation } from '@/lib/api/quotation'

interface QuotationFormData {
  unit_price: number
  total_price: number
  currency: string
  delivery_time: number
  delivery_terms: string
  warranty_period: string
  payment_terms: string
  validity_period: number
  technical_specifications?: string
  terms_and_conditions?: string
  notes?: string
}

export default function CreateQuotationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<QuotationFormData>()
  const [files, setFiles] = useState<FileList | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (data: QuotationFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const formData = new FormData()
      formData.append('quotation_in', JSON.stringify({
        ...data,
        rfq_id: parseInt(params.id)
      }))

      if (files) {
        Array.from(files).forEach((file) => {
          formData.append('files', file)
        })
      }

      await createQuotation(formData)
      router.push(`/rfq/${params.id}`)
    } catch (err) {
      console.error('Error creating quotation:', err)
      setError('Failed to create quotation. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Submit Quotation</h2>
            <p className="mt-1 text-sm text-gray-500">
              Please provide your quotation details for this RFQ.
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
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              {/* Unit Price */}
              <div>
                <label htmlFor="unit_price" className="block text-sm font-medium text-gray-700">
                  Unit Price
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    step="0.01"
                    {...register('unit_price', {
                      required: 'Unit price is required',
                      min: { value: 0, message: 'Unit price must be positive' }
                    })}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                {errors.unit_price && (
                  <p className="mt-1 text-sm text-red-600">{errors.unit_price.message}</p>
                )}
              </div>

              {/* Total Price */}
              <div>
                <label htmlFor="total_price" className="block text-sm font-medium text-gray-700">
                  Total Price
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    step="0.01"
                    {...register('total_price', {
                      required: 'Total price is required',
                      min: { value: 0, message: 'Total price must be positive' }
                    })}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                {errors.total_price && (
                  <p className="mt-1 text-sm text-red-600">{errors.total_price.message}</p>
                )}
              </div>

              {/* Currency */}
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                  Currency
                </label>
                <select
                  {...register('currency', { required: 'Currency is required' })}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
                {errors.currency && (
                  <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
                )}
              </div>

              {/* Delivery Time */}
              <div>
                <label htmlFor="delivery_time" className="block text-sm font-medium text-gray-700">
                  Delivery Time (days)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    {...register('delivery_time', {
                      required: 'Delivery time is required',
                      min: { value: 1, message: 'Delivery time must be at least 1 day' }
                    })}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                {errors.delivery_time && (
                  <p className="mt-1 text-sm text-red-600">{errors.delivery_time.message}</p>
                )}
              </div>
            </div>

            {/* Delivery Terms */}
            <div>
              <label htmlFor="delivery_terms" className="block text-sm font-medium text-gray-700">
                Delivery Terms
              </label>
              <div className="mt-1">
                <textarea
                  {...register('delivery_terms', { required: 'Delivery terms are required' })}
                  rows={3}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              {errors.delivery_terms && (
                <p className="mt-1 text-sm text-red-600">{errors.delivery_terms.message}</p>
              )}
            </div>

            {/* Warranty Period */}
            <div>
              <label htmlFor="warranty_period" className="block text-sm font-medium text-gray-700">
                Warranty Period
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  {...register('warranty_period', { required: 'Warranty period is required' })}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="e.g., 1 year"
                />
              </div>
              {errors.warranty_period && (
                <p className="mt-1 text-sm text-red-600">{errors.warranty_period.message}</p>
              )}
            </div>

            {/* Payment Terms */}
            <div>
              <label htmlFor="payment_terms" className="block text-sm font-medium text-gray-700">
                Payment Terms
              </label>
              <div className="mt-1">
                <textarea
                  {...register('payment_terms', { required: 'Payment terms are required' })}
                  rows={3}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              {errors.payment_terms && (
                <p className="mt-1 text-sm text-red-600">{errors.payment_terms.message}</p>
              )}
            </div>

            {/* Validity Period */}
            <div>
              <label htmlFor="validity_period" className="block text-sm font-medium text-gray-700">
                Validity Period (days)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  {...register('validity_period', {
                    required: 'Validity period is required',
                    min: { value: 1, message: 'Validity period must be at least 1 day' }
                  })}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              {errors.validity_period && (
                <p className="mt-1 text-sm text-red-600">{errors.validity_period.message}</p>
              )}
            </div>

            {/* Technical Specifications */}
            <div>
              <label htmlFor="technical_specifications" className="block text-sm font-medium text-gray-700">
                Technical Specifications (Optional)
              </label>
              <div className="mt-1">
                <textarea
                  {...register('technical_specifications')}
                  rows={4}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            {/* Terms and Conditions */}
            <div>
              <label htmlFor="terms_and_conditions" className="block text-sm font-medium text-gray-700">
                Terms and Conditions (Optional)
              </label>
              <div className="mt-1">
                <textarea
                  {...register('terms_and_conditions')}
                  rows={4}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Additional Notes (Optional)
              </label>
              <div className="mt-1">
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            {/* File Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Attachments (Optional)
              </label>
              <div className="mt-1">
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quotation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
