import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ArrowRight, 
  ChevronUp, 
  ChevronDown,
  PieChart as PieChartIcon,
  BarChart2,
  Activity
} from "lucide-react";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30");
  const [activeTab, setActiveTab] = useState("trading");
  
  // Fetch analytics data
  const { data, isLoading } = useQuery({
    queryKey: [`/api/analytics/trading?days=${timeRange}`],
  });

  // Color mapping for industries in charts
  const COLORS = ['#1976D2', '#FF6E40', '#4CAF50', '#F44336', '#9C27B0'];
  
  // Create pie chart data from industry breakdown
  const getPieChartData = () => {
    if (!data?.industryBreakdown) return [];
    
    return Object.entries(data.industryBreakdown).map(([name, value], index) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  };

  // Format numbers with appropriate suffixes (k, M)
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  // Get trend indicator with icon
  const getTrendIndicator = (value: number) => {
    if (value > 0) {
      return (
        <span className="text-success font-medium flex items-center">
          <ChevronUp className="h-4 w-4 mr-1" />
          {Math.abs(value)}%
        </span>
      );
    }
    if (value < 0) {
      return (
        <span className="text-error font-medium flex items-center">
          <ChevronDown className="h-4 w-4 mr-1" />
          {Math.abs(value)}%
        </span>
      );
    }
    return <span className="text-neutral-500">0%</span>;
  };

  // Placeholder metrics for demonstration
  const metrics = [
    {
      title: "Total RFQs",
      value: isLoading ? "-" : data?.summary?.rfqCount || 0,
      change: 12.3,
      icon: <BarChart2 className="h-6 w-6 text-primary-DEFAULT" />,
    },
    {
      title: "Quote Response Rate",
      value: isLoading ? "-" : data?.summary?.responseRate + "%" || "0%",
      change: 5.7,
      icon: <Activity className="h-6 w-6 text-secondary-DEFAULT" />,
    },
    {
      title: "Avg. Response Time",
      value: isLoading ? "-" : data?.summary?.avgResponseTime + "h" || "0h",
      change: -8.2,
      icon: <Clock className="h-6 w-6 text-info" />
    },
    {
      title: "Industry Engagement",
      value: Object.keys(data?.industryBreakdown || {}).length || 0,
      change: 0,
      icon: <PieChartIcon className="h-6 w-6 text-warning" />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 md:ml-64 min-h-screen">
        <Header title="Analytics" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="trading" className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trading Analytics
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="suppliers" className="flex items-center">
                  <PieChartIcon className="h-4 w-4 mr-2" />
                  Supplier Insights
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="ml-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
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
          
          {/* Analytics Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-neutral-500">{metric.title}</p>
                      <h3 className="text-2xl font-bold mt-1">{metric.value}</h3>
                    </div>
                    <div className="p-3 rounded-full bg-neutral-100">
                      {metric.icon}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    {getTrendIndicator(metric.change)}
                    <span className="text-neutral-500 ml-2">from previous period</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <TabsContent value="trading" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* RFQ Activity Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>RFQ Activity</CardTitle>
                  <CardDescription>
                    Visualization of RFQ submissions and quote responses over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Skeleton className="h-full w-full" />
                    </div>
                  ) : data?.chartData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
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
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-neutral-500">No data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Industry Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Industry Breakdown</CardTitle>
                  <CardDescription>
                    Distribution of RFQs by industry
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Skeleton className="h-full w-full rounded-full" />
                    </div>
                  ) : data?.industryBreakdown ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getPieChartData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {getPieChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-neutral-500">No data available</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="w-full space-y-2">
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Skeleton className="w-3 h-3 rounded-full mr-2" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <Skeleton className="h-4 w-12" />
                        </div>
                      ))
                    ) : data?.industryBreakdown ? (
                      Object.entries(data.industryBreakdown).map(([industry, count], index) => (
                        <div key={industry} className="flex justify-between items-center text-sm">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span>{industry.charAt(0).toUpperCase() + industry.slice(1)}</span>
                          </div>
                          <span className="font-medium">{count as number}</span>
                        </div>
                      ))
                    ) : null}
                  </div>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  This section will show detailed performance analytics
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Performance Analytics</h3>
                  <p className="text-neutral-500 max-w-md">
                    This section is under development. Performance analytics will provide 
                    insights into your procurement efficiency and cost savings.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="suppliers" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Supplier Insights</CardTitle>
                <CardDescription>
                  This section will show analytics about your supplier relationships
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <PieChartIcon className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Supplier Analytics</h3>
                  <p className="text-neutral-500 max-w-md">
                    This section is under development. Supplier insights will show 
                    data about response times, quality ratings, and pricing trends.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </main>
    </div>
  );
}
