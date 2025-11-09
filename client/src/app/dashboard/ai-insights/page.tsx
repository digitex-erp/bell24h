"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AIInsightsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/v1/ai/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price: 125000,
        lead_time: 7,
        supplier_rating: 4.8,
        distance_km: 89,
        past_on_time_rate: 0.97
      })
    })
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || "Failed to load");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-2xl text-white">Loading AI Insights...</div>;
  if (error) return <div className="p-10 text-red-400">Error: {error}</div>;
  if (!data) return <div className="p-10 text-red-400">Failed to load</div>;

  const chartData = Object.entries(data.feature_importance || {})
    .map(([k, v]: [string, number]) => ({
      name: k.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
      value: Math.abs(v),
      raw: v
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
        AI Supplier Match Insights
      </h1>
      <p className="text-xl text-cyan-300 mb-10">Live SHAP Explanation • RFQ #1001</p>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-gray-900 rounded-2xl p-8 border border-cyan-500/50">
          <h2 className="text-3xl font-bold mb-6">Top Decision Drivers</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} tick={{ fill: "#ccc" }} />
              <YAxis tick={{ fill: "#ccc" }} />
              <Tooltip contentStyle={{ background: "#111", border: "1px solid #444" }} />
              <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 border border-purple-500/50">
          <h2 className="text-3xl font-bold mb-6">Interactive Force Plot</h2>
          {data.shap_plots?.force ? (
            <div 
              dangerouslySetInnerHTML={{ __html: data.shap_plots.force }}
              className="bg-white rounded-xl overflow-hidden"
            />
          ) : (
            <p className="text-yellow-400">Force plot unavailable (fallback mode)</p>
          )}
        </div>
      </div>

      {data.shap_plots?.waterfall && (
        <div className="mt-8 bg-gray-900 rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-6">Prediction Breakdown</h2>
          <img src={data.shap_plots.waterfall} alt="Waterfall" className="w-full rounded-xl shadow-2xl" />
        </div>
      )}

      {/* LIME Text Explanations */}
      <div className="mt-8 bg-gray-900 rounded-2xl p-8 border border-green-500/50">
        <h2 className="text-3xl font-bold mb-6">LIME Explanations</h2>
        <div className="space-y-4">
          {Object.entries(data.feature_importance || {})
            .sort(([, a]: [string, number], [, b]: [string, number]) => Math.abs(b) - Math.abs(a))
            .slice(0, 5)
            .map(([feature, importance]: [string, number]) => {
              const featureName = feature.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
              const isPositive = importance > 0;
              const explanation = isPositive
                ? `This feature increases the match score by ${Math.abs(importance).toFixed(3)}. Higher values indicate better supplier compatibility.`
                : `This feature decreases the match score by ${Math.abs(importance).toFixed(3)}. Consider optimizing this aspect for better matches.`;
              
              return (
                <div key={feature} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{featureName}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isPositive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}>
                      {isPositive ? "+" : "-"}{Math.abs(importance).toFixed(3)}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{explanation}</p>
                </div>
              );
            })}
        </div>
      </div>

      <div className="mt-10 text-sm text-gray-500">
        Model Status: <span className={data.model_used ? "text-green-400" : "text-yellow-400"}>
          {data.model_used ? "LIVE ML MODEL" : "FALLBACK MODE"}
        </span>
      </div>
    </div>
  );
}