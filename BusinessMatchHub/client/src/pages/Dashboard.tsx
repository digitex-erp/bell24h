import React from 'react';
import { useQuery } from '@tanstack/react-query';
import QuickActions from '@/components/dashboard/QuickActions';
import StatsOverview from '@/components/dashboard/StatsOverview';
import VoiceRFQFeature from '@/components/dashboard/VoiceRFQFeature';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';
import RecentRFQs from '@/components/dashboard/RecentRFQs';
import TopSuppliers from '@/components/dashboard/TopSuppliers';
import { apiRequest } from '@/lib/queryClient';

const Dashboard: React.FC = () => {
  // Get dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  // Get recent RFQs
  const { data: rfqs, isLoading: isLoadingRfqs } = useQuery({
    queryKey: ['/api/rfqs'],
  });

  // Get top suppliers
  const { data: suppliers, isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ['/api/suppliers/top'],
  });

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Quick Actions */}
        <QuickActions />

        {/* Stats Overview */}
        <StatsOverview stats={stats} isLoading={isLoadingStats} />

        {/* Voice RFQ Feature */}
        <VoiceRFQFeature />

        {/* Analytics Dashboard */}
        <AnalyticsDashboard />

        {/* Recent RFQs */}
        <RecentRFQs rfqs={rfqs} isLoading={isLoadingRfqs} />

        {/* Top Suppliers */}
        <TopSuppliers suppliers={suppliers} isLoading={isLoadingSuppliers} />
      </div>
    </div>
  );
};

export default Dashboard;
