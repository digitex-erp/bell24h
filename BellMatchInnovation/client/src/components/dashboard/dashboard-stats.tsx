import React from "react";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";

const DashboardStats = () => {
  // Fetch dashboard statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    refetchOnWindowFocus: false,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 border border-gray-200 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-6"></div>
            </div>
            <div className="mt-2 h-6 bg-gray-200 rounded w-16"></div>
            <div className="mt-1 h-4 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  const defaultStats = {
    activeRfqs: {
      count: 0,
      change: 0,
      direction: "up",
    },
    supplierResponses: {
      count: 0,
      change: 0,
      direction: "up",
    },
    walletBalance: {
      amount: "0",
      status: "limited",
      direction: "right",
    },
  };

  const dashboardStats = stats || defaultStats;

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      <p className="text-gray-500">Welcome back! Here's what's happening with your RFQs.</p>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active RFQs */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-600">Active RFQs</h3>
            <span className="text-primary-600">
              <i className="fas fa-file-alt"></i>
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-800">
            {dashboardStats.activeRfqs.count}
          </p>
          <p className={`text-sm text-${dashboardStats.activeRfqs.direction === 'up' ? 'success' : 'danger'}-600 flex items-center mt-1`}>
            <i className={`fas fa-arrow-${dashboardStats.activeRfqs.direction} text-xs mr-1`}></i>
            <span>{Math.abs(dashboardStats.activeRfqs.change)}% from last week</span>
          </p>
        </div>

        {/* Supplier Responses */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-600">Supplier Responses</h3>
            <span className="text-primary-600">
              <i className="fas fa-reply"></i>
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-800">
            {dashboardStats.supplierResponses.count}
          </p>
          <p className={`text-sm text-${dashboardStats.supplierResponses.direction === 'up' ? 'success' : 'danger'}-600 flex items-center mt-1`}>
            <i className={`fas fa-arrow-${dashboardStats.supplierResponses.direction} text-xs mr-1`}></i>
            <span>{Math.abs(dashboardStats.supplierResponses.change)}% from last week</span>
          </p>
        </div>

        {/* Wallet Balance */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-600">Wallet Balance</h3>
            <span className="text-primary-600">
              <i className="fas fa-wallet"></i>
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-800">
            {formatCurrency(dashboardStats.walletBalance.amount)}
          </p>
          <p className={`text-sm text-${dashboardStats.walletBalance.status === 'active' ? 'success' : 'warning'}-600 flex items-center mt-1`}>
            <i className={`fas fa-arrow-${dashboardStats.walletBalance.direction} text-xs mr-1`}></i>
            <span>{dashboardStats.walletBalance.status === 'active' ? 'Active' : 'Limited activity'}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
