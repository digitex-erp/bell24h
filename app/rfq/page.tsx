'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function RFQListPage() {
  const [rfqs, setRfqs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchRfqs()
  }, [])

  const fetchRfqs = async () => {
    try {
      const response = await fetch('/api/rfq/list')
      if (response.ok) {
        const data = await response.json()
        setRfqs(data.rfqs || [])
      }
    } catch (error) {
      console.error('Failed to fetch RFQs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredRfqs = rfqs.filter((rfq: any) => {
    if (filter === 'all') return true
    return rfq.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading RFQs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">B</div>
                <div>
                  <div className="font-bold text-xl">Bell24h</div>
                  <div className="text-xs text-gray-600">Verified B2B Platform</div>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">Dashboard</Link>
                <Link href="/rfq" className="text-indigo-600 font-semibold">My RFQs</Link>
                <Link href="/rfq/new" className="text-gray-700 hover:text-indigo-600">New RFQ</Link>
                <Link href="#" className="text-gray-700 hover:text-indigo-600">Suppliers</Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/rfq/new" className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-emerald-600 text-white rounded-lg hover:from-indigo-700 hover:to-emerald-700">
                + New RFQ
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My RFQs</h1>
              <p className="text-xl text-gray-600">Manage your requests for quotations</p>
            </div>
            <Link
              href="/rfq/new"
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-emerald-600 text-white rounded-lg hover:from-indigo-700 hover:to-emerald-700 transition-colors"
            >
              + Create New RFQ
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {[
                { key: 'all', label: 'All RFQs', count: rfqs.length },
                { key: 'active', label: 'Active', count: rfqs.filter((r: any) => r.status === 'active').length },
                { key: 'completed', label: 'Completed', count: rfqs.filter((r: any) => r.status === 'completed').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === tab.key
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* RFQ List */}
          {filteredRfqs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'No RFQs yet' : `No ${filter} RFQs`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? 'Create your first RFQ to get started with Bell24h'
                  : `You don't have any ${filter} RFQs at the moment`
                }
              </p>
              <Link
                href="/rfq/new"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-emerald-600 text-white rounded-lg hover:from-indigo-700 hover:to-emerald-700"
              >
                Create Your First RFQ
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredRfqs.map((rfq: any) => (
                <div key={rfq.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{rfq.title}</h3>
                      <p className="text-gray-600 mb-3">{rfq.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {rfq.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                          </svg>
                          Qty: {rfq.quantity}
                        </span>
                        {rfq.budget && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            ₹{rfq.budget.toLocaleString()}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(rfq.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(rfq.status)}`}>
                        {rfq.status}
                      </span>
                      {rfq.quotes > 0 && (
                        <span className="px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                          {rfq.quotes} quotes
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Created {new Date(rfq.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/rfq/${rfq.id}`}
                        className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                      >
                        View Details
                      </Link>
                      {rfq.status === 'active' && (
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

