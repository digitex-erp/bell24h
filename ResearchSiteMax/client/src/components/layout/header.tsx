import { useState } from "react";
import { Bell, ChevronDown, Menu, Plus, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { User as UserType } from "@shared/schema";
import { RfqForm } from "@/components/rfq/rfq-form";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface HeaderProps {
  onSidebarToggle: () => void;
  user: UserType;
  onLogout: () => void;
}

export function Header({ onSidebarToggle, user, onLogout }: HeaderProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isNewRfqOpen, setIsNewRfqOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      type: "success",
      title: "New RFQ matched",
      message: "Your RFQ #92335 has 3 new matching suppliers",
      time: "2 minutes ago",
    },
    {
      id: 2,
      type: "info",
      title: "New message received",
      message: "TechSolutions Corp has sent you a quote",
      time: "1 hour ago",
    },
    {
      id: 3,
      type: "warning",
      title: "RFQ deadline approaching",
      message: "Your RFQ #87221 closes in 24 hours",
      time: "5 hours ago",
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return (
          <div className="inline-block h-8 w-8 rounded-full bg-green-100 text-green-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
        );
      case "info":
        return (
          <div className="inline-block h-8 w-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
        );
      case "warning":
        return (
          <div className="inline-block h-8 w-8 rounded-full bg-yellow-100 text-yellow-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16">
      <div className="flex items-center justify-between px-4 h-full">
        {/* Left: Mobile Menu Toggle Button */}
        <button
          onClick={onSidebarToggle}
          className="text-gray-500 focus:outline-none focus:text-gray-600 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Centered: Search Input */}
        <div className="hidden md:block w-96 mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search for RFQs, suppliers, products..."
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>

        {/* Right: Quick Actions and Notifications */}
        <div className="flex items-center space-x-4">
          {/* Create Button */}
          <DropdownMenu open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="h-5 w-5 mr-2" />
                Create
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setIsNewRfqOpen(true)}>
                New RFQ
              </DropdownMenuItem>
              <DropdownMenuItem>Add Product</DropdownMenuItem>
              <DropdownMenuItem>Create Invoice</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <DropdownMenu open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-6 w-6 text-gray-400" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                Notifications
              </div>
              {notifications.map((notification) => (
                <div key={notification.id} className="px-4 py-3 hover:bg-gray-100 border-b border-gray-100">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-500">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="px-4 py-2 text-center">
                <Button variant="link" size="sm" className="text-xs font-medium text-primary-500">
                  View all notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarFallback className="bg-primary-100 text-primary-800">
                    {user.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Your Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* RFQ Creation Dialog */}
      <Dialog open={isNewRfqOpen} onOpenChange={setIsNewRfqOpen}>
        <DialogContent className="sm:max-w-lg">
          <RfqForm onClose={() => setIsNewRfqOpen(false)} />
        </DialogContent>
      </Dialog>
    </header>
  );
}
