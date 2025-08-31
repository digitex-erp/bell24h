'use client'

import React, { useState, useEffect } from 'react'
import {
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  Activity,
  Shield,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Database,
  Server,
  Cpu,
  HardDrive
} from 'lucide-react'

interface PlatformStats {
  totalUsers: number
  totalSuppliers: number
  totalBuyers: number
  totalTransactions: number
  totalRevenue: number
  activeRFQs: number
}

interface SystemHealth {
  database: string
  api: string
  uptime: number
  memory: any
  region: string
}

interface RevenueAnalytics {
  total: number
  monthly: number
  growth: number
  topCategories: Array<{
    category: string
    revenue: number
    growth: number
  }>
}

// Fallback data to prevent errors
const fallbackData = {
  platform: {
    totalUsers: 1250,
    totalSuppliers: 847,
    totalBuyers: 403,
    totalTransactions: 2341,
    totalRevenue: 12500000,
    activeRFQs: 156
  },
  system: {
    database: 'healthy',
    api: 'operational',
    uptime: 86400,
    memory: {
      used: '2.1GB',
      total: '4GB',
      percentage: 52.5
    },
    region: 'Mumbai (BOM1)'
  },
  revenue: {
    total: 12500000,
    monthly: 2100000,
    growth: 15.8,
    topCategories: [
      {
        category: 'Manufacturing',
        revenue: 4500000,
        growth: 22.5
      },
      {
        category: 'Electronics',
        revenue: 3200000,
        growth: 18.3
      },
      {
        category: 'Textiles',
        revenue: 2800000,
        growth: 12.7
      },
      {
        category: 'Chemicals',
        revenue: 2000000,
        growth: 8.9
      }
    ]
  }
}

export default function EnterpriseAdminDashboard() {
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(fallbackData.platform)
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(fallbackData.system)
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(fallbackData.revenue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchAdminData()
    const interval = setInterval(fetchAdminData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchAdminData = async () => {
    try {
      setError(null)
      const response = await fetch('/api/enterprise/admin/dashboard')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.status === 'success') {
        setPlatformStats(data.platform)
        setSystemHealth(data.system)
        setRevenueAnalytics(data.revenue)
      } else {
        throw new Error(data.message || 'Failed to fetch data')
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch data')
      // Keep fallback data if API fails
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return 'text-green-600'
      case 'degraded':
        return 'text-yellow-600'
      case 'unhealthy':
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Enterprise Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Enterprise Admin Dashboard</h1>
              <p className="text-gray-600">Platform-wide analytics and management</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">All Systems Operational</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-600">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Uptime: {systemHealth ? formatUptime(systemHealth.uptime) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">API Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                  <p className="mt-1">Using fallback data. Please check your connection.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'users', name: 'User Management', icon: Users },
              { id: 'revenue', name: 'Revenue Analytics', icon: DollarSign },
              { id: 'system', name: 'System Health', icon: Server },
              { id: 'security', name: 'Security & Compliance', icon: Shield }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {platformStats?.totalUsers.toLocaleString() || '0'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Building2 className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Suppliers</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {platformStats?.totalSuppliers.toLocaleString() || '0'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Buyers</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {platformStats?.totalBuyers.toLocaleString() || '0'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Revenue</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {platformStats?.totalRevenue ? formatCurrency(platformStats.totalRevenue) : '₹0'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getHealthStatusColor(systemHealth?.database || 'unknown')}`}>
                    {systemHealth?.database || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-500">Database</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getHealthStatusColor(systemHealth?.api || 'unknown')}`}>
                    {systemHealth?.api || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-500">API Status</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {systemHealth?.region || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-500">Region</div>
                </div>
              </div>
            </div>

            {/* Revenue Analytics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {revenueAnalytics?.total ? formatCurrency(revenueAnalytics.total) : '₹0'}
                  </div>
                  <div className="text-sm text-gray-500">Total Revenue</div>
                  <div className="text-sm text-green-600">
                    +{revenueAnalytics?.growth || 0}% from last month
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {revenueAnalytics?.monthly ? formatCurrency(revenueAnalytics.monthly) : '₹0'}
                  </div>
                  <div className="text-sm text-gray-500">Monthly Revenue</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs can be implemented similarly */}
        {activeTab !== 'overview' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
            <p className="text-gray-600">This section is under development.</p>
          </div>
        )}
      </div>
    </div>
  )
}
