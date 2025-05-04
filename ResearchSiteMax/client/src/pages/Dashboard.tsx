import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "@/components/dashboard/stats-card";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { RecentRfqs } from "@/components/dashboard/recent-rfqs";
import { LogisticsTracking } from "@/components/dashboard/logistics-tracking";
import { SupplierRisk } from "@/components/dashboard/supplier-risk";
import { ChartData, IndustryTrend, LogisticsTrackingItem, SupplierRiskItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Truck,
  Filter,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();
  const [chartPeriod, setChartPeriod] = useState("Last 30 days");
  
  // Fetch dashboard data
  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  // Fetch recent RFQs
  const { data: recentRfqs = [], isLoading: isLoadingRfqs } = useQuery({
    queryKey: ["/api/rfqs/recent"],
  });

  // Fetch logistics data
  const { data: logisticsData = [], isLoading: isLoadingLogistics } = useQuery({
    queryKey: ["/api/logistics/recent"],
  });

  // Fetch supplier risk data
  const { data: supplierRiskData = [], isLoading: isLoadingSupplierRisk } = useQuery({
    queryKey: ["/api/analytics/supplier-risk"],
  });

  // Fetch industry trends
  const { data: industryTrends = [], isLoading: isLoadingIndustryTrends } = useQuery({
    queryKey: ["/api/analytics/industry-trends"],
  });

  // Chart data would be loaded from the API in a real implementation
  const chartData: ChartData[] = [
    { name: "Jan", value: 10 },
    { name: "Feb", value: 12 },
    { name: "Mar", value: 15 },
    { name: "Apr", value: 14 },
    { name: "May", value: 16 },
    { name: "Jun", value: 18 },
    { name: "Jul", value: 20 },
    { name: "Aug", value: 22 },
    { name: "Sep", value: 24 },
    { name: "Oct", value: 26 },
    { name: "Nov", value: 28 },
    { name: "Dec", value: 32 },
  ];

  // Industry trends data
  const industryTrendsData: IndustryTrend[] = [
    { category: "Electronics", percentage: 88, percentageText: "+8.8%", value: 88, color: "success" },
    { category: "Manufacturing", percentage: 65, percentageText: "+6.5%", value: 65, color: "warning" },
    { category: "IT Services", percentage: 72, percentageText: "+7.2%", value: 72, color: "primary-500" },
    { category: "Textiles", percentage: 45, percentageText: "-4.5%", value: 45, color: "danger" },
    { category: "Health Tech", percentage: 55, percentageText: "+5.5%", value: 55, color: "secondary-500" },
  ];

  // Sample logistics data
  const logisticsItems: LogisticsTrackingItem[] = [
    {
      id: 1,
      trackingNumber: "SHP92001",
      orderNumber: "45678",
      description: "Electronics Components",
      status: "In Transit",
      origin: "Delhi",
      current: "Jaipur",
      destination: "Mumbai",
      progress: 75
    },
    {
      id: 2,
      trackingNumber: "SHP92002",
      orderNumber: "45679",
      description: "Solar Panels",
      status: "Processing",
      origin: "Chennai",
      current: "Chennai",
      destination: "Bengaluru",
      progress: 25
    },
    {
      id: 3,
      trackingNumber: "SHP92003",
      orderNumber: "45680",
      description: "Chemical Supplies",
      status: "Delivered",
      origin: "Surat",
      current: "Mumbai",
      destination: "Mumbai",
      progress: 100
    }
  ];

  // Sample supplier risk data
  const supplierRiskItems: SupplierRiskItem[] = [
    {
      id: 1,
      name: "TS Corp",
      company: "TechSolutions Corp",
      location: "Mumbai, India",
      category: "Electronics",
      riskScore: 92,
      riskTrend: "up",
      factors: [
        { name: "On-time delivery", value: "98%", indicator: "green" },
        { name: "Financial stability", value: "High", indicator: "green" }
      ]
    },
    {
      id: 2,
      name: "GI Ltd",
      company: "GreenInnovate Ltd",
      location: "Bengaluru, India",
      category: "Solar Energy",
      riskScore: 78,
      riskTrend: "stable",
      factors: [
        { name: "On-time delivery", value: "85%", indicator: "yellow" },
        { name: "Compliance score", value: "Medium", indicator: "yellow" }
      ]
    },
    {
      id: 3,
      name: "CC Ind",
      company: "ChemCorp Industries",
      location: "Hyderabad, India",
      category: "Chemical Supplies",
      riskScore: 64,
      riskTrend: "down",
      factors: [
        { name: "On-time delivery", value: "72%", indicator: "red" },
        { name: "Compliance score", value: "Low", indicator: "red" }
      ]
    }
  ];

  const statsData = dashboardData || {
    activeRfqs: 12,
    matchedSuppliers: 48,
    walletBalance: 24500,
    pendingDeliveries: 7,
    rfqTrend: 8.1,
    matchTrend: 12.4
  };

  return (
    <div className="px-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Get an overview of your B2B marketplace activities.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button variant="outline" className="inline-flex items-center">
            <Filter className="h-5 w-5 mr-2 text-gray-500" />
            Filter
          </Button>
          <Button variant="outline" className="inline-flex items-center">
            <Download className="h-5 w-5 mr-2 text-gray-500" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={<LayoutDashboard className="h-6 w-6" />}
          iconClass="stats-icon-primary"
          title="Active RFQs"
          value={statsData.activeRfqs}
          trend={{ value: `+${statsData.rfqTrend}% from last week`, direction: "up" }}
        />
        
        <StatsCard
          icon={<Users className="h-6 w-6" />}
          iconClass="stats-icon-success"
          title="Matched Suppliers"
          value={statsData.matchedSuppliers}
          trend={{ value: `+${statsData.matchTrend}% from last month`, direction: "up" }}
        />
        
        <StatsCard
          icon={<Wallet className="h-6 w-6" />}
          iconClass="stats-icon bg-secondary-50 text-secondary-500"
          title="Wallet Balance"
          value={formatCurrency(statsData.walletBalance)}
          subtitle="Last transaction: 2 days ago"
        />
        
        <StatsCard
          icon={<Truck className="h-6 w-6" />}
          iconClass="stats-icon-info"
          title="Pending Deliveries"
          value={statsData.pendingDeliveries}
          trend={{ value: "2 arriving today", direction: "stable" }}
        />
      </div>
      
      {/* Analytics Chart Section */}
      <div className="mt-8">
        <AnalyticsChart
          title="Market Insights"
          chartData={chartData}
          industryTrends={industryTrendsData}
          metrics={[
            { name: "Match Success Rate", value: "78%" },
            { name: "Avg. Response Time", value: "18h" },
            { name: "On-time Delivery", value: "92%" }
          ]}
          period={chartPeriod}
          onPeriodChange={setChartPeriod}
        />
      </div>
      
      {/* Recent Activities Section */}
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <RecentRfqs rfqs={recentRfqs} />
        <LogisticsTracking shipments={logisticsItems} />
      </div>
      
      {/* Supplier Risk Analysis Section */}
      <div className="mt-8">
        <SupplierRisk suppliers={supplierRiskItems} />
      </div>
    </div>
  );
}
