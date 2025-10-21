'use client'

import { useState, useEffect } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { ArrowTrendingUpIcon, BanknotesIcon, ClockIcon } from '@heroicons/react/24/outline'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface WalletMetrics {
  total_transactions: number
  total_volume: number
  average_transaction: number
  monthly_trends: {
    month: string
    deposits: number
    withdrawals: number
    fees: number
  }[]
  transaction_types: {
    type: string
    count: number
    volume: number
  }[]
}

interface InvoiceMetrics {
  total_invoices_discounted: number
  total_value_discounted: number
  average_discount_rate: number
  total_savings: number
  monthly_trends: {
    month: string
    value: number
    count: number
  }[]
  buyer_wise_analysis: {
    buyer: string
    invoices: number
    value: number
  }[]
}

export default function WalletAnalytics() {
  const [walletMetrics, setWalletMetrics] = useState<WalletMetrics | null>(null)
  const [invoiceMetrics, setInvoiceMetrics] = useState<InvoiceMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const [walletResponse, invoiceResponse] = await Promise.all([
        fetch('/api/v1/wallet/analytics'),
        fetch('/api/v1/invoice-discounting/analytics')
      ])

      if (!walletResponse.ok || !invoiceResponse.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const walletData = await walletResponse.json()
      const invoiceData = await invoiceResponse.json()

      setWalletMetrics(walletData)
      setInvoiceMetrics(invoiceData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse p-6">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3 mt-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  const monthlyTrendsConfig = {
    labels: walletMetrics?.monthly_trends.map(t => t.month),
    datasets: [
      {
        label: 'Deposits',
        data: walletMetrics?.monthly_trends.map(t => t.deposits),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
      {
        label: 'Withdrawals',
        data: walletMetrics?.monthly_trends.map(t => t.withdrawals),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
      }
    ]
  }

  const invoiceTrendsConfig = {
    labels: invoiceMetrics?.monthly_trends.map(t => t.month),
    datasets: [
      {
        label: 'Invoice Value Discounted',
        data: invoiceMetrics?.monthly_trends.map(t => t.value),
        backgroundColor: 'rgba(147, 51, 234, 0.5)',
      }
    ]
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">
        Financial Analytics
      </h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Wallet Volume */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Transaction Volume
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      ₹{walletMetrics?.total_volume.toLocaleString()}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices Discounted */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Invoices Discounted
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {invoiceMetrics?.total_invoices_discounted}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Average Discount Rate */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Average Discount Rate
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {invoiceMetrics?.average_discount_rate.toFixed(2)}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Monthly Wallet Trends */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Monthly Transaction Trends
          </h3>
          <div className="h-80">
            <Line
              data={monthlyTrendsConfig}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `₹${value}`
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Invoice Discounting Trends */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Invoice Discounting Trends
          </h3>
          <div className="h-80">
            <Bar
              data={invoiceTrendsConfig}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `₹${value}`
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Buyer Analysis */}
      {invoiceMetrics?.buyer_wise_analysis && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Buyer-wise Analysis
          </h3>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
              {invoiceMetrics.buyer_wise_analysis.map((buyer) => (
                <li key={buyer.buyer}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {buyer.buyer}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {buyer.invoices} invoices
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Total Value: ₹{buyer.value.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
