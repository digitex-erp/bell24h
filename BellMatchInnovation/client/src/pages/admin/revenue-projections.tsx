import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from "recharts";

export default function RevenueProjections() {
  // Use a query to fetch the real data from the API
  const { data, isLoading } = useQuery({
    queryKey: ['/api/admin/revenue-projections'],
    // If the backend endpoint isn't built yet, comment this line
    // queryFn: undefined,
  });

  // For demonstration, we'll use the data from the tariff plan document
  // In a real implementation, this would come from the API
  const dummyData = {
    revenueTarget: 10000000000, // ₹100 crore in rupees
    daysTotal: 369,
    daysPassed: 120, // Example: we're 120 days into the 369-day period
    currentRevenue: 3200000000, // ₹32 crore in rupees
    targetProgress: 32, // 32% of target achieved
    projections: {
      supplierSubscriptions: {
        monthlyTarget: 800000, // ₹8 lakh
        totalProjection: 9600000000, // ₹96 crore
        current: 3100000000, // ₹31 crore
        percentage: 32.3
      },
      transactionFees: {
        monthlyTarget: 150000, // ₹1.5 lakh
        totalProjection: 1800000000, // ₹18 crore
        current: 500000000, // ₹5 crore
        percentage: 27.8
      },
      escrowFees: {
        monthlyTarget: 50000, // ₹50k
        totalProjection: 600000000, // ₹6 crore
        current: 150000000, // ₹1.5 crore
        percentage: 25
      },
      adRevenue: {
        monthlyTarget: 200000, // ₹2 lakh
        totalProjection: 2400000000, // ₹24 crore
        current: 350000000, // ₹3.5 crore
        percentage: 14.6
      },
      invoiceDiscounting: {
        monthlyTarget: 100000, // ₹1 lakh
        totalProjection: 1200000000, // ₹12 crore
        current: 100000000, // ₹1 crore
        percentage: 8.3
      }
    },
    monthly: [
      { month: 'Jan', revenue: 220000000, target: 250000000 },
      { month: 'Feb', revenue: 310000000, target: 300000000 },
      { month: 'Mar', revenue: 280000000, target: 350000000 },
      { month: 'Apr', revenue: 410000000, target: 400000000 },
      { month: 'May', revenue: 320000000, target: 450000000 },
    ],
    breakdown: [
      { name: 'Supplier Subscriptions', value: 3100000000, color: '#8884d8' },
      { name: 'Transaction Fees', value: 500000000, color: '#82ca9d' },
      { name: 'Escrow Fees', value: 150000000, color: '#ffc658' },
      { name: 'Ad Revenue', value: 350000000, color: '#ff8042' },
      { name: 'Invoice Discounting', value: 100000000, color: '#0088fe' }
    ]
  };

  // Use actual data if available, otherwise fallback to dummy data
  const revenueData = data || dummyData;

  // Format numbers as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 1,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(amount);
  };

  // Calculate days remaining
  const daysRemaining = revenueData.daysTotal - revenueData.daysPassed;
  const timeProgress = (revenueData.daysPassed / revenueData.daysTotal) * 100;

  // Calculate projected end result
  const projectedRevenue = (revenueData.currentRevenue / revenueData.daysPassed) * revenueData.daysTotal;
  const projectedPercentage = (projectedRevenue / revenueData.revenueTarget) * 100;
  const isOnTrack = projectedRevenue >= revenueData.revenueTarget;

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Revenue Projections Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Tracking our progress toward the ₹100 crore revenue target over 369 days
        </p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(revenueData.revenueTarget)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Goal to reach in 369 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(revenueData.currentRevenue)}
            </div>
            <div className="flex items-center mt-1">
              <Progress value={revenueData.targetProgress} className="h-2 flex-1" />
              <span className="text-xs font-medium ml-2">{revenueData.targetProgress}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Time Elapsed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueData.daysPassed} days
            </div>
            <div className="flex items-center mt-1">
              <Progress value={timeProgress} className="h-2 flex-1" />
              <span className="text-xs font-medium ml-2">{timeProgress.toFixed(1)}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {daysRemaining} days remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Projected End Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(projectedRevenue)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={isOnTrack ? "default" : "destructive"} className={isOnTrack ? "bg-green-500" : ""}>
                {isOnTrack ? "On Track" : "At Risk"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {projectedPercentage.toFixed(1)}% of target
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="revenue-streams">
        <TabsList className="mb-6">
          <TabsTrigger value="revenue-streams">Revenue Streams</TabsTrigger>
          <TabsTrigger value="monthly-trends">Monthly Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Revenue Breakdown</TabsTrigger>
        </TabsList>

        {/* Revenue Streams Tab */}
        <TabsContent value="revenue-streams">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Stream Performance</CardTitle>
              <CardDescription>
                Progress toward 369-day targets across all revenue streams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {Object.entries(revenueData.projections).map(([key, stream]) => {
                  const name = key.replace(/([A-Z])/g, ' $1').trim();
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium capitalize">{name}</h4>
                          <p className="text-xs text-muted-foreground">
                            Monthly Target: {formatCurrency(stream.monthlyTarget)} | 
                            Total Target: {formatCurrency(stream.totalProjection)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(stream.current)}</p>
                          <p className="text-xs text-muted-foreground">
                            {stream.percentage}% of target
                          </p>
                        </div>
                      </div>
                      <Progress value={stream.percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Trends Tab */}
        <TabsContent value="monthly-trends">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trends</CardTitle>
              <CardDescription>
                Comparing monthly revenue against targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={revenueData.monthly}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis 
                      tickFormatter={(value) => 
                        new Intl.NumberFormat('en-IN', {
                          notation: 'compact',
                          compactDisplay: 'short'
                        }).format(value)
                      } 
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value as number), '']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Actual Revenue" fill="#82ca9d" />
                    <Bar dataKey="target" name="Target Revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Breakdown Tab */}
        <TabsContent value="breakdown">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>
                Current distribution of revenue across streams
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col lg:flex-row gap-8">
              <div className="h-[400px] flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueData.breakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueData.breakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value as number), '']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left pb-2">Revenue Stream</th>
                      <th className="text-right pb-2">Amount</th>
                      <th className="text-right pb-2">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.breakdown.map((item, index) => (
                      <tr key={index}>
                        <td className="py-2">
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: item.color }}
                            ></div>
                            {item.name}
                          </div>
                        </td>
                        <td className="text-right">{formatCurrency(item.value)}</td>
                        <td className="text-right">
                          {((item.value / revenueData.currentRevenue) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t">
                      <td className="py-2 font-medium">Total</td>
                      <td className="text-right font-medium">{formatCurrency(revenueData.currentRevenue)}</td>
                      <td className="text-right font-medium">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Daily rate card */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Daily Revenue Metrics</CardTitle>
          <CardDescription>
            Progress rates and daily targets to achieve the ₹100 crore goal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Current Daily Rate</h3>
              <p className="text-2xl font-bold">
                {formatCurrency(revenueData.currentRevenue / revenueData.daysPassed)}
                <span className="text-sm text-muted-foreground font-normal"> / day</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Average revenue per day so far
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Required Daily Rate</h3>
              <p className="text-2xl font-bold">
                {formatCurrency((revenueData.revenueTarget - revenueData.currentRevenue) / daysRemaining)}
                <span className="text-sm text-muted-foreground font-normal"> / day</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Required to meet the target in remaining days
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Target Daily Rate</h3>
              <p className="text-2xl font-bold">
                {formatCurrency(revenueData.revenueTarget / revenueData.daysTotal)}
                <span className="text-sm text-muted-foreground font-normal"> / day</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Planned average daily revenue
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}