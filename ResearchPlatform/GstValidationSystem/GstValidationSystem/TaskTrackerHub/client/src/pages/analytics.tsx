import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  LineChart,
  PieChart,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import { ChevronUp, ChevronDown, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

// Sample data for charts (would be fetched from API in production)
const supplierPerformanceData = [
  { name: "Jan", onTime: 85, quality: 90, price: 82 },
  { name: "Feb", onTime: 88, quality: 92, price: 80 },
  { name: "Mar", onTime: 90, quality: 91, price: 85 },
  { name: "Apr", onTime: 92, quality: 93, price: 88 },
  { name: "May", onTime: 89, quality: 94, price: 90 },
  { name: "Jun", onTime: 91, quality: 95, price: 92 },
];

const categoryDistributionData = [
  { name: "Electronics", value: 35 },
  { name: "Mechanical", value: 25 },
  { name: "Electrical", value: 20 },
  { name: "Software", value: 15 },
  { name: "Other", value: 5 },
];

const rfqSuccessRateData = [
  { name: "Week 1", rate: 65 },
  { name: "Week 2", rate: 68 },
  { name: "Week 3", rate: 72 },
  { name: "Week 4", rate: 75 },
  { name: "Week 5", rate: 80 },
  { name: "Week 6", rate: 85 },
  { name: "Week 7", rate: 82 },
  { name: "Week 8", rate: 84 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Analytics() {
  const [timeframe, setTimeframe] = useState("6m");
  
  // Fetch market trends data
  const { data: marketTrends } = useQuery({ 
    queryKey: ['/api/market-trends'],
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-heading text-dark-800">Analytics</h1>
          <p className="mt-1 text-dark-500">View detailed insights about your procurement operations</p>
        </div>
        
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">Last Month</SelectItem>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="performance">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="rfq">RFQ Analytics</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predictive Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="space-y-6 mt-6">
          {/* Key metrics row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-dark-500">Average Response Time</p>
                    <p className="text-2xl font-bold">1.2 days</p>
                  </div>
                  <div className="flex items-center text-green-600">
                    <ChevronUp className="h-4 w-4" />
                    <span className="text-sm ml-1">18%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-dark-500">Quote Conversion Rate</p>
                    <p className="text-2xl font-bold">42%</p>
                  </div>
                  <div className="flex items-center text-green-600">
                    <ChevronUp className="h-4 w-4" />
                    <span className="text-sm ml-1">7%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-dark-500">Average Cost Savings</p>
                    <p className="text-2xl font-bold">15.3%</p>
                  </div>
                  <div className="flex items-center text-green-600">
                    <ChevronUp className="h-4 w-4" />
                    <span className="text-sm ml-1">3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-dark-500">Procurement Cycle Time</p>
                    <p className="text-2xl font-bold">8.5 days</p>
                  </div>
                  <div className="flex items-center text-red-600">
                    <ChevronDown className="h-4 w-4" />
                    <span className="text-sm ml-1">5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Performance charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Supplier Performance Over Time</CardTitle>
                <CardDescription>
                  Tracking key supplier metrics monthly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={supplierPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="onTime" stroke="#2563eb" activeDot={{ r: 8 }} name="On-Time Delivery" />
                      <Line type="monotone" dataKey="quality" stroke="#059669" name="Quality Rating" />
                      <Line type="monotone" dataKey="price" stroke="#d97706" name="Price Competitiveness" />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>
                  Procurement spending by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={categoryDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="rfq" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>RFQ Success Rate Trends</CardTitle>
              <CardDescription>
                Weekly success rate of RFQs resulting in completed deals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={rfqSuccessRateData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="rate" stroke="#2563eb" fill="#93c5fd" name="Success Rate %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top RFQs by Response Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>RFQ Number</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Quotes</TableHead>
                      <TableHead>Response Rate</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>RFQ-2023-8721</TableCell>
                      <TableCell>PCB Boards - 4 Layer</TableCell>
                      <TableCell>12</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="text-green-600 mr-2">92%</span>
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                      </TableCell>
                      <TableCell>Active</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>RFQ-2023-8705</TableCell>
                      <TableCell>Power Supplies - 24V</TableCell>
                      <TableCell>8</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="text-green-600 mr-2">85%</span>
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                      </TableCell>
                      <TableCell>Completed</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>RFQ-2023-8698</TableCell>
                      <TableCell>LCD Displays - 10 inch</TableCell>
                      <TableCell>5</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="text-red-600 mr-2">65%</span>
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        </div>
                      </TableCell>
                      <TableCell>Pending</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Response Time Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={[
                      { time: '<12h', count: 25 },
                      { time: '12-24h', count: 40 },
                      { time: '24-48h', count: 20 },
                      { time: '>48h', count: 15 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" name="Number of Quotes" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="suppliers" className="space-y-6 mt-6">
          {/* Supplier insights content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Supplier Risk Distribution</CardTitle>
                <CardDescription>
                  Distribution of suppliers by risk score
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={[
                      { risk: 'Low Risk (80-100)', count: 35, fill: '#10b981' },
                      { risk: 'Medium Risk (60-79)', count: 42, fill: '#f59e0b' },
                      { risk: 'High Risk (0-59)', count: 23, fill: '#ef4444' },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="risk" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" name="Number of Suppliers">
                        {[
                          <Cell key="cell-0" fill="#10b981" />,
                          <Cell key="cell-1" fill="#f59e0b" />,
                          <Cell key="cell-2" fill="#ef4444" />,
                        ]}
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Risk Factors</CardTitle>
                <CardDescription>
                  Top risk factors identified
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-dark-600">Financial Stability</span>
                      <span className="text-sm font-medium text-dark-700">68%</span>
                    </div>
                    <div className="w-full h-2 bg-dark-100 rounded-full">
                      <div className="h-2 bg-yellow-500 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-dark-600">Delivery Performance</span>
                      <span className="text-sm font-medium text-dark-700">82%</span>
                    </div>
                    <div className="w-full h-2 bg-dark-100 rounded-full">
                      <div className="h-2 bg-green-500 rounded-full" style={{ width: '82%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-dark-600">Quality Control</span>
                      <span className="text-sm font-medium text-dark-700">75%</span>
                    </div>
                    <div className="w-full h-2 bg-dark-100 rounded-full">
                      <div className="h-2 bg-green-500 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-dark-600">Compliance</span>
                      <span className="text-sm font-medium text-dark-700">58%</span>
                    </div>
                    <div className="w-full h-2 bg-dark-100 rounded-full">
                      <div className="h-2 bg-red-500 rounded-full" style={{ width: '58%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Suppliers by Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>On-Time Delivery</TableHead>
                    <TableHead>Price Competitiveness</TableHead>
                    <TableHead>Quality Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Supertronics Ltd</TableCell>
                    <TableCell>Electronics</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        89
                      </span>
                    </TableCell>
                    <TableCell>95%</TableCell>
                    <TableCell>87%</TableCell>
                    <TableCell>92%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">TechLabs India</TableCell>
                    <TableCell>Components</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        85
                      </span>
                    </TableCell>
                    <TableCell>93%</TableCell>
                    <TableCell>90%</TableCell>
                    <TableCell>88%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">ElectroMart Ltd</TableCell>
                    <TableCell>Electrical</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        72
                      </span>
                    </TableCell>
                    <TableCell>85%</TableCell>
                    <TableCell>92%</TableCell>
                    <TableCell>80%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="predictions" className="space-y-6 mt-6">
          {/* Predictive Analytics content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>RFQ Success Probability</CardTitle>
                <CardDescription>
                  Predicted success rates for active RFQs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h4 className="font-medium">RFQ-2023-8721</h4>
                        <p className="text-sm text-dark-500">PCB Boards - 4 Layer</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          87% Success
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-dark-100 rounded-full">
                      <div className="h-2 bg-green-500 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                    <div className="mt-2 text-xs text-dark-500">
                      Key factors: High supplier availability, competitive pricing, standard specs
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h4 className="font-medium">RFQ-2023-8720</h4>
                        <p className="text-sm text-dark-500">Resistor Kit - 5000pcs</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          72% Success
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-dark-100 rounded-full">
                      <div className="h-2 bg-yellow-500 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                    <div className="mt-2 text-xs text-dark-500">
                      Key factors: Medium supplier competition, standard delivery timeline
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h4 className="font-medium">RFQ-2023-8719</h4>
                        <p className="text-sm text-dark-500">LCD Panels - 7 inch</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          45% Success
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-dark-100 rounded-full">
                      <div className="h-2 bg-red-500 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <div className="mt-2 text-xs text-dark-500">
                      Key factors: Supply chain shortages, high demand, custom specifications
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Market Trend Predictions</CardTitle>
                <CardDescription>
                  Forecasted price and availability trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={[
                        { month: 'Jul', actual: 100, predicted: null },
                        { month: 'Aug', actual: 105, predicted: null },
                        { month: 'Sep', actual: 110, predicted: null },
                        { month: 'Oct', actual: 112, predicted: null },
                        { month: 'Nov', actual: 108, predicted: 108 },
                        { month: 'Dec', actual: null, predicted: 115 },
                        { month: 'Jan', actual: null, predicted: 120 },
                        { month: 'Feb', actual: null, predicted: 118 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="actual" stroke="#2563eb" name="Actual Prices" strokeWidth={2} />
                      <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeDasharray="5 5" name="Predicted Prices" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center p-2 rounded-md bg-yellow-50 text-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                    <span>Semiconductor prices predicted to rise by 12% over next quarter</span>
                  </div>
                  <div className="flex items-center p-2 rounded-md bg-green-50 text-sm">
                    <TrendingDown className="h-4 w-4 text-green-600 mr-2" />
                    <span>Copper prices expected to stabilize by February</span>
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
