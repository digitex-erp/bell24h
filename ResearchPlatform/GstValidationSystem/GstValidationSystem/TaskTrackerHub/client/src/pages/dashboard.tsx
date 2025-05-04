import { useQuery } from "@tanstack/react-query";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import StatsSummary from "@/components/dashboard/stats-summary";
import AIFeatures from "@/components/dashboard/ai-features";
import RFQsAndQuotes from "@/components/dashboard/rfqs-and-quotes";
import LogisticsTracking from "@/components/dashboard/logistics-tracking";
import MarketTrends from "@/components/dashboard/market-trends";
import PaymentAndFinancials from "@/components/dashboard/payment-and-financials";
import ActivityFeed from "@/components/dashboard/activity-feed";

export default function Dashboard() {
  // Get user info
  const { data: userData } = useQuery({ 
    queryKey: ['/api/auth/current']
  });

  return (
    <>
      <DashboardHeader />
      <StatsSummary />

      {/* Main Dashboard Sections */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column */}
        <div className="col-span-2 space-y-8">
          <AIFeatures />
          <RFQsAndQuotes />
          <LogisticsTracking />
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <MarketTrends />
          <PaymentAndFinancials />
          <ActivityFeed />
        </div>
      </div>
    </>
  );
}
