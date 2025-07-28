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

export default function EnterpriseAdminDashboard() {
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchAdminData()
    const interval = setInterval(fetchAdminData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchAdminData = async () => {
    try {
      const response = await fetch('/api/enterprise/admin/dashboard')
      const data = await response.json()
      
      if (data.status === 'success') {
        setPlatformStats(data.platform)
        setSystemHealth(data.system)
        setRevenueAnalytics(data.revenue)
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
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
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Transactions</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {platformStats?.totalTransactions.toLocaleString() || '0'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-orange-600" />
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
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">System Health</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-3">
                    <Database className={`w-6 h-6 ${getHealthStatusColor(systemHealth?.database || '')}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Database</p>
                      <p className={`text-sm ${getHealthStatusColor(systemHealth?.database || '')}`}>
                        {systemHealth?.database || 'Unknown'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Server className={`w-6 h-6 ${getHealthStatusColor(systemHealth?.api || '')}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">API Services</p>
                      <p className={`text-sm ${getHealthStatusColor(systemHealth?.api || '')}`}>
                        {systemHealth?.api || 'Unknown'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Globe className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Region</p>
                      <p className="text-sm text-gray-600">{systemHealth?.region || 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Analytics */}
            {revenueAnalytics && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Revenue Analytics</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(revenueAnalytics.total)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(revenueAnalytics.monthly)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Growth Rate</p>
                      <p className="text-2xl font-bold text-green-600">
                        +{revenueAnalytics.growth}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Top Categories</h4>
                    <div className="space-y-3">
                      {revenueAnalytics.topCategories.map((category, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{category.category}</span>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(category.revenue)}
                            </span>
                            <span className="text-sm text-green-600">+{category.growth}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">User Management</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Users className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{platformStats?.totalUsers || 0}</p>
                  <p className="text-sm text-gray-600">Total Users</p>
                </div>
                <div className="text-center">
                  <Building2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{platformStats?.totalSuppliers || 0}</p>
                  <p className="text-sm text-gray-600">Suppliers</p>
                </div>
                <div className="text-center">
                  <Users className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{platformStats?.totalBuyers || 0}</p>
                  <p className="text-sm text-gray-600">Buyers</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Health Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">System Performance</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Memory Usage</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Heap Used</span>
                        <span>{systemHealth?.memory ? Math.round(systemHealth.memory.heapUsed / 1024 / 1024) : 0} MB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Heap Total</span>
                        <span>{systemHealth?.memory ? Math.round(systemHealth.memory.heapTotal / 1024 / 1024) : 0} MB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>External</span>
                        <span>{systemHealth?.memory ? Math.round(systemHealth.memory.external / 1024 / 1024) : 0} MB</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">System Info</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uptime</span>
                        <span>{systemHealth ? formatUptime(systemHealth.uptime) : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Region</span>
                        <span>{systemHealth?.region || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Environment</span>
                        <span>{process.env.NODE_ENV || 'development'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Security & Compliance</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Security Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-700">Two-Factor Authentication</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-700">SSL/TLS Encryption</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-700">Data Encryption at Rest</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm text-gray-700">SSO Integration (In Progress)</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Compliance</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-700">GDPR Compliance</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-700">ISO 27001</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm text-gray-700">SOC 2 Type II (In Progress)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
