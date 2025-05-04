import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { formatCurrency } from "@/lib/utils";
import { 
  BarChart, 
  BarChart3, 
  Download, 
  FileText, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  Wallet, 
  AlertTriangle 
} from "lucide-react";

// This would use react-apexcharts or recharts in a real implementation
// Here we'll just simulate the visualization with styled divs
const BarChartVisualization = ({ data, height = 200 }: { data: any[], height?: number }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <div className="flex items-end h-full justify-between px-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className="w-12 bg-primary-500 rounded-t"
              style={{ height: `${(item.value / maxValue) * (height - 30)}px` }}
            ></div>
            <div className="text-xs mt-2 text-gray-500">{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LineChartVisualization = ({ data, height = 200 }: { data: any[], height?: number }) => {
  return (
    <div className="w-full bg-gradient-to-r from-primary-50 to-white" style={{ height: `${height}px` }}>
      <div className="h-full relative">
        <div className="absolute bottom-0 left-0 right-0 border-t border-primary-200"></div>
        <div className="absolute top-1/4 left-0 right-0 border-t border-dashed border-primary-100"></div>
        <div className="absolute top-2/4 left-0 right-0 border-t border-dashed border-primary-100"></div>
        <div className="absolute top-3/4 left-0 right-0 border-t border-dashed border-primary-100"></div>
        
        {/* This would be an actual SVG path in a real chart implementation */}
        <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-primary-100 to-transparent opacity-30"></div>
      </div>
    </div>
  );
};

export default function Analytics() {
  const [timePeriod, setTimePeriod] = useState("last30days");
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to?: Date;
  }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  
  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["/api/analytics/dashboard", timePeriod, dateRange],
  });

  // Sample data for visualizations
  const rfqTrendData = [
    { name: "Jan", value: 12 },
    { name: "Feb", value: 15 },
    { name: "Mar", value: 18 },
    { name: "Apr", value: 14 },
    { name: "May", value: 22 },
    { name: "Jun", value: 27 },
  ];

  const industryTrendData = [
    { name: "Electronics", value: 35 },
    { name: "Manufacturing", value: 25 },
    { name: "IT Services", value: 20 },
    { name: "Chemicals", value: 10 },
    { name: "Others", value: 10 },
  ];

  const marketMetrics = analyticsData?.marketMetrics || {
    totalRfqs: 152,
    avgResponseTime: "18h",
    avgResponsesPerRfq: 6.4,
    supplierGrowth: "12.4%",
    topCategory: "Electronics",
    topCategoryGrowth: "8.8%",
  };

  const supplierMetrics = analyticsData?.supplierMetrics || {
    totalSuppliers: 245,
    averageRiskScore: 82,
    highRiskSuppliers: 15,
    averageDeliveryTime: "4.5 days",
    onTimeDeliveryRate: "92%",
  };

  const handlePeriodChange = (value: string) => {
    setTimePeriod(value);
    
    // Update date range based on period selection
    const now = new Date();
    let from = new Date();
    
    if (value === "last7days") {
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (value === "last30days") {
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (value === "last90days") {
      from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (value === "thisYear") {
      from = new Date(now.getFullYear(), 0, 1);
    }
    
    setDateRange({ from, to: now });
  };

  return (
    <div className="px-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Analytics & Insights</h1>
          <p className="mt-1 text-sm text-gray-500">Get comprehensive insights into your B2B marketplace activities.</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-3">
          <div className="flex space-x-3">
            <Select value={timePeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7days">Last 7 days</SelectItem>
                <SelectItem value="last30days">Last 30 days</SelectItem>
                <SelectItem value="last90days">Last 90 days</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            
            {timePeriod === "custom" && (
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
              />
            )}
          </div>
          
          <Button variant="outline" className="inline-flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total RFQs</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketMetrics.totalRfqs}</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-green-600 font-medium">↑ 15.3%</span> vs previous period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketMetrics.avgResponseTime}</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-green-600 font-medium">↓ 8.2%</span> faster than previous period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average RFQ Value</CardTitle>
            <Wallet className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(24500)}</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-green-600 font-medium">↑ 5.4%</span> vs previous period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Supplier Risk Score</CardTitle>
            <AlertTriangle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supplierMetrics.averageRiskScore}</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-green-600 font-medium">↑ 3.1%</span> lower risk than previous
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="market">
        <TabsList className="mb-4">
          <TabsTrigger value="market">Market Trends</TabsTrigger>
          <TabsTrigger value="rfq">RFQ Analytics</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Analytics</TabsTrigger>
          <TabsTrigger value="financial">Financial Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="market">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Market Trends by Category</CardTitle>
                <CardDescription>
                  Analyze category performance over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LineChartVisualization data={[]} height={300} />
                <div className="flex justify-between mt-4">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-500">Top Category</div>
                    <div className="font-bold">{marketMetrics.topCategory}</div>
                    <div className="text-xs text-green-600">↑ {marketMetrics.topCategoryGrowth}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-500">Supplier Growth</div>
                    <div className="font-bold">{marketMetrics.supplierGrowth}</div>
                    <div className="text-xs text-green-600">↑ vs last period</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-500">Avg. Responses</div>
                    <div className="font-bold">{marketMetrics.avgResponsesPerRfq}</div>
                    <div className="text-xs text-green-600">↑ 12% vs last period</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Market Segmentation</CardTitle>
                <CardDescription>
                  Current distribution by industry
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="w-48 h-48 rounded-full bg-primary-50 border-8 border-primary-100 relative flex items-center justify-center">
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 border-t-8 border-r-8 border-primary-500 rounded-full" style={{ clipPath: "polygon(0 0, 100% 0, 100% 35%, 0 0)" }}></div>
                    <div className="absolute inset-0 border-t-8 border-r-8 border-secondary-500 rounded-full" style={{ clipPath: "polygon(100% 0, 100% 35%, 100% 60%, 0 0)" }}></div>
                    <div className="absolute inset-0 border-t-8 border-r-8 border-green-500 rounded-full" style={{ clipPath: "polygon(100% 60%, 100% 80%, 0 100%, 0 0)" }}></div>
                    <div className="absolute inset-0 border-t-8 border-r-8 border-blue-500 rounded-full" style={{ clipPath: "polygon(100% 80%, 100% 100%, 50% 100%, 0 100%, 0 0)" }}></div>
                  </div>
                  <div className="z-10 text-center">
                    <div className="text-xs font-medium text-gray-600">Total</div>
                    <div className="text-xl font-bold text-gray-900">100%</div>
                  </div>
                </div>
              </CardContent>
              <div className="px-6 pb-4">
                <div className="space-y-2">
                  {industryTrendData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ 
                            backgroundColor: index === 0 
                              ? "rgb(var(--primary-500))" 
                              : index === 1 
                                ? "rgb(var(--secondary-500))" 
                                : index === 2 
                                  ? "rgb(var(--success))" 
                                  : index === 3 
                                    ? "rgb(var(--chart-4))"
                                    : "rgb(var(--chart-5))"
                          }}
                        ></div>
                        <span className="text-sm text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
          
          <div className="mt-5">
            <Card>
              <CardHeader>
                <CardTitle>Indian Stock Market Trends Impacting B2B Trade</CardTitle>
                <CardDescription>
                  Key market indicators and their impact on procurement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left">Index</th>
                        <th className="px-4 py-2 text-left">Current Value</th>
                        <th className="px-4 py-2 text-left">Change</th>
                        <th className="px-4 py-2 text-left">% Change</th>
                        <th className="px-4 py-2 text-left">Impact on Procurement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="px-4 py-3 font-medium">NIFTY 50</td>
                        <td className="px-4 py-3">22,618.50</td>
                        <td className="px-4 py-3 text-green-600">+123.50</td>
                        <td className="px-4 py-3 text-green-600">+0.55%</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                              <div className="h-2 bg-green-500 rounded-full" style={{ width: "65%" }}></div>
                            </div>
                            <span>Positive</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium">BSE SENSEX</td>
                        <td className="px-4 py-3">74,572.30</td>
                        <td className="px-4 py-3 text-green-600">+354.20</td>
                        <td className="px-4 py-3 text-green-600">+0.48%</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                              <div className="h-2 bg-green-500 rounded-full" style={{ width: "60%" }}></div>
                            </div>
                            <span>Positive</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium">USD/INR</td>
                        <td className="px-4 py-3">82.75</td>
                        <td className="px-4 py-3 text-red-600">-0.15</td>
                        <td className="px-4 py-3 text-red-600">-0.18%</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                              <div className="h-2 bg-green-500 rounded-full" style={{ width: "70%" }}></div>
                            </div>
                            <span>Positive</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium">Crude Oil</td>
                        <td className="px-4 py-3">82.18</td>
                        <td className="px-4 py-3 text-red-600">-1.25</td>
                        <td className="px-4 py-3 text-red-600">-1.5%</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                              <div className="h-2 bg-green-500 rounded-full" style={{ width: "75%" }}></div>
                            </div>
                            <span>Very Positive</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rfq">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>RFQ Trend Analysis</CardTitle>
                  <CardDescription>
                    Monthly RFQ submissions and response rates
                  </CardDescription>
                </div>
                <Select defaultValue="volume">
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="volume">Volume</SelectItem>
                    <SelectItem value="value">Value</SelectItem>
                    <SelectItem value="response">Response Rate</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <BarChartVisualization data={rfqTrendData} height={300} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Response Metrics</CardTitle>
                <CardDescription>
                  Key performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-500">Avg. Response Time</span>
                    <span className="text-sm font-bold">{marketMetrics.avgResponseTime}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-primary-500 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-500">Avg. Responses per RFQ</span>
                    <span className="text-sm font-bold">{marketMetrics.avgResponsesPerRfq}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-secondary-500 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-500">RFQ Completion Rate</span>
                    <span className="text-sm font-bold">84%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: "84%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-500">Supplier Match Rate</span>
                    <span className="text-sm font-bold">78%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: "78%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card>
              <CardHeader>
                <CardTitle>Voice RFQ Analytics</CardTitle>
                <CardDescription>
                  Performance metrics for voice-based RFQs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-5">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 mb-1">Voice RFQ Usage</div>
                    <div className="text-2xl font-bold text-primary-600">32%</div>
                    <div className="text-xs text-green-600 mt-1">↑ 8% vs last period</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 mb-1">Avg. Transcription Time</div>
                    <div className="text-2xl font-bold text-primary-600">2.4s</div>
                    <div className="text-xs text-green-600 mt-1">↓ 0.3s vs last period</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 mb-1">Transcription Accuracy</div>
                    <div className="text-2xl font-bold text-primary-600">96%</div>
                    <div className="text-xs text-green-600 mt-1">↑ 2% vs last period</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 mb-1">Match Success Rate</div>
                    <div className="text-2xl font-bold text-primary-600">82%</div>
                    <div className="text-xs text-green-600 mt-1">↑ 5% vs last period</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Video RFQ Analytics</CardTitle>
                <CardDescription>
                  Performance metrics for video-based RFQs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-5">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 mb-1">Video RFQ Usage</div>
                    <div className="text-2xl font-bold text-primary-600">18%</div>
                    <div className="text-xs text-green-600 mt-1">↑ 12% vs last period</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 mb-1">Avg. Video Length</div>
                    <div className="text-2xl font-bold text-primary-600">1:45</div>
                    <div className="text-xs text-gray-500 mt-1">minutes</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 mb-1">Avg. Response Time</div>
                    <div className="text-2xl font-bold text-primary-600">14h</div>
                    <div className="text-xs text-green-600 mt-1">↓ 4h vs last period</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 mb-1">Match Success Rate</div>
                    <div className="text-2xl font-bold text-primary-600">94%</div>
                    <div className="text-xs text-green-600 mt-1">↑ 8% vs last period</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="suppliers">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Supplier Risk Distribution</CardTitle>
                <CardDescription>
                  Risk classification across your supplier network
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="flex items-center justify-center md:justify-start mb-4 md:mb-0">
                    <div className="relative h-48 w-48">
                      <div className="absolute inset-0 rounded-full border-8 border-gray-100"></div>
                      <div className="absolute inset-0 rounded-full border-8 border-green-500" style={{ clipPath: "polygon(50% 50%, 100% 50%, 100% 0, 50% 0, 50% 50%)" }}></div>
                      <div className="absolute inset-0 rounded-full border-8 border-yellow-500" style={{ clipPath: "polygon(50% 50%, 100% 50%, 100% 100%, 85% 100%, 50% 50%)" }}></div>
                      <div className="absolute inset-0 rounded-full border-8 border-red-500" style={{ clipPath: "polygon(50% 50%, 85% 100%, 0 100%, 0 0, 50% 0, 50% 50%)" }}></div>
                      
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-sm font-medium">Total</div>
                          <div className="text-lg font-bold">{supplierMetrics.totalSuppliers}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Low Risk (80+)</div>
                        <div className="text-xs text-gray-500">Excellent performance and stability</div>
                      </div>
                      <div className="text-lg font-bold">
                        {supplierMetrics.totalSuppliers - supplierMetrics.highRiskSuppliers - 38}
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-3"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Medium Risk (65-79)</div>
                        <div className="text-xs text-gray-500">Some performance concerns</div>
                      </div>
                      <div className="text-lg font-bold">38</div>
                    </div>
                    
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">High Risk (&lt;65)</div>
                        <div className="text-xs text-gray-500">Major performance issues</div>
                      </div>
                      <div className="text-lg font-bold">{supplierMetrics.highRiskSuppliers}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Supplier Metrics</CardTitle>
                <CardDescription>
                  Key performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-500">Avg. Risk Score</span>
                    <span className="text-sm font-bold">{supplierMetrics.averageRiskScore}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: `${supplierMetrics.averageRiskScore}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-500">On-Time Delivery</span>
                    <span className="text-sm font-bold">{supplierMetrics.onTimeDeliveryRate}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-primary-500 rounded-full" style={{ width: "92%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-500">Avg. Delivery Time</span>
                    <span className="text-sm font-bold">{supplierMetrics.averageDeliveryTime}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-secondary-500 rounded-full" style={{ width: "80%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-500">Compliance Score</span>
                    <span className="text-sm font-bold">86%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: "86%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-5">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Supplier Risk Analysis</CardTitle>
                <CardDescription>
                  Comprehensive risk assessment using our Aladin-inspired model
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left">Supplier</th>
                        <th className="px-4 py-2 text-left">Risk Score</th>
                        <th className="px-4 py-2 text-left">Financial Stability</th>
                        <th className="px-4 py-2 text-left">Delivery Performance</th>
                        <th className="px-4 py-2 text-left">Compliance</th>
                        <th className="px-4 py-2 text-left">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="px-4 py-3">
                          <div className="font-medium">TechSolutions Corp</div>
                          <div className="text-xs text-gray-500">Mumbai, India</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-800 font-medium text-sm">
                            92
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                              <div className="h-2 bg-green-500 rounded-full" style={{ width: "94%" }}></div>
                            </div>
                            <span>94%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                              <div className="h-2 bg-green-500 rounded-full" style={{ width: "98%" }}></div>
                            </div>
                            <span>98%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                              <div className="h-2 bg-green-500 rounded-full" style={{ width: "90%" }}></div>
                            </div>
                            <span>90%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-green-600">
                          ↑ Improving
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">
                          <div className="font-medium">GreenInnovate Ltd</div>
                          <div className="text-xs text-gray-500">Bengaluru, India</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-yellow-100 text-yellow-800 font-medium text-sm">
                            78
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                              <div className="h-2 bg-yellow-500 rounded-full" style={{ width: "72%" }}></div>
                            </div>
                            <span>72%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                              <div className="h-2 bg-green-500 rounded-full" style={{ width: "85%" }}></div>
                            </div>
                            <span>85%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                              <div className="h-2 bg-yellow-500 rounded-full" style={{ width: "76%" }}></div>
                            </div>
                            <span>76%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          → Stable
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">
                          <div className="font-medium">ChemCorp Industries</div>
                          <div className="text-xs text-gray-500">Hyderabad, India</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-100 text-red-800 font-medium text-sm">
                            64
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                              <div className="h-2 bg-yellow-500 rounded-full" style={{ width: "65%" }}></div>
                            </div>
                            <span>65%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                              <div className="h-2 bg-red-500 rounded-full" style={{ width: "72%" }}></div>
                            </div>
                            <span>72%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                              <div className="h-2 bg-red-500 rounded-full" style={{ width: "58%" }}></div>
                            </div>
                            <span>58%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-red-600">
                          ↓ Declining
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="text-sm">
                    View Complete Supplier Risk Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="financial">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Transaction Volume</CardTitle>
                <CardDescription>
                  Monthly transaction volume and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LineChartVisualization data={[]} height={300} />
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-500">Total Transactions</div>
                    <div className="text-lg font-bold">{formatCurrency(1250000)}</div>
                    <div className="text-xs text-green-600">↑ 12.5% vs last period</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-500">Avg. Transaction</div>
                    <div className="text-lg font-bold">{formatCurrency(24500)}</div>
                    <div className="text-xs text-green-600">↑ 5.4% vs last period</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-500">Escrow Volume</div>
                    <div className="text-lg font-bold">{formatCurrency(850000)}</div>
                    <div className="text-xs text-green-600">↑ 18.2% vs last period</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>KredX Invoice Financing</CardTitle>
                <CardDescription>
                  Invoice discounting metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg mb-4">
                  <div className="text-sm font-medium text-gray-500 mb-1">Total Financed</div>
                  <div className="text-2xl font-bold text-primary-600">{formatCurrency(450000)}</div>
                  <div className="text-xs text-green-600 mt-1">↑ 32% vs last period</div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-500">Invoices Submitted</span>
                    <span className="text-sm font-bold">124</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-primary-500 rounded-full" style={{ width: "80%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-500">Approval Rate</span>
                    <span className="text-sm font-bold">92%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: "92%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-500">Avg. Discount Rate</span>
                    <span className="text-sm font-bold">0.52%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-secondary-500 rounded-full" style={{ width: "52%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-500">Avg. Processing Time</span>
                    <span className="text-sm font-bold">4.2 hours</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card>
              <CardHeader>
                <CardTitle>RazorpayX Escrow Metrics</CardTitle>
                <CardDescription>
                  Escrow transaction analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-5">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 mb-1">Active Escrows</div>
                    <div className="text-2xl font-bold text-primary-600">48</div>
                    <div className="text-xs text-green-600 mt-1">↑ 12% vs last period</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 mb-1">Total Value</div>
                    <div className="text-2xl font-bold text-primary-600">{formatCurrency(850000)}</div>
                    <div className="text-xs text-green-600 mt-1">↑ 18.2% vs last period</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 mb-1">Avg. Escrow Duration</div>
                    <div className="text-2xl font-bold text-primary-600">14.5</div>
                    <div className="text-xs text-gray-500 mt-1">days</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 mb-1">Dispute Rate</div>
                    <div className="text-2xl font-bold text-primary-600">1.2%</div>
                    <div className="text-xs text-green-600 mt-1">↓ 0.5% vs last period</div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Escrow Status Distribution</div>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 h-8 rounded-l-md">
                      <div className="h-8 bg-green-500 rounded-l-md" style={{ width: "65%" }}></div>
                    </div>
                    <div className="flex-1 bg-gray-200 h-8">
                      <div className="h-8 bg-yellow-500" style={{ width: "20%" }}></div>
                    </div>
                    <div className="flex-1 bg-gray-200 h-8 rounded-r-md">
                      <div className="h-8 bg-blue-500" style={{ width: "15%" }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <div>Active (65%)</div>
                    <div>Milestone (20%)</div>
                    <div>Completed (15%)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Blockchain Transaction Metrics</CardTitle>
                <CardDescription>
                  Polygon network activity for secure transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-5">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 mb-1">Total Transactions</div>
                    <div className="text-2xl font-bold text-primary-600">286</div>
                    <div className="text-xs text-green-600 mt-1">↑ 35% vs last period</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 mb-1">Avg. Gas Cost</div>
                    <div className="text-2xl font-bold text-primary-600">0.025</div>
                    <div className="text-xs text-gray-500 mt-1">MATIC</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 mb-1">Smart Contract Calls</div>
                    <div className="text-2xl font-bold text-primary-600">214</div>
                    <div className="text-xs text-green-600 mt-1">↑ 28% vs last period</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 mb-1">Avg. Confirmation Time</div>
                    <div className="text-2xl font-bold text-primary-600">2.4</div>
                    <div className="text-xs text-gray-500 mt-1">seconds</div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Transaction Types</div>
                  <div className="flex items-center h-8 bg-gray-200 rounded-md overflow-hidden">
                    <div className="h-full bg-primary-500" style={{ width: "45%" }}></div>
                    <div className="h-full bg-secondary-500" style={{ width: "30%" }}></div>
                    <div className="h-full bg-green-500" style={{ width: "15%" }}></div>
                    <div className="h-full bg-blue-500" style={{ width: "10%" }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <div>RFQ (45%)</div>
                    <div>Escrow (30%)</div>
                    <div>Payment (15%)</div>
                    <div>Other (10%)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
