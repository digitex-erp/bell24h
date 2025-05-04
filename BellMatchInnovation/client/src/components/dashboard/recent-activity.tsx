import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatTimeAgo } from '@/lib/utils';

interface ActivityItem {
  id: number;
  type: 'message' | 'rfq' | 'quote' | 'payment' | 'market';
  title: string;
  timestamp: string;
  reference?: string;
  referenceId?: number;
}

const RecentActivity = () => {
  // Fetch recent activity
  const { data: activities, isLoading } = useQuery<ActivityItem[]>({
    queryKey: ['/api/activity/recent'],
    refetchOnWindowFocus: false,
    refetchInterval: 60000, // Refresh every minute
  });

  // Get the appropriate icon for each activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <i className="fas fa-comment-dots"></i>;
      case 'rfq':
        return <i className="fas fa-check-circle"></i>;
      case 'quote':
        return <i className="fas fa-file-invoice"></i>;
      case 'payment':
        return <i className="fas fa-wallet"></i>;
      case 'market':
        return <i className="fas fa-bell"></i>;
      default:
        return <i className="fas fa-circle"></i>;
    }
  };

  // Get the appropriate color for each activity type
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-primary-100 text-primary-600';
      case 'rfq':
        return 'bg-success-100 text-success-600';
      case 'quote':
        return 'bg-primary-100 text-primary-600';
      case 'payment':
        return 'bg-gray-100 text-gray-600';
      case 'market':
        return 'bg-warning-100 text-warning-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Mock data in case the API is not implemented yet
  const defaultActivities: ActivityItem[] = [
    {
      id: 1,
      type: 'message',
      title: 'New message from TechnoElectro Industries',
      timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    },
    {
      id: 2,
      type: 'rfq',
      title: 'RFQ #RF238 was accepted',
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      reference: '#RF238',
      referenceId: 238,
    },
    {
      id: 3,
      type: 'market',
      title: 'Market price alert for PCB Components',
      timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    {
      id: 4,
      type: 'payment',
      title: 'Shipment #SH123 is in transit',
      timestamp: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
      reference: '#SH123',
      referenceId: 123,
    },
  ];

  const activityData = activities || defaultActivities;

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
        <p className="text-sm text-gray-500">Latest updates and notifications</p>
      </div>
      
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex space-x-3 animate-pulse">
                <div className="flex-shrink-0">
                  <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"></span>
                </div>
                <div className="w-full">
                  <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activityData.length > 0 ? (
          <div className="space-y-4">
            {activityData.map((activity) => (
              <div key={activity.id} className="flex space-x-3">
                <div className="flex-shrink-0">
                  <span className={`w-8 h-8 rounded-full ${getActivityColor(activity.type)} flex items-center justify-center`}>
                    {getActivityIcon(activity.type)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-800">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No recent activity</p>
          </div>
        )}
        
        <button className="mt-4 w-full text-center text-sm text-primary-600 hover:text-primary-800 font-medium">
          View All Activity
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;
