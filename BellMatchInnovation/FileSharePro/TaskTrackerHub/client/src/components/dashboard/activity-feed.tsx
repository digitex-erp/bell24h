import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, BarChart3, Check, CreditCard, FileText } from "lucide-react";
import { useEffect, useState } from "react";

// Activity type definitions
interface ActivityItem {
  id: number;
  userId: number;
  type: string;
  description: string;
  referenceId?: number;
  referenceType?: string;
  createdAt: string;
}

// Helper function to generate relative time string
const getRelativeTimeString = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return diffDays === 1 ? "Yesterday" : `${diffDays} days ago`;
  } else if (diffHours > 0) {
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  } else if (diffMins > 0) {
    return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
  } else {
    return "Just now";
  }
};

// Helper to get icon based on activity type
const getActivityIcon = (type: string) => {
  switch (type) {
    case "quote_submitted":
      return <BarChart3 className="w-4 h-4 text-primary-600" />;
    case "shipment_delivered":
      return <Check className="w-4 h-4 text-green-600" />;
    case "payment_created":
    case "invoice_paid":
      return <CreditCard className="w-4 h-4 text-accent-600" />;
    case "rfq_created":
      return <FileText className="w-4 h-4 text-dark-600" />;
    default:
      return <Activity className="w-4 h-4 text-blue-600" />;
  }
};

// Helper to get background color based on activity type
const getActivityBgColor = (type: string) => {
  switch (type) {
    case "quote_submitted":
      return "bg-primary-100";
    case "shipment_delivered":
      return "bg-green-100";
    case "payment_created":
    case "invoice_paid":
      return "bg-accent-100";
    case "rfq_created":
      return "bg-dark-100";
    default:
      return "bg-blue-100";
  }
};

export default function ActivityFeed() {
  const [formattedActivities, setFormattedActivities] = useState<Array<ActivityItem & { timeAgo: string }>>([]);
  
  // Fetch activity data from API
  const { data: activities, isLoading } = useQuery<ActivityItem[]>({ 
    queryKey: ['/api/activities', { limit: 5 }],
  });

  // Format timestamps to relative time
  useEffect(() => {
    if (activities) {
      const formatted = activities.map(activity => ({
        ...activity,
        timeAgo: getRelativeTimeString(new Date(activity.createdAt))
      }));
      setFormattedActivities(formatted);
    }
  }, [activities]);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-dark-800">Activity Feed</h2>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="py-4 text-center text-dark-500">
              Loading activities...
            </div>
          ) : formattedActivities?.length ? (
            formattedActivities.map((activity) => (
              <div key={activity.id} className="flex">
                <div className="flex-shrink-0">
                  <div className={`flex items-center justify-center w-8 h-8 ${getActivityBgColor(activity.type)} rounded-full`}>
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div className="flex-1 ml-3">
                  <p className="text-sm text-dark-800">
                    {activity.description}
                  </p>
                  <p className="mt-1 text-xs text-dark-500">{activity.timeAgo}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-dark-500">
              No recent activities to display
            </div>
          )}

          {/* View More Link */}
          {formattedActivities?.length > 0 && (
            <div className="pt-2 text-center">
              <a href="#" className="text-sm text-primary-600 hover:text-primary-700">View All Activity</a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
