'use client'

import { useEffect, useState } from 'react'
import { getSupplierQuotations, submitQuotation, Quotation } from '@/lib/api/quotation'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SupplierQuotationsPage() {
  const router = useRouter()
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submittingId, setSubmittingId] = useState<number | null>(null)

  useEffect(() => {
    loadQuotations()
  }, [])

  const loadQuotations = async () => {
    try {
      const data = await getSupplierQuotations()
      setQuotations(data)
    } catch (err) {
      console.error('Error loading quotations:', err)
      setError('Failed to load quotations')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (quotationId: number) => {
    try {
      setSubmittingId(quotationId)
      await submitQuotation(quotationId)
      await loadQuotations()
    } catch (err) {
      console.error('Error submitting quotation:', err)
      setError('Failed to submit quotation')
    } finally {
      setSubmittingId(null)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">My Quotations</h1>
            <p className="mt-2 text-sm text-gray-700">
              View and manage your submitted quotations
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link
              href="/supplier/dashboard"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 p-4 rounded-md">
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
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                {quotations.length === 0 ? (
                  <div className="text-center py-12 bg-white">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No quotations</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Start by creating a quotation for an RFQ.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white">
                    {quotations.map((quotation) => (
                      <div key={quotation.id} className="border-b border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              Quotation #{quotation.id}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Created {new Date(quotation.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(quotation.status)}`}>
                              {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                            </span>
                          </div>
                        </div>

                        <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Total Price</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {quotation.total_price} {quotation.currency}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Delivery Time</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {quotation.delivery_time} days
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Warranty Period</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {quotation.warranty_period}
                            </dd>
                          </div>
                          <div className="sm:col-span-2 lg:col-span-3">
                            <dt className="text-sm font-medium text-gray-500">Delivery Terms</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {quotation.delivery_terms}
                            </dd>
                          </div>
                        </dl>

                        {quotation.attachments.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-500">Attachments</h4>
                            <ul className="mt-2 divide-y divide-gray-200">
                              {quotation.attachments.map((attachment) => (
                                <li key={attachment.id} className="py-2 flex items-center justify-between">
                                  <div className="flex items-center">
                                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                    </svg>
                                    <span className="ml-2 text-sm text-gray-500">{attachment.file_name}</span>
                                  </div>
                                  <a
                                    href={attachment.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                  >
                                    Download
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="mt-6 flex space-x-3">
                          {quotation.status === 'draft' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSubmit(quotation.id)}
                                disabled={submittingId === quotation.id}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                              >
                                {submittingId === quotation.id ? 'Submitting...' : 'Submit'}
                              </button>
                              <Link
                                href={`/rfq/${quotation.rfq_id}/quote/edit/${quotation.id}`}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Edit
                              </Link>
                            </>
                          )}
                          <Link
                            href={`/rfq/${quotation.rfq_id}`}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            View RFQ
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
