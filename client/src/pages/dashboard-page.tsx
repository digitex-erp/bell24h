import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRFQs } from '@/hooks/use-rfqs';
import { useMessages } from '@/hooks/use-messages';
import { MainLayout } from '@/components/layout/main-layout';
import { StatsCard } from '@/components/dashboard/stats-card';
import { RFQTable } from '@/components/dashboard/rfq-table';
import { MessagesList } from '@/components/dashboard/messages-list';
import { SupplierRiskChart } from '@/components/dashboard/supplier-risk-chart';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { CreateRFQForm } from '@/components/rfq/create-rfq-form';
import { FileText, ListFilter, FileCheck, MessageSquare, Wallet, Plus, ListChecks, ChartBar, UserCheck } from 'lucide-react';
import { useNavigate } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [location, navigate] = useNavigate();
  const { user } = useAuth();
  const { rfqs, isLoadingRFQs } = useRFQs();
  const { getMessages } = useMessages();
  const { data: messages = [], isLoading: isLoadingMessages } = getMessages();
  const [isCreateRFQOpen, setIsCreateRFQOpen] = useState(false);

  // Format messages for the MessagesList component
  const formattedMessages = messages.slice(0, 3).map(message => ({
    id: message.id,
    sender: {
      id: message.sender_id,
      username: message.sender_id === user?.id ? 'You' : 'User ' + message.sender_id, // In a real app, fetch the username
      company_name: '',
    },
    content: message.content,
    created_at: message.created_at,
  }));

  // Sample supplier risk data for the chart
  const supplierRiskData = [
    { name: 'TechSolutions Ltd', riskScore: 15, onTimeDelivery: 92 },
    { name: 'MegaSupplies Inc', riskScore: 25, onTimeDelivery: 78 },
    { name: 'Acme Manufacturing', riskScore: 18, onTimeDelivery: 88 },
    { name: 'Global Logistics', riskScore: 30, onTimeDelivery: 72 },
    { name: 'QuickShip Partners', riskScore: 22, onTimeDelivery: 80 },
  ];

  // Quick actions
  const quickActions = [
    { 
      title: 'Create New RFQ', 
      icon: <Plus />,
      onClick: () => setIsCreateRFQOpen(true)
    },
    { 
      title: 'Review Active Bids', 
      icon: <ListFilter />, 
      onClick: () => navigate('/bids')
    },
    { 
      title: 'Add Funds to Wallet', 
      icon: <Wallet />, 
      onClick: () => navigate('/wallet')
    },
    { 
      title: 'View Analytics Reports', 
      icon: <ChartBar />, 
      onClick: () => navigate('/analytics')
    },
    { 
      title: 'Update Company Profile', 
      icon: <UserCheck />, 
      onClick: () => navigate('/settings')
    },
  ];

  return (
    <MainLayout
      title="Dashboard"
      description={`Welcome back, ${user?.username}! Here's an overview of your marketplace activity.`}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active RFQs"
          value={isLoadingRFQs ? <Skeleton className="h-6 w-16" /> : rfqs.filter(rfq => rfq.status === 'open').length}
          icon={<FileText className="h-6 w-6 text-primary-600" />}
          linkText="View all"
          linkHref="/rfqs"
          onClick={() => navigate('/rfqs')}
        />
        
        <StatsCard
          title="Bids Received"
          value={28} // This would come from an API in a real implementation
          icon={<ListFilter className="h-6 w-6 text-primary-600" />}
          linkText="View all"
          linkHref="/bids"
          onClick={() => navigate('/bids')}
        />
        
        <StatsCard
          title="Active Contracts"
          value={5} // This would come from an API in a real implementation
          icon={<FileCheck className="h-6 w-6 text-primary-600" />}
          linkText="View all"
          linkHref="/contracts"
          onClick={() => navigate('/contracts')}
        />
        
        <StatsCard
          title="Wallet Balance"
          value={user?.wallet_balance ? `₹${user.wallet_balance}` : '₹0'}
          icon={<Wallet className="h-6 w-6 text-primary-600" />}
          linkText="View transactions"
          linkHref="/wallet"
          onClick={() => navigate('/wallet')}
        />
      </div>
      
      {/* RFQs and Messages */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RFQTable 
            rfqs={rfqs.slice(0, 4)} 
            onCreateNew={() => setIsCreateRFQOpen(true)}
            onViewAll={() => navigate('/rfqs')}
          />
        </div>
        
        <div>
          <MessagesList 
            messages={formattedMessages}
            onViewAll={() => navigate('/messages')}
          />
        </div>
      </div>
      
      {/* Supplier Risk Chart and Quick Actions */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SupplierRiskChart data={supplierRiskData} />
        </div>
        
        <div>
          <QuickActions actions={quickActions} />
        </div>
      </div>
      
      {/* Create RFQ Modal */}
      <CreateRFQForm
        isOpen={isCreateRFQOpen}
        onClose={() => setIsCreateRFQOpen(false)}
      />
    </MainLayout>
  );
}
