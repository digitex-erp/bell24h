import React from 'react';
import { useNotificationsContext } from '@/hooks/use-notifications';
import {
  Bell,
  Check,
  Info,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  X,
  Settings,
  Mail,
  BellOff
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { alertService } from '@/services/AlertService';

// Component for the notification icon with badge
const NotificationIcon: React.FC<{ count: number }> = ({ count }) => {
  return (
    <div className="relative">
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
        >
          {count > 9 ? '9+' : count}
        </Badge>
      )}
    </div>
  );
};

// Format timestamp to relative time (e.g., "2 minutes ago")
const formatRelativeTime = (timestamp: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} min${diffMin === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else {
    return timestamp.toLocaleDateString();
  }
};

// Get the icon for a notification type
const getNotificationIcon = (type: string, className: string = 'h-4 w-4') => {
  switch (type) {
    case 'info':
      return <Info className={cn(className, 'text-blue-500')} />;
    case 'success':
      return <CheckCircle className={cn(className, 'text-green-500')} />;
    case 'warning':
      return <AlertTriangle className={cn(className, 'text-amber-500')} />;
    case 'error':
      return <AlertCircle className={cn(className, 'text-red-500')} />;
    default:
      return <Info className={className} />;
  }
};

// Component for a single notification item
const NotificationItem: React.FC<{
  notification: any;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
}> = ({ notification, onMarkAsRead, onRemove }) => {
  return (
    <div 
      className={cn(
        "p-3 mb-1 rounded-md transition-colors",
        notification.read ? "bg-background" : "bg-muted",
        {"border-l-4 border-blue-500": notification.type === 'info' && !notification.read},
        {"border-l-4 border-green-500": notification.type === 'success' && !notification.read},
        {"border-l-4 border-amber-500": notification.type === 'warning' && !notification.read},
        {"border-l-4 border-red-500": notification.type === 'error' && !notification.read}
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-2 items-center">
          {getNotificationIcon(notification.type)}
          <span className="font-medium text-sm">{notification.title}</span>
        </div>
        <div className="flex items-center gap-1">
          {!notification.read && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mark as read</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => onRemove(notification.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Remove</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(notification.timestamp)}
        </span>
        {notification.actionText && notification.onAction && (
          <Button 
            variant="link" 
            className="h-6 p-0 text-xs text-primary" 
            onClick={notification.onAction}
          >
            {notification.actionText}
          </Button>
        )}
      </div>
    </div>
  );
};

// Settings component for notification preferences
const NotificationSettings: React.FC = () => {
  const { muted, email, push } = alertService.getPreferences();
  
  return (
    <div className="p-2 w-[240px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <BellOff className="h-4 w-4" />
          <span className="text-sm">Mute all</span>
        </div>
        <Switch 
          checked={muted} 
          onCheckedChange={(checked) => alertService.toggleMute(checked)} 
        />
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4" />
          <span className="text-sm">Email notifications</span>
        </div>
        <Switch 
          checked={email} 
          onCheckedChange={(checked) => alertService.toggleEmail(checked)} 
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-4 w-4" />
          <span className="text-sm">Push notifications</span>
        </div>
        <Switch 
          checked={push} 
          onCheckedChange={(checked) => alertService.togglePush(checked)} 
        />
      </div>
    </div>
  );
};

// Main notification center component
export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    notificationsVisible,
    toggleNotificationsMenu,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications
  } = useNotificationsContext();
  
  return (
    <DropdownMenu open={notificationsVisible} onOpenChange={toggleNotificationsMenu}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <NotificationIcon count={unreadCount} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[400px]">
        <div className="flex justify-between items-center p-2">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={markAllAsRead}>
                    <Check className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mark all as read</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Settings menu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Settings className="h-4 w-4 mr-2" />
                <span>Settings</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <NotificationSettings />
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </div>
        </div>
        <DropdownMenuSeparator />
        
        <div className="overflow-y-auto max-h-[320px] p-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">You have no notifications</p>
            </div>
          ) : (
            <>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onRemove={removeNotification}
                />
              ))}
            </>
          )}
        </div>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="justify-center text-sm text-muted-foreground"
              onClick={clearNotifications}
            >
              Clear all
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationCenter;