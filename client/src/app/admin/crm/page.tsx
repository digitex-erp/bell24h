'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp, MessageSquare, Target, DollarSign, BarChart3 } from 'lucide-react';

interface MarketingMetrics {
  totalLeads: number;
  activeLeads: number;
  conversions: number;
  revenue: number;
  recentLeads: any[];
  campaignPerformance: any[];
}

export default function CRMDashboard() {
  const [marketingMetrics, setMarketingMetrics] = useState<MarketingMetrics>({
    totalLeads: 0,
    activeLeads: 0,
    conversions: 0,
    revenue: 0,
    recentLeads: [],
    campaignPerformance: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCRMData();
  }, []);

  const fetchCRMData = async () => {
    try {
      const response = await fetch('/api/admin/crm/overview');
      if (response.ok) {
        const data = await response.json();
        setMarketingMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch CRM data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bell24h Marketing Command Center</h1>
        <p className="text-gray-600 mt-2">Track leads, monitor campaigns, and optimize your 5000-supplier strategy</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Leads Today"
          value={marketingMetrics.totalLeads.toLocaleString()}
          change="+23%"
          icon={<Users className="h-6 w-6" />}
          color="blue"
        />
        <MetricCard
          title="Supplier Signups"
          value={marketingMetrics.conversions.toLocaleString()}
          change="+45%"
          icon={<Target className="h-6 w-6" />}
          color="green"
        />
        <MetricCard
          title="AI Chat Engagements"
          value="2,156"
          change="+67%"
          icon={<MessageSquare className="h-6 w-6" />}
          color="purple"
        />
        <MetricCard
          title="Revenue Generated"
          value={`₹${(marketingMetrics.revenue / 100000).toFixed(1)}L`}
          change="+18%"
          icon={<DollarSign className="h-6 w-6" />}
          color="yellow"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lead Sources Breakdown */}
        <div className="lg:col-span-2">
          <LeadSourcesChart />
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <QuickActions />
          <RecentLeadsTable leads={marketingMetrics.recentLeads} />
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="mt-8">
        <CampaignPerformanceTable campaigns={marketingMetrics.campaignPerformance} />
      </div>
    </div>
  );
}

// Metric Card Component
const MetricCard = ({ title, value, change, icon, color }: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500'
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          <p className="text-sm text-green-600 mt-1">{change} vs last month</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]} text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Lead Sources Chart Component
const LeadSourcesChart = () => {
  const leadSources = [
    { source: 'LinkedIn Outreach', leads: 450, conversion: '18%', status: 'active' },
    { source: 'GST Scraping', leads: 320, conversion: '12%', status: 'active' },
    { source: 'WhatsApp Blast', leads: 280, conversion: '8%', status: 'paused' },
    { source: 'Medium Article', leads: 180, conversion: '25%', status: 'active' },
    { source: 'Reddit Posts', leads: 95, conversion: '35%', status: 'active' },
    { source: 'SMS Campaign', leads: 75, conversion: '5%', status: 'testing' }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Lead Sources Performance</h2>
      <div className="space-y-4">
        {leadSources.map((source, index) => (
          <div key={index} className="flex justify-between items-center p-3 border rounded">
            <div>
              <span className="font-medium">{source.source}</span>
              <span className={`ml-2 px-2 py-1 text-xs rounded ${
                source.status === 'active' ? 'bg-green-100 text-green-800' :
                source.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {source.status}
              </span>
            </div>
            <div className="text-right">
              <div className="font-semibold">{source.leads} leads</div>
              <div className="text-sm text-gray-600">{source.conversion} conversion</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Quick Actions Component
const QuickActions = () => {
  const actions = [
    { icon: <Users className="h-4 w-4" />, label: 'Add Lead', action: 'add-lead', color: 'bg-blue-600' },
    { icon: <MessageSquare className="h-4 w-4" />, label: 'Send Email', action: 'send-email', color: 'bg-green-600' },
    { icon: <BarChart3 className="h-4 w-4" />, label: 'View Analytics', action: 'analytics', color: 'bg-purple-600' },
    { icon: <Target className="h-4 w-4" />, label: 'Create Campaign', action: 'create-campaign', color: 'bg-orange-600' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`${action.color} text-white p-3 rounded-lg flex items-center space-x-3 hover:opacity-90 transition-opacity`}
          >
            {action.icon}
            <span className="font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Recent Leads Table Component
const RecentLeadsTable = ({ leads }: { leads: any[] }) => {
  const mockLeads = [
    { id: 1, name: 'Rajesh Kumar', company: 'SteelCorp Industries', source: 'LinkedIn', status: 'NEW', createdAt: '2024-01-30' },
    { id: 2, name: 'Priya Sharma', company: 'Textile Solutions', source: 'GST Scraping', status: 'CONTACTED', createdAt: '2024-01-30' },
    { id: 3, name: 'Amit Patel', company: 'Manufacturing Hub', source: 'Medium', status: 'QUALIFIED', createdAt: '2024-01-29' }
  ];

  const displayLeads = leads.length > 0 ? leads : mockLeads;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Leads</h3>
      <div className="space-y-3">
        {displayLeads.slice(0, 5).map((lead) => (
          <div key={lead.id} className="flex justify-between items-center p-3 border rounded">
            <div>
              <p className="font-medium">{lead.name}</p>
              <p className="text-sm text-gray-600">{lead.company}</p>
            </div>
            <div className="text-right">
              <span className={`px-2 py-1 rounded-full text-xs ${
                lead.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                lead.status === 'CONTACTED' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {lead.status}
              </span>
              <p className="text-xs text-gray-500 mt-1">{lead.source}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Campaign Performance Table Component
const CampaignPerformanceTable = ({ campaigns }: { campaigns: any[] }) => {
  const mockCampaigns = [
    { id: 1, name: 'GST Directory Outreach', type: 'gst-scraping', status: 'ACTIVE', targetCount: 1500, completedCount: 847, responseCount: 152, signupCount: 89 },
    { id: 2, name: 'LinkedIn Factory Owners', type: 'linkedin', status: 'ACTIVE', targetCount: 800, completedCount: 623, responseCount: 112, signupCount: 67 },
    { id: 3, name: 'WhatsApp Business API', type: 'whatsapp', status: 'PAUSED', targetCount: 500000, completedCount: 150000, responseCount: 4500, signupCount: 340 }
  ];

  const displayCampaigns = campaigns.length > 0 ? campaigns : mockCampaigns;

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Marketing Campaigns</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responses</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signups</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayCampaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 capitalize">{campaign.type.replace('-', ' ')}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    campaign.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {campaign.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {campaign.completedCount}/{campaign.targetCount}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(campaign.completedCount / campaign.targetCount) * 100}%` }}
                    ></div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {campaign.responseCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {campaign.signupCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 