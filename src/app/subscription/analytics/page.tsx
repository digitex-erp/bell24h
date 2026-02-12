import SubscriptionAnalytics from '@/components/subscription-analytics';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subscription Analytics - Bell24H',
  description: 'Monitor subscription performance, revenue metrics, and user engagement',
};

export default function SubscriptionAnalyticsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Subscription Analytics</h1>
          <p className="text-gray-600">
            Track subscription performance, revenue metrics, and user engagement across Bell24H.
          </p>
        </div>
        
        <SubscriptionAnalytics />
      </div>
    </div>
  );
}