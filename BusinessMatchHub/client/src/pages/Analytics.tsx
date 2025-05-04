import React from 'react';
import { Helmet } from 'react-helmet';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Download, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';

const Analytics: React.FC = () => {
  // Get dashboard overview data
  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ['/api/analytics/overview'],
  });

  return (
    <div className="container mx-auto py-6 space-y-8">
      <Helmet>
        <title>Analytics Dashboard | Bell24h</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Get insights into your business performance and market trends
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active RFQs</CardDescription>
            <CardTitle className="text-3xl">
              {isLoading ? '...' : dashboardData?.rfqStats?.active || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="text-green-500 mr-1 h-4 w-4" />
              <span className="text-green-500 font-medium">5%</span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>New Suppliers</CardDescription>
            <CardTitle className="text-3xl">
              {isLoading ? '...' : dashboardData?.supplierStats?.totalActive || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="text-green-500 mr-1 h-4 w-4" />
              <span className="text-green-500 font-medium">12%</span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Successful Matches</CardDescription>
            <CardTitle className="text-3xl">
              {isLoading ? '...' : dashboardData?.contractStats?.total || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="text-green-500 mr-1 h-4 w-4" />
              <span className="text-green-500 font-medium">8%</span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Market Volatility</CardDescription>
            <CardTitle className="text-3xl">
              {isLoading ? '...' : 'Low'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <span className="text-green-500 font-medium">Stable</span>
              <span className="ml-1">market conditions</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <AnalyticsDashboard />
    </div>
  );
};

export default Analytics;