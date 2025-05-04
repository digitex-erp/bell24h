import { useEffect, useState } from "react";
import { Bell, MessageCircle, ChevronDown, Menu } from "lucide-react";
import { User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";
import { Notification } from "../../types";

interface HeaderProps {
  user: User;
  onLogout: () => void;
  toggleSidebar: () => void;
}

const pageTitleMap: Record<string, string> = {
  "/": "Dashboard",
  "/my-rfqs": "My RFQs",
  "/messages": "Messages",
  "/suppliers": "Suppliers",
  "/analytics": "Analytics",
  "/payments": "Payments",
  "/settings": "Settings",
};

export default function Header({ user, onLogout, toggleSidebar }: HeaderProps) {
  const [location] = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Mock notifications - would be fetched from API in production
  useEffect(() => {
    setNotifications([
      {
        id: '1',
        type: 'quote',
        title: 'New Quote Received',
        content: 'TechSupply Solutions has submitted a quote for your RFQ: "Industrial Sensors and Control Systems"',
        createdAt: new Date(),
        read: false,
        link: '/my-rfqs',
      },
      {
        id: '2',
        type: 'message',
        title: 'New Message',
        content: 'Hello, I have reviewed your RFQ for industrial sensors. We have exactly what you need...',
        createdAt: new Date(Date.now() - 30 * 60000),
        read: false,
        link: '/messages',
        senderId: 2,
      }
    ]);
  }, []);

  const pageTitle = pageTitleMap[location] || "Not Found";

  return (
    <div className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="text-gray-500 md:hidden mr-4"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold text-neutral-800">{pageTitle}</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <DropdownMenu
          open={notificationsOpen}
          onOpenChange={setNotificationsOpen}
        >
          <DropdownMenuTrigger asChild>
            <button className="text-neutral-500 hover:text-neutral-700 focus:outline-none relative">
              <Bell className="h-6 w-6" />
              {hasUnreadNotifications && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary-600 badge-pulse"></span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} asChild>
                  <Link href={notification.link || "#"}>
                    <a className="flex flex-col w-full px-4 py-2 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{notification.title}</span>
                        <span className="text-xs text-gray-500">
                          {notification.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
                    </a>
                  </Link>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-center text-gray-500">
                No notifications
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/notifications">
                <a className="w-full text-center text-primary-600 font-medium">View all notifications</a>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="relative">
          <button className="text-neutral-500 hover:text-neutral-700 focus:outline-none">
            <MessageCircle className="h-6 w-6" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary-600 badge-pulse"></span>
          </button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center text-sm font-medium text-neutral-700 hover:text-neutral-900 focus:outline-none gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar || undefined} alt={user.name || user.username} />
                <AvatarFallback>{getInitials(user.name || user.username)}</AvatarFallback>
              </Avatar>
              <span className="hidden md:block">{user.name || user.username}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <a>Profile</a>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings/preferences">
                <a>Preferences</a>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
