import { useState, useEffect } from "react";
import { User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Clock, Download, BarChart2, PieChart as PieChartIcon, LineChart as LineChartIcon, Filter } from "lucide-react";

interface AnalyticsProps {
  user: User;
}

// Mock data types
interface MarketTrend {
  date: string;
  price: number;
  change: number;
  category: string;
}

interface CategoryDistribution {
  name: string;
  value: number;
  color: string;
}

interface RfqPerformance {
  month: string;
  rfqsCreated: number;
  quotesReceived: number;
}

interface SupplierPerformance {
  supplier: string;
  responseTime: number;
  quoteAcceptanceRate: number;
  onTimeDelivery: number;
}

export default function Analytics({ user }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "90days" | "1year">("30days");
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<CategoryDistribution[]>([]);
  const [rfqPerformance, setRfqPerformance] = useState<RfqPerformance[]>([]);
  const [supplierPerformance, setSupplierPerformance] = useState<SupplierPerformance[]>([]);
  
  // Fetch market data from API
  const { data: marketData } = useQuery({
    queryKey: ["/api/market-data"],
  });
  
  // Initialize data - would come from API in real implementation
  useEffect(() => {
    // Generate mock market trends
    const trends: MarketTrend[] = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      trends.push({
        date: date.toISOString().split('T')[0],
        price: 100 + Math.sin(i / 5) * 20 + Math.random() * 5,
        change: Math.sin(i / 5) * 2 + Math.random() * 0.5,
        category: "Electronics"
      });
    }
    
    setMarketTrends(trends);
    
    // Mock category distribution
    setCategoryDistribution([
      { name: "Electronics", value: 35, color: "#3B82F6" },
      { name: "Metals", value: 25, color: "#10B981" },
      { name: "Chemicals", value: 15, color: "#F59E0B" },
      { name: "Packaging", value: 15, color: "#6366F1" },
      { name: "Others", value: 10, color: "#EC4899" }
    ]);
    
    // Mock RFQ performance
    setRfqPerformance([
      { month: "Jan", rfqsCreated: 12, quotesReceived: 35 },
      { month: "Feb", rfqsCreated: 19, quotesReceived: 52 },
      { month: "Mar", rfqsCreated: 15, quotesReceived: 41 },
      { month: "Apr", rfqsCreated: 21, quotesReceived: 59 },
      { month: "May", rfqsCreated: 18, quotesReceived: 45 },
      { month: "Jun", rfqsCreated: 24, quotesReceived: 62 }
    ]);
    
    // Mock supplier performance
    setSupplierPerformance([
      { supplier: "TechSupply", responseTime: 3.2, quoteAcceptanceRate: 78, onTimeDelivery: 92 },
      { supplier: "GlobalSemi", responseTime: 2.8, quoteAcceptanceRate: 85, onTimeDelivery: 96 },
      { supplier: "ElectroTech", responseTime: 4.1, quoteAcceptanceRate: 71, onTimeDelivery: 88 },
      { supplier: "MetalWorks", responseTime: 3.9, quoteAcceptanceRate: 62, onTimeDelivery: 85 },
      { supplier: "ChemSolutions", responseTime: 5.2, quoteAcceptanceRate: 59, onTimeDelivery: 79 }
    ]);
  }, []);
  
  // Update charts based on time range
  const handleTimeRangeChange = (range: "7days" | "30days" | "90days" | "1year") => {
    setTimeRange(range);
    // This would fetch data with the new time range from the API in a real implementation
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Analytics Dashboard</h1>
          <p className="text-neutral-500 mt-1">
            Market insights and performance analytics
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <div className="ml-4 border rounded-md overflow-hidden">
            <Button 
              variant={timeRange === "7days" ? "default" : "ghost"} 
              size="sm"
              onClick={() => handleTimeRangeChange("7days")}
            >
              7D
            </Button>
            <Button 
              variant={timeRange === "30days" ? "default" : "ghost"} 
              size="sm"
              onClick={() => handleTimeRangeChange("30days")}
            >
              30D
            </Button>
            <Button 
              variant={timeRange === "90days" ? "default" : "ghost"} 
              size="sm"
              onClick={() => handleTimeRangeChange("90days")}
            >
              90D
            </Button>
            <Button 
              variant={timeRange === "1year" ? "default" : "ghost"} 
              size="sm"
              onClick={() => handleTimeRangeChange("1year")}
            >
              1Y
            </Button>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="market">
        <TabsList className="mb-4">
          <TabsTrigger value="market">
            <LineChartIcon className="h-4 w-4 mr-2" />
            Market Trends
          </TabsTrigger>
          <TabsTrigger value="rfq">
            <BarChart2 className="h-4 w-4 mr-2" />
            RFQ Performance
          </TabsTrigger>
          <TabsTrigger value="suppliers">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Supplier Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="market" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Market Price Trends</CardTitle>
                <CardDescription>
                  Price trends for key categories over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={marketTrends}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#3B82F6"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>
                  Distribution of RFQs across categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Price Change by Category</CardTitle>
              <CardDescription>
                Recent price changes across product categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { category: "Electronics", change: 3.5 },
                      { category: "Metals", change: -2.1 },
                      { category: "Chemicals", change: 1.8 },
                      { category: "Packaging", change: 0.7 },
                      { category: "Textiles", change: -1.2 },
                      { category: "Machinery", change: 2.4 }
                    ]}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis 
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip formatter={(value) => [`${value}%`, "Price Change"]} />
                    <Bar 
                      dataKey="change" 
                      fill={(entry) => entry.change >= 0 ? "#10B981" : "#EF4444"} 
                      radius={[4, 4, 0, 0]}
                    >
                      {[
                        { category: "Electronics", change: 3.5 },
                        { category: "Metals", change: -2.1 },
                        { category: "Chemicals", change: 1.8 },
                        { category: "Packaging", change: 0.7 },
                        { category: "Textiles", change: -1.2 },
                        { category: "Machinery", change: 2.4 }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.change >= 0 ? "#10B981" : "#EF4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rfq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>RFQ and Quote Activity</CardTitle>
              <CardDescription>
                Monthly RFQs created vs quotes received
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={rfqPerformance}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rfqsCreated" name="RFQs Created" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="quotesReceived" name="Quotes Received" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Response Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-4">
                  <div className="text-5xl font-bold text-primary">86%</div>
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Average quote response rate across all RFQs
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Avg. Quotes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-4">
                  <div className="text-5xl font-bold text-primary">4.2</div>
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Average number of quotes per RFQ
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Time to Quote</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-4">
                  <div className="text-5xl font-bold text-primary">
                    <Clock className="inline-block h-8 w-8 mr-2" />
                    3.6h
                  </div>
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Average time to receive first quote
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Performance</CardTitle>
              <CardDescription>
                Key performance metrics by supplier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={supplierPerformance}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="supplier" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="quoteAcceptanceRate" name="Quote Acceptance (%)" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="onTimeDelivery" name="On-Time Delivery (%)" fill="#10B981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Response Time by Supplier</CardTitle>
                <CardDescription>
                  Average hours to respond to RFQs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={supplierPerformance}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="supplier" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} hours`, "Response Time"]} />
                      <Bar 
                        dataKey="responseTime" 
                        name="Response Time (hours)" 
                        fill="#6366F1" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>AI Match Quality</CardTitle>
                <CardDescription>
                  Effectiveness of AI supplier matching
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Excellent (90%+)", value: 42, color: "#10B981" },
                          { name: "Good (75-90%)", value: 35, color: "#3B82F6" },
                          { name: "Fair (60-75%)", value: 18, color: "#F59E0B" },
                          { name: "Poor (<60%)", value: 5, color: "#EF4444" }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: "Excellent (90%+)", value: 42, color: "#10B981" },
                          { name: "Good (75-90%)", value: 35, color: "#3B82F6" },
                          { name: "Fair (60-75%)", value: 18, color: "#F59E0B" },
                          { name: "Poor (<60%)", value: 5, color: "#EF4444" }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
