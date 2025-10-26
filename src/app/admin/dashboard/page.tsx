'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Brain,
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  Globe,
  Heart,
  Home,
  MessageCircle,
  Mic,
  Package,
  Settings,
  Shield,
  Star,
  TrendingUp,
  Truck,
  Users,
  Video,
  Wallet,
  Zap,
  PlusCircle,
  Lightbulb,
  Activity,
  Building2,
  Database,
  Workflow,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';

// Mock admin data
const mockAdminData = {
  user: {
    name: 'Admin User',
    role: 'Administrator',
    company: 'Bell24H Admin',
    avatar: '👨‍💼',
  },
  kpis: {
    totalUsers: 1247,
    totalSuppliers: 847,
    totalBuyers: 400,
    totalRevenue: 12500000,
    activeRFQs: 156,
    completedRFQs: 89,
    pendingApprovals: 23,
    systemHealth: 98.5,
  },
  systemInsights: {
    uptime: '99.9%',
    activeWorkflows: 12,
    dataProcessed: 45678,
    alerts: [
      { type: 'success', message: 'System backup completed successfully' },
      { type: 'warning', message: 'High memory usage detected on server 2' },
      { type: 'info', message: 'New user registration spike detected' },
    ],
  },
  recentActivity: [
    { id: 1, type: 'user', title: 'New user registered: SteelCorp Ltd', status: 'new', time: '5 minutes ago' },
    { id: 2, type: 'workflow', title: 'N8N workflow executed successfully', status: 'completed', time: '10 minutes ago' },
    { id: 3, type: 'payment', title: 'Payment processed: ₹2,50,000', status: 'completed', time: '1 hour ago' },
    { id: 4, type: 'alert', title: 'System maintenance scheduled', status: 'scheduled', time: '2 hours ago' },
  ],
  topFeatures: [
    { name: 'CRM Management', description: 'Customer relationship management', users: 156, status: 'active' },
    { name: 'N8N Automation', description: 'Workflow automation server', workflows: 12, status: 'active' },
    { name: 'Analytics Dashboard', description: 'Business intelligence and insights', reports: 45, status: 'active' },
    { name: 'User Management', description: 'User accounts and permissions', users: 1247, status: 'active' },
  ],
};

