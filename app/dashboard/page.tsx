'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [rfqs, setRfqs] = useState([])
  const [stats, setStats] = useState({
    totalRfqs: 0,
    activeRfqs: 0,
    completedRfqs: 0,
    totalQuotes: 0
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      // Fetch user's RFQs and stats
      fetchRfqs()
      fetchStats()
    }
  }, [session])

  const fetchRfqs = async () => {
    try {
      const response = await fetch('/api/rfq/list')
      if (response.ok) {
        const data = await response.json()
        setRfqs(data.rfqs || [])
      }
    } catch (error) {
      console.error('Failed to fetch RFQs:', error)
    }
  }

  const fetchStats = async () => {
    // Mock stats for now
    setStats({
      totalRfqs: 12,
      activeRfqs: 3,
      completedRfqs: 9,
      totalQuotes: 36
    })
  }

  if (status === 'loading') {
    return (
      <div className="page-container">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="page-container">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">B</div>
                <div>
                  <div className="font-bold text-xl">Bell24h</div>
                  <div className="text-xs text-neutral-600">Verified B2B Platform</div>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <Link href="/dashboard" className="text-indigo-600 font-semibold">Dashboard</Link>
                <Link href="/rfq" className="text-neutral-700 hover:text-primary-600">My RFQs</Link>
                <Link href="/rfq/new" className="text-neutral-700 hover:text-primary-600">New RFQ</Link>
                <Link href="#" className="text-neutral-700 hover:text-primary-600">Suppliers</Link>
                <Link href="#" className="text-neutral-700 hover:text-primary-600">Wallet</Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-neutral-700">Welcome, {session.user?.name}</span>
              <button className="px-4 py-2 text-neutral-700 hover:text-primary-600">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="page-content">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Welcome back!</h1>
          <p className="page-subtitle">Here's what's happening with your RFQs today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Total RFQs</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.totalRfqs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Active RFQs</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.activeRfqs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Completed</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.completedRfqs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Total Quotes</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.totalQuotes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="feature-title text-neutral-900 mb-4">Quick Actions</h3>
            <div className="space-y-4">
              <Link href="/rfq/new" className="flex items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold mr-4">+</div>
                <div>
                  <p className="font-semibold text-neutral-900">Create New RFQ</p>
                  <p className="text-sm text-neutral-600">Post a request for quotation</p>
                </div>
              </Link>
              <Link href="/rfq" className="flex items-center p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center text-white font-bold mr-4">📋</div>
                <div>
                  <p className="font-semibold text-neutral-900">View My RFQs</p>
                  <p className="text-sm text-neutral-600">Manage your requests</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="feature-title text-neutral-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">New quote received</p>
                  <p className="text-xs text-neutral-600">Steel Pipes RFQ - 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">RFQ published</p>
                  <p className="text-xs text-neutral-600">Textile Materials - 1 day ago</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">Payment processed</p>
                  <p className="text-xs text-neutral-600">Electronics order - 3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent RFQs */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-neutral-200">
            <h3 className="feature-title text-neutral-900">Recent RFQs</h3>
          </div>
          <div className="p-6">
            {rfqs.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-neutral-900 mb-2">No RFQs yet</h4>
                <p className="feature-description">Create your first RFQ to get started with Bell24h</p>
                <Link href="/rfq/new" className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-primary-700 text-white rounded-lg">
                  Create RFQ
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {rfqs.map((rfq: any) => (
                  <div key={rfq.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-neutral-900">{rfq.title}</h4>
                      <p className="text-sm text-neutral-600">{rfq.description}</p>
                      <p className="text-xs text-neutral-500">Created {new Date(rfq.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${rfq.status === 'active' ? 'bg-green-100 text-green-800' :
                          rfq.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-neutral-100 text-neutral-800'
                        }`}>
                        {rfq.status}
                      </span>
                      <Link href={`/rfq/${rfq.id}`} className="text-indigo-600 hover:text-indigo-800 text-sm">
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
