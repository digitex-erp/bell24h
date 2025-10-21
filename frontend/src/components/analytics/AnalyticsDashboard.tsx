import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface AnalyticsData {
  rfqMetrics: {
    total: number
    success_rate: number
    avg_response_time: number
    active: number
  }
  supplierMetrics: {
    total: number
    avg_risk_score: number
    top_categories: { name: string; count: number }[]
    performance: number[]
  }
  marketTrends: {
    dates: string[]
    values: number[]
    trend: 'up' | 'down'
  }
  categoryDistribution: {
    labels: string[]
    data: number[]
  }
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('30d')

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeframe])

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/v1/analytics/dashboard?timeframe=${timeframe}`)
      const data = await response.json()
      setData(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const marketTrendOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Market Trends',
      },
    },
  }

  const marketTrendData = {
    labels: data.marketTrends.dates,
    datasets: [
      {
        label: 'Market Value',
        data: data.marketTrends.values,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  }

  const categoryDistributionData = {
    labels: data.categoryDistribution.labels,
    datasets: [
      {
        data: data.categoryDistribution.data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
      },
    ],
  }

  const supplierPerformanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Supplier Performance',
        data: data.supplierMetrics.performance,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
          <div className="mt-4">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="mt-1 block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total RFQs</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{data.rfqMetrics.total}</p>
            <p className="mt-2 text-sm text-gray-500">
              {data.rfqMetrics.active} active
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {data.rfqMetrics.success_rate}%
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Avg response time: {data.rfqMetrics.avg_response_time}h
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Suppliers</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {data.supplierMetrics.total}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Avg risk score: {data.supplierMetrics.avg_risk_score}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Market Trend</h3>
            <div className="mt-2 flex items-center">
              {data.marketTrends.trend === 'up' ? (
                <ArrowUpIcon className="h-8 w-8 text-green-500" />
              ) : (
                <ArrowDownIcon className="h-8 w-8 text-red-500" />
              )}
              <span className="ml-2 text-2xl font-semibold text-gray-900">
                {data.marketTrends.trend === 'up' ? '+' : '-'}
                {Math.abs(
                  ((data.marketTrends.values[data.marketTrends.values.length - 1] -
                    data.marketTrends.values[0]) /
                    data.marketTrends.values[0]) *
                    100
                ).toFixed(1)}
                %
              </span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <Line options={marketTrendOptions} data={marketTrendData} />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <Bar
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Supplier Performance',
                  },
                },
              }}
              data={supplierPerformanceData}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <Doughnut
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Category Distribution',
                  },
                },
              }}
              data={categoryDistributionData}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Categories</h3>
            <div className="space-y-4">
              {data.supplierMetrics.top_categories.map((category, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-full">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {category.name}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {category.count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{
                          width: `${(category.count / data.supplierMetrics.total) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
