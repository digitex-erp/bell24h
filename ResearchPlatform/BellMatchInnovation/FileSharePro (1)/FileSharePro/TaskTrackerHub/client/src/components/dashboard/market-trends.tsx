import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { getMarketTrendData } from "@/lib/market-trends";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function MarketTrends() {
  const [selectedSector, setSelectedSector] = useState("Electronics");
  
  // Fetch market trend data from API
  const { data: marketTrends, isLoading, error } = useQuery({ 
    queryKey: ['/api/market-trends', { sector: selectedSector }],
  });
  
  // Generate market trends data if API call fails or is disabled
  const trendData = marketTrends?.data || getMarketTrendData(selectedSector);
  const insights = marketTrends?.insights || [
    { trend: "up", value: 12, description: "Semiconductor Shortage Easing: Expected 12% increase in supply over next quarter" },
    { trend: "down", value: 8, description: "Copper Prices Increasing: 8% price increase over last month" }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-dark-800">India Stock Market Trends</h2>
          <Select value={selectedSector} onValueChange={setSelectedSector}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Electronics">Electronics</SelectItem>
              <SelectItem value="Semiconductors">Semiconductors</SelectItem>
              <SelectItem value="Manufacturing">Manufacturing</SelectItem>
              <SelectItem value="Renewables">Renewables</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Chart */}
        <div className="relative h-64 p-4 border border-dark-200 rounded-lg bg-dark-50">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <p>Loading market data...</p>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center text-dark-400">
              <p>Error loading market data. Please try again later.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="current" 
                  stroke="#3B82F6" 
                  strokeWidth={2} 
                  dot={false} 
                  name="Current" 
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#F59E0B" 
                  strokeWidth={2} 
                  strokeDasharray="4 4" 
                  dot={false} 
                  name="Predicted" 
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Trend Insights */}
        <div className="mt-4 space-y-2">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-center p-2 rounded-md bg-dark-50">
              <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                insight.trend === "up" ? "bg-green-100" : "bg-red-100"
              }`}>
                {insight.trend === "up" ? (
                  <ArrowUp className={`w-4 h-4 ${insight.trend === "up" ? "text-green-600" : "text-red-600"}`} />
                ) : (
                  <ArrowDown className={`w-4 h-4 ${insight.trend === "up" ? "text-green-600" : "text-red-600"}`} />
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-dark-800">
                  {insight.description.split(":")[0]}
                </p>
                <p className="text-xs text-dark-500">
                  {insight.description.split(":")[1] || ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
