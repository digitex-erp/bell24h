'use client'

import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <AnalyticsDashboard />
        </div>
      </div>
    </div>
  )
}
