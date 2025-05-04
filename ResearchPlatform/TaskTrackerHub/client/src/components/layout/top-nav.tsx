import { useState } from "react";
import { useMobile } from "@/hooks/use-mobile";
import { Bell, Search, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TopNav() {
  const isMobile = useMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Placeholder user data
  const user = {
    name: "John Doe",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  };
  
  // Notification badge count
  const notificationCount = 3;
  
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-dark-200">
      {isMobile && (
        <div className="flex items-center md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-dark-500 focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </Button>
          <span className="ml-2 text-xl font-bold text-primary-600 md:hidden">Bell24h</span>
        </div>
      )}
      
      <div className="flex-1 max-w-xs ml-4 mr-auto lg:max-w-lg">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-dark-400" />
          </span>
          <Input
            type="text"
            placeholder="Search for RFQs, suppliers..."
            className="pl-10 text-sm bg-dark-100 border border-dark-200"
          />
        </div>
      </div>
      
      <div className="flex items-center">
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="p-2 mx-2 text-dark-500 hover:bg-dark-100"
          >
            <Bell className="w-6 h-6" />
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs text-white bg-accent-500 rounded-full">
                {notificationCount}
              </span>
            )}
          </Button>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 rounded-full focus:outline-none"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <span className="hidden ml-2 text-dark-700 md:block">{user.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
