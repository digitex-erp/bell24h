"use client"
import React, { useEffect, useState } from 'react'
import ShapChart from '@/components/ShapChart'
import LimeExplanation from '@/components/LimeExplanation'

type ShapItem = { feature: string; importance: number; contribution: string }

export default function AIInsightsPage() {
  const [shap, setShap] = useState<ShapItem[]>([])
  const [lime, setLime] = useState<{ feature: string; text: string }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/v1/ai/explain-match/1', { method: 'POST' })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.detail || 'explain API error')
        // Expect data to be array of explanations {feature, importance, contribution}
        setShap(data)
        // Fake LIME for demo
        setLime(data.slice(0, 4).map((d: any) => ({ feature: d.feature, text: `${d.feature} contributed ${d.importance.toFixed(3)}` })))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">AI Insights (SHAP / LIME)</h2>
      {loading ? <p>Loading...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ShapChart items={shap} />
          <LimeExplanation explanations={lime} />
        </div>
      )}
    </div>
  )
}
