'use client'

import { useEffect, useState } from 'react'
import { getMatchingSuppliers, SupplierMatch } from '@/lib/api/supplier'
import { sendRFQToSuppliers } from '@/lib/api/rfq'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RFQMatchesPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [matches, setMatches] = useState<SupplierMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([])
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadMatches()
  }, [params.id])

  const loadMatches = async () => {
    try {
      const data = await getMatchingSuppliers(parseInt(params.id))
      setMatches(data)
    } catch (err) {
      console.error('Error loading matches:', err)
      setError('Failed to load matching suppliers')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSupplier = (supplierId: number) => {
    setSelectedSuppliers(prev => {
      if (prev.includes(supplierId)) {
        return prev.filter(id => id !== supplierId)
      } else {
        return [...prev, supplierId]
      }
    })
  }

  const handleSendRFQ = async () => {
    if (selectedSuppliers.length === 0) {
      setError('Please select at least one supplier')
      return
    }

    try {
      setSending(true)
      setError(null)
      await sendRFQToSuppliers(parseInt(params.id), selectedSuppliers)
      router.push(`/rfq/${params.id}/quotations`)
    } catch (err) {
      console.error('Error sending RFQ:', err)
      setError('Failed to send RFQ to selected suppliers')
    } finally {
      setSending(false)
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
            <h1 className="text-2xl font-semibold text-gray-900">Matching Suppliers</h1>
            <p className="mt-2 text-sm text-gray-700">
              Found {matches.length} suppliers that match your requirements
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link
              href={`/rfq/${params.id}`}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              Back to RFQ
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
                {matches.length === 0 ? (
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
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No matches found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your RFQ requirements to find more suppliers.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white">
                    {matches.map(({ supplier, score, category_match, subcategory_match }) => (
                      <div key={supplier.id} className="border-b border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedSuppliers.includes(supplier.id)}
                              onChange={() => handleToggleSupplier(supplier.id)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <h3 className="ml-3 text-lg font-medium text-gray-900">
                              {supplier.company_name}
                            </h3>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Match Score: {Math.round(score * 100)}%
                            </span>
                            {category_match && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Category Match
                              </span>
                            )}
                            {subcategory_match && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Subcategory Match
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          <p>{supplier.description}</p>
                        </div>
                        <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Categories</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {supplier.categories.join(', ')}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Location</dt>
                            <dd className="mt-1 text-sm text-gray-900">{supplier.location}</dd>
                          </div>
                          {supplier.certifications.length > 0 && (
                            <div className="sm:col-span-2">
                              <dt className="text-sm font-medium text-gray-500">Certifications</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {supplier.certifications.join(', ')}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    ))}

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          {selectedSuppliers.length} supplier{selectedSuppliers.length !== 1 ? 's' : ''} selected
                        </div>
                        <button
                          type="button"
                          onClick={handleSendRFQ}
                          disabled={sending || selectedSuppliers.length === 0}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                          {sending ? 'Sending...' : 'Send RFQ to Selected Suppliers'}
                        </button>
                      </div>
                    </div>
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
