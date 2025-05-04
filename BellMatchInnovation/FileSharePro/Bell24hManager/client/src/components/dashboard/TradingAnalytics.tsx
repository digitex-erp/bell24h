import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

export default function TradingAnalytics() {
  const [timeRange, setTimeRange] = useState("30");
  
  const { data, isLoading } = useQuery({
    queryKey: [`/api/analytics/trading?days=${timeRange}`],
  });

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
  };

  const industryColors: Record<string, string> = {
    manufacturing: "bg-primary-DEFAULT",
    electronics: "bg-secondary-DEFAULT",
    automotive: "bg-info",
    chemicals: "bg-warning",
    textiles: "bg-error"
  };

  // Show a placeholder chart when loading
  const PlaceholderChart = () => (
    <div className="w-full h-full flex items-center justify-center bg-neutral-50 rounded-lg border border-neutral-100">
      <div className="text-center p-4">
        <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="mt-2 text-sm text-neutral-500">Loading chart data...</p>
      </div>
    </div>
  );

  // Create industry breakdown from the data
  const renderIndustryBreakdown = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center justify-between py-2 border-t border-neutral-100">
          <div className="flex items-center">
            <Skeleton className="w-3 h-3 rounded-full mr-2" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-5 w-12" />
        </div>
      ));
    }

    if (!data?.industryBreakdown) {
      return (
        <div className="text-center py-4">
          <p className="text-neutral-500">No industry data available</p>
        </div>
      );
    }

    const industries = Object.entries(data.industryBreakdown);
    const total = industries.reduce((sum, [_, count]) => sum + (count as number), 0);

    return industries.map(([industry, count]) => {
      const percentage = total > 0 ? Math.round((count as number) / total * 100) : 0;
      
      return (
        <div key={industry} className="flex items-center justify-between py-2 border-t border-neutral-100">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${industryColors[industry] || 'bg-neutral-400'} mr-2`}></div>
            <span className="text-sm text-neutral-700">{industry.charAt(0).toUpperCase() + industry.slice(1)}</span>
          </div>
          <span className="text-sm font-medium">{percentage}%</span>
        </div>
      );
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold text-neutral-900">Trading Analytics</h2>
        <div>
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <h3 className="text-lg font-medium text-neutral-900 mb-4">RFQ Activity</h3>
            <div className="h-72 w-full">
              {isLoading ? (
                <PlaceholderChart />
              ) : data?.chartData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="rfqs" 
                      name="RFQs Created" 
                      fill="hsl(var(--primary))" 
                    />
                    <Bar 
                      dataKey="quotes" 
                      name="Quotes Received" 
                      fill="hsl(var(--secondary))" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-neutral-50 rounded-lg border border-neutral-100">
                  <div className="text-center p-4">
                    <p className="text-neutral-500">No chart data available</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5">
            <h3 className="text-lg font-medium text-neutral-900 mb-4">Industry Breakdown</h3>
            <div className="h-72 w-full">
              {isLoading ? (
                <PlaceholderChart />
              ) : data?.industryBreakdown ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-full h-full">
                    {/* Placeholder for pie chart - would use recharts PieChart in a real implementation */}
                    <div className="w-full h-full bg-neutral-50 rounded-lg border border-neutral-100 flex items-center justify-center">
                      <div className="text-center p-4">
                        <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                        </svg>
                        <p className="mt-2 text-sm text-neutral-500">Industry breakdown visualization</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-neutral-50 rounded-lg border border-neutral-100">
                  <div className="text-center p-4">
                    <p className="text-neutral-500">No industry data available</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4">
              {renderIndustryBreakdown()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
