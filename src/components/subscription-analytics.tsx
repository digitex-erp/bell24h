'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, Calendar } from 'lucide-react';

interface SubscriptionAnalytics {
  currentStatus: {
    isActive: boolean;
    activePlan: string | null;
    expiryDate: string | null;
    entitlements: string[];
    gracePeriod: boolean;
    willRenew: boolean;
  };
  totalPurchases: number;
  totalRenewals: number;
  totalCancellations: number;
  recentEvents: Array<{
    action: string;
    planId: string;
    timestamp: string;
    eventData: any;
  }>;
}

interface SystemAnalytics {
  totalUsers: number;
  activeSubscribers: number;
  monthlyRecurringRevenue: number;
  churnRate: number;
  conversionRate: number;
  averageRevenuePerUser: number;
  subscriptionTrends: Array<{
    date: string;
    active: number;
    cancelled: number;
    new: number;
  }>;
  planDistribution: Array<{
    plan: string;
    count: number;
    percentage: number;
  }>;
}

export default function SubscriptionAnalytics() {
  const [analytics, setAnalytics] = useState<SubscriptionAnalytics | null>(null);
  const [systemAnalytics, setSystemAnalytics] = useState<SystemAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedTimeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch user-specific analytics
      const userResponse = await fetch('/api/subscriptions/analytics');
      const userData = await userResponse.json();
      
      // Fetch system-wide analytics
      const systemResponse = await fetch(`/api/subscriptions/system-analytics?range=${selectedTimeRange}`);
      const systemData = await systemResponse.json();
      
      if (userData.success) {
        setAnalytics(userData.analytics);
      }
      
      if (systemData.success) {
        setSystemAnalytics(systemData.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Subscription Analytics</h1>
          <p className="text-gray-600">Monitor your subscription performance and usage</p>
        </div>
        <select 
          value={selectedTimeRange} 
          onChange={(e) => setSelectedTimeRange(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      {systemAnalytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemAnalytics.activeSubscribers}</div>
              <p className="text-xs text-muted-foreground">
                {systemAnalytics.conversionRate}% conversion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{systemAnalytics.monthlyRecurringRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {systemAnalytics.averageRevenuePerUser} ARPU
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemAnalytics.churnRate}%</div>
              <p className="text-xs text-muted-foreground">
                Monthly churn rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemAnalytics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                All registered users
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Plan Distribution</TabsTrigger>
          <TabsTrigger value="events">Recent Events</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {analytics && (
            <Card>
              <CardHeader>
                <CardTitle>Your Subscription Status</CardTitle>
                <CardDescription>Current subscription details and usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Current Plan</p>
                      <p className="text-2xl font-bold capitalize">
                        {analytics.currentStatus.activePlan || 'Free'}
                      </p>
                    </div>
                    <Badge 
                      variant={analytics.currentStatus.isActive ? "success" : "secondary"}
                    >
                      {analytics.currentStatus.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {analytics.currentStatus.expiryDate && (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Expires On</p>
                        <p className="text-sm text-gray-600">
                          {new Date(analytics.currentStatus.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}

                  {analytics.currentStatus.gracePeriod && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        Your subscription is in grace period. Please update your payment method.
                      </p>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-3 pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{analytics.totalPurchases}</p>
                      <p className="text-sm text-gray-600">Total Purchases</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{analytics.totalRenewals}</p>
                      <p className="text-sm text-gray-600">Renewals</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{analytics.totalCancellations}</p>
                      <p className="text-sm text-gray-600">Cancellations</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {systemAnalytics && (
            <Card>
              <CardHeader>
                <CardTitle>Subscription Trends</CardTitle>
                <CardDescription>Active subscriptions over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={systemAnalytics.subscriptionTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="active" 
                      stroke="#0088FE" 
                      strokeWidth={2}
                      name="Active"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="new" 
                      stroke="#00C49F" 
                      strokeWidth={2}
                      name="New"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cancelled" 
                      stroke="#FF8042" 
                      strokeWidth={2}
                      name="Cancelled"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          {systemAnalytics && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Plan Distribution</CardTitle>
                  <CardDescription>Subscription plans breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={systemAnalytics.planDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ plan, percentage }) => `${plan} (${percentage}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {systemAnalytics.planDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Plan Details</CardTitle>
                  <CardDescription>Subscription counts by plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={systemAnalytics.planDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="plan" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          {analytics && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Subscription Events</CardTitle>
                <CardDescription>Your subscription activity history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.recentEvents.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No recent subscription events</p>
                  ) : (
                    analytics.recentEvents.map((event, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium capitalize">{event.action.replace('_', ' ')}</p>
                          <p className="text-sm text-gray-600">{event.planId}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(event.timestamp).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}