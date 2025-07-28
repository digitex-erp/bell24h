import { useState } from 'react';
import { useRFQs } from '@/hooks/use-rfqs';
import { MainLayout } from '@/components/layout/main-layout';
import { RFQTable } from '@/components/dashboard/rfq-table';
import { MessagesList } from '@/components/dashboard/messages-list';
import { useNavigate } from 'wouter';

// Icons from lucide-react
import * as LucideIcons from 'lucide-react';

type LucideIconProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string;
};

// Create a wrapper component for each icon to handle the size prop
const createIconComponent = (IconComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>) => {
  return ({ size = 20, ...props }: LucideIconProps) => (
    <IconComponent width={size} height={size} {...props} />
  );
};

// Create typed icon components
const FileText = createIconComponent(LucideIcons.FileText);
const Filter = createIconComponent(LucideIcons.Filter);
const FileCheck = createIconComponent(LucideIcons.FileCheck);
const Wallet = createIconComponent(LucideIcons.Wallet);
const Plus = createIconComponent(LucideIcons.Plus);
const BarChart2 = createIconComponent(LucideIcons.BarChart2);
const User = createIconComponent(LucideIcons.User);

// interface RFQ {
//   id: string;
//   title: string;
//   description?: string;
//   status: string;
//   // Add other RFQ properties as needed
// }

interface DashboardPageProps {}

export default function DashboardPage({}: DashboardPageProps) {
  const navigate = useNavigate();
  const { rfqs = [] } = useRFQs();
  const [isCreateRFQOpen, setIsCreateRFQOpen] = useState(false);

  // const handleExplainRFQ = async (rfq: RFQ) => {
  //   // Implementation for explaining RFQ
  //   console.log('Explaining RFQ:', rfq.id);
  // };

  const stats = [
    { icon: <FileText size={20} />, title: 'Total RFQs', value: '24', change: '+12%' },
    { icon: <Filter size={20} />, title: 'In Progress', value: '8', change: '+2%' },
    { icon: <FileCheck size={20} />, title: 'Completed', value: '12', change: '+5%' },
    { icon: <Wallet size={20} />, title: 'Total Value', value: '$24,500', change: '+8%' },
    { icon: <BarChart2 size={20} />, title: 'Avg. Response', value: '2.4 days', change: '-0.5' },
    { icon: <User size={20} />, title: 'Suppliers', value: '42', change: '+3%' },
  ];

  // const handleSearch = (query: string) => {
  //   console.log('Search query:', query);
  //   // Implement search logic
  // };

  // const supplierRiskData = [
  //   { name: 'TechSolutions Ltd', riskScore: 15, onTimeDelivery: 92 },
  //   { name: 'MegaSupplies Inc', riskScore: 25, onTimeDelivery: 78 },
  //   { name: 'Acme Manufacturing', riskScore: 18, onTimeDelivery: 88 },
  //   { name: 'Global Logistics', riskScore: 30, onTimeDelivery: 72 },
  //   { name: 'QuickShip Partners', riskScore: 22, onTimeDelivery: 80 },
  // ];

  // Quick actions
  const quickActions = [
    { 
      title: 'Create New RFQ', 
      icon: <Plus size={20} />,
      onClick: () => setIsCreateRFQOpen(true)
    },
    { 
      title: 'Review Active Bids', 
      icon: <Filter size={20} />, 
      onClick: () => navigate('/bids')
    },
    { 
      title: 'View Wallet', 
      icon: <Wallet size={20} />, 
      onClick: () => navigate('/wallet')
    },
    { 
      title: 'View Analytics', 
      icon: <BarChart2 size={20} />, 
      onClick: () => navigate('/analytics')
    },
    { 
      title: 'Account Settings', 
      icon: <User size={20} />, 
      onClick: () => navigate('/settings')
    },
  ];

  return (
    <MainLayout>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={index} className="p-4 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-full bg-blue-50">
                {stat.icon}
              </div>
              <span className="text-sm font-medium text-green-600">{stat.change}</span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* RFQs and Messages */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RFQTable 
            rfqs={rfqs.slice(0, 4)} 
            onCreateNew={() => setIsCreateRFQOpen(true)}
            onViewAll={() => navigate('/rfqs')}
          />
          {/* AI Explainability Section */}
          {rfqs.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-2">AI Explanations for Latest RFQ</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {rfqs.length > 0 && (
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium">RFQ Analysis</h3>
                    <p className="text-sm text-gray-600">
                      {rfqs[0].title || 'RFQ Details'}
                    </p>
                    <p className="mt-2 text-sm">
                      {rfqs[0].description || 'No description available'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div>
          <MessagesList 
            messages={[]} // Format messages for the MessagesList component
            onViewAll={() => navigate('/messages')}
          />
        </div>
      </div>
      
      {/* Supplier Risk Chart and Quick Actions */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Supplier Risk Analysis</h2>
            <div className="p-4 border rounded-lg">
              <p>Supplier risk chart will be displayed here</p>
            </div>
          </div>
        </div>
        
        <div>
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 rounded-full bg-blue-50 text-blue-600 mb-2">
                    {action.icon}
                  </div>
                  <span className="text-sm text-center">{action.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Create RFQ Modal */}
      {isCreateRFQOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create New RFQ</h2>
              <button 
                onClick={() => setIsCreateRFQOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4 border rounded">
              <p>RFQ creation form will be displayed here</p>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