// Admin KPI Card Component
const AdminKPICard = ({ title, value, subValue, trend, icon: Icon, color = 'blue' }: {
  title: string;
  value: string;
  subValue?: string;
  trend?: string;
  icon: any;
  color?: string;
}) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subValue && <p className="text-xs text-gray-500">{subValue}</p>}
        {trend && (
          <span className={`text-sm ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </span>
        )}
      </div>
      {Icon && <Icon className={`w-8 h-8 text-${color}-600`} />}
    </div>
  </div>
);

// System Health Panel
const SystemHealthPanel = ({ insights, alerts = [] }: {
  insights: any;
  alerts?: any[];
}) => (
  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <Shield className="w-5 h-5 mr-2 text-green-600" />
        System Health
      </h3>
      <span className="text-sm text-gray-500">Real-time monitoring</span>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">System Uptime</span>
          <span className="text-2xl font-bold text-green-600">{insights.uptime}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.9%' }}></div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Active Workflows</span>
          <span className="text-2xl font-bold text-blue-600">{insights.activeWorkflows}</span>
        </div>
        <p className="text-xs text-gray-500">N8N automation running</p>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Data Processed</span>
          <span className="text-2xl font-bold text-purple-600">{insights.dataProcessed.toLocaleString()}</span>
        </div>
        <p className="text-xs text-gray-500">Records today</p>
      </div>
    </div>

    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-900 mb-2">Live System Alerts</h4>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {alerts.length > 0 ? alerts.map((alert, index) => (
          <div key={index} className={`text-xs px-2 py-1 rounded ${
            alert.type === 'success' ? 'text-green-600 bg-green-100' :
            alert.type === 'warning' ? 'text-yellow-600 bg-yellow-100' :
            'text-blue-600 bg-blue-100'
          }`}>
            {alert.message}
          </div>
        )) : (
          <div className="text-xs text-gray-500 italic">No active alerts</div>
        )}
      </div>
    </div>
  </div>
);

// Feature Management Cards
const FeatureCard = ({ feature }: { feature: any }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
          {feature.name === 'CRM Management' && <Users className="w-5 h-5 text-blue-600" />}
          {feature.name === 'N8N Automation' && <Zap className="w-5 h-5 text-purple-600" />}
          {feature.name === 'Analytics Dashboard' && <BarChart3 className="w-5 h-5 text-green-600" />}
          {feature.name === 'User Management' && <Settings className="w-5 h-5 text-orange-600" />}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{feature.name}</h3>
          <p className="text-sm text-gray-600">{feature.description}</p>
        </div>
      </div>
      <span className={`px-2 py-1 text-xs rounded-full ${
        feature.status === 'active' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
      }`}>
        {feature.status}
      </span>
    </div>
    
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-500">
        {feature.users ? `${feature.users} users` : `${feature.workflows} workflows`}
        {feature.reports && ` • ${feature.reports} reports`}
      </div>
      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
        Manage →
      </button>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [liveData, setLiveData] = useState(mockAdminData);
  const [systemAlerts, setSystemAlerts] = useState(mockAdminData.systemInsights.alerts);

  // Update time every second for live feel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate live data updates
  useEffect(() => {
    const dataUpdateInterval = setInterval(() => {
      setLiveData(prev => ({
        ...prev,
        kpis: {
          ...prev.kpis,
          totalUsers: prev.kpis.totalUsers + Math.floor(Math.random() * 3),
          activeRFQs: prev.kpis.activeRFQs + Math.floor(Math.random() * 2) - 1,
          systemHealth: Math.min(100, prev.kpis.systemHealth + (Math.random() - 0.5) * 0.1),
        },
        systemInsights: {
          ...prev.systemInsights,
          dataProcessed: prev.systemInsights.dataProcessed + Math.floor(Math.random() * 50),
        }
      }));
    }, 5000);

    return () => clearInterval(dataUpdateInterval);
  }, []);

  // Simulate new alerts
  useEffect(() => {
    const alertInterval = setInterval(() => {
      const newAlert = {
        type: Math.random() > 0.7 ? 'warning' : 'info',
        message: `System update: ${new Date().toLocaleTimeString()} - ${Math.random() > 0.5 ? 'New user registered' : 'Workflow completed'}`
      };
      setSystemAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
    }, 30000);

    return () => clearInterval(alertInterval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
      case 'new':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'scheduled':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const user = mockAdminData.user;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Bell24H Admin</span>
            </div>

            {/* Admin Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <a href="/admin/crm" className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <Users className="w-4 h-4 mr-2" />
                CRM Management
              </a>
              <a href="/admin/n8n" className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Zap className="w-4 h-4 mr-2" />
                N8N Workflows
              </a>
              <a href="/admin/analytics" className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </a>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 text-gray-500 hover:text-gray-700 relative">
                  <MessageCircle className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    5
                  </span>
                </button>
              </div>

              {/* Profile */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.avatar}
                </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard 🛠️
              </h1>
              <p className="text-gray-600 mt-2">
                System management and monitoring center
              </p>
                </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Live Admin Panel</p>
              <p className="text-lg font-semibold text-gray-900">
                {currentTime.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Admin KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AdminKPICard 
            title="Total Users" 
            value={liveData.kpis.totalUsers.toLocaleString()} 
            subValue={`${liveData.kpis.totalSuppliers} suppliers, ${liveData.kpis.totalBuyers} buyers`}
            trend="+15% this month"
            icon={Users}
            color="blue"
          />
          <AdminKPICard 
            title="Total Revenue" 
            value={formatCurrency(liveData.kpis.totalRevenue)} 
            trend="+22% this month"
            icon={DollarSign}
            color="green"
          />
          <AdminKPICard 
            title="Active RFQs" 
            value={liveData.kpis.activeRFQs.toString()} 
            subValue={`${liveData.kpis.completedRFQs} completed`}
            icon={FileText}
            color="purple"
          />
          <AdminKPICard 
            title="System Health" 
            value={`${liveData.kpis.systemHealth.toFixed(1)}%`} 
            subValue="All systems operational"
            icon={Shield}
            color="green"
          />
        </div>

        {/* System Health Panel */}
        <div className="mb-8">
          <SystemHealthPanel insights={liveData.systemInsights} alerts={systemAlerts} />
        </div>

        {/* Feature Management */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockAdminData.topFeatures.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
                </div>
              </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Recent System Activity
          </h3>
          <div className="space-y-4">
            {mockAdminData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    {activity.type === 'user' && <Users className="w-5 h-5 text-blue-600" />}
                    {activity.type === 'workflow' && <Zap className="w-5 h-5 text-purple-600" />}
                    {activity.type === 'payment' && <DollarSign className="w-5 h-5 text-green-600" />}
                    {activity.type === 'alert' && <AlertTriangle className="w-5 h-5 text-orange-600" />}
                  </div>
                <div>
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
          </div>
      </div>
    </div>
  );
}