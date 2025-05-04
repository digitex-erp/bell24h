import { X, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { notifications } = useWebSocket();
  
  // Mock notifications for display
  const [displayNotifications, setDisplayNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'New quote received',
      message: 'SteelTech Industries has submitted a quote for your RFQ #RFQ-2023-001.',
      time: '5 minutes ago',
      read: false
    },
    {
      id: '2',
      type: 'success',
      title: 'RFQ Published Successfully',
      message: 'Your RFQ for Circuit Board Assembly has been published to 10 suppliers.',
      time: '30 minutes ago',
      read: false
    },
    {
      id: '3',
      type: 'info',
      title: 'AI Match Complete',
      message: "We've found 8 suitable suppliers for your Automotive Filters RFQ.",
      time: '2 hours ago',
      read: true
    },
    {
      id: '4',
      type: 'warning',
      title: 'Quote Revision Requested',
      message: 'A supplier has requested clarification on quantities for RFQ #RFQ-2023-010.',
      time: '1 day ago',
      read: true
    }
  ]);

  // Merge real notifications from WebSocket with display notifications
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      // Convert WebSocket notifications to our format and add them to the display list
      // This is a simplified example
      const newNotifications = notifications.map(wsNotification => ({
        id: Math.random().toString(36).substring(2, 9),
        type: 'info' as const,
        title: wsNotification.type,
        message: JSON.stringify(wsNotification.data),
        time: 'just now',
        read: false
      }));
      
      setDisplayNotifications(prev => [...newNotifications, ...prev]);
    }
  }, [notifications]);

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      case 'info':
      default:
        return <Info className="h-6 w-6 text-blue-600" />;
    }
  };

  // Get notification background color based on type
  const getNotificationBackground = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100';
      case 'warning':
        return 'bg-yellow-100';
      case 'info':
      default:
        return 'bg-blue-100';
    }
  };

  return (
    <div className={cn(
      "fixed inset-0 overflow-hidden z-20 pointer-events-none",
      isOpen && "pointer-events-auto"
    )}>
      <div className="absolute inset-0 overflow-hidden">
        <div className={cn(
          "pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10",
          isOpen && "pointer-events-auto"
        )}>
          <div className={cn(
            "pointer-events-auto w-screen max-w-md transform transition ease-in-out duration-500",
            isOpen ? "translate-x-0" : "translate-x-full"
          )}>
            <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">
              <div className="px-4 sm:px-6 py-6 bg-primary-DEFAULT">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-white">Notifications</h2>
                  <div className="ml-3 flex h-7 items-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white hover:text-neutral-200 focus:outline-none"
                      onClick={onClose}
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-neutral-200 overflow-y-auto">
                {displayNotifications.length > 0 ? (
                  displayNotifications.map((notification) => (
                    <div key={notification.id} className="p-4 hover:bg-neutral-50">
                      <div className="flex">
                        <div className="flex-shrink-0 pt-0.5">
                          <div className={`h-10 w-10 rounded-full ${getNotificationBackground(notification.type)} flex items-center justify-center`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-neutral-900">{notification.title}</p>
                          <p className="mt-1 text-sm text-neutral-500">{notification.message}</p>
                          <div className="mt-2 text-xs text-neutral-400">{notification.time}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-neutral-500">No notifications yet</p>
                  </div>
                )}
              </div>
              
              <div className="border-t border-neutral-200 p-4">
                <Button 
                  variant="link" 
                  className="w-full text-center text-sm font-medium text-primary-DEFAULT hover:text-primary-dark"
                >
                  View all notifications
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
