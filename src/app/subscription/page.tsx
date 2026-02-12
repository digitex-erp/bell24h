import SubscriptionManager from '@/components/subscription-manager';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subscription Management - Bell24H',
  description: 'Manage your Bell24H subscription and upgrade to access premium features',
};

export default function SubscriptionPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
          <p className="text-gray-600">
            Manage your Bell24H subscription, upgrade to access premium features, and track your usage.
          </p>
        </div>
        
        <SubscriptionManager />
      </div>
    </div>
  );
}