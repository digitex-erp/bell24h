'use client'

import { useEffect, useState } from 'react'
import { ArrowUpIcon } from '@heroicons/react/24/outline'

interface UsageData {
  tier: string
  rfq_usage: {
    used: number
    limit: number
  }
  ai_matches_usage: {
    used: number
    limit: number
  }
  days_remaining: number
}

export default function UsageStats() {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsage()
  }, [])

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/v1/subscription/usage')
      if (!response.ok) throw new Error('Failed to fetch usage data')
      const data = await response.json()
      setUsage(data)
    } catch (error) {
      console.error('Error fetching usage:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse bg-white shadow rounded-lg p-6">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  if (!usage) return null

  const getRFQUsagePercentage = () => {
    if (usage.rfq_usage.limit === Infinity) return 0
    return (usage.rfq_usage.used / usage.rfq_usage.limit) * 100
  }

  const getAIUsagePercentage = () => {
    if (usage.ai_matches_usage.limit === Infinity) return 0
    return (usage.ai_matches_usage.used / usage.ai_matches_usage.limit) * 100
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Subscription Usage
        </h3>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          {usage.tier}
        </span>
      </div>

      <div className="space-y-6">
        {/* RFQ Usage */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-500">RFQ Usage</span>
            <span className="text-sm font-medium text-gray-900">
              {usage.rfq_usage.used} / {usage.rfq_usage.limit === Infinity ? 'Unlimited' : usage.rfq_usage.limit}
            </span>
          </div>
          <div className="relative">
            <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-50">
              <div
                style={{ width: `${getRFQUsagePercentage()}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
              ></div>
            </div>
          </div>
        </div>

        {/* AI Matches Usage */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-500">AI Matches</span>
            <span className="text-sm font-medium text-gray-900">
              {usage.ai_matches_usage.used} / {usage.ai_matches_usage.limit === Infinity ? 'Unlimited' : usage.ai_matches_usage.limit}
            </span>
          </div>
          <div className="relative">
            <div className="overflow-hidden h-2 text-xs flex rounded bg-purple-50">
              <div
                style={{ width: `${getAIUsagePercentage()}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
              ></div>
            </div>
          </div>
        </div>

        {/* Days Remaining */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">
              Days Remaining
            </span>
            <span className="text-sm font-medium text-gray-900">
              {usage.days_remaining}
            </span>
          </div>
        </div>

        {/* Upgrade Button */}
        {usage.tier !== 'ENTERPRISE' && (
          <div className="pt-4">
            <a
              href="/pricing"
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowUpIcon className="mr-2 h-4 w-4" />
              Upgrade Plan
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
