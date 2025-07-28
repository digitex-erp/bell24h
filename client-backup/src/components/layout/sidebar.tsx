import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  FileText, 
  ListFilter, 
  FileCheck, 
  MessageSquare, 
  Wallet, 
  BarChart3, 
  Settings, 
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const isActive = (path: string) => {
    return location === path;
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: Home },
    { name: "My RFQs", path: "/rfqs", icon: FileText },
    { name: "Bids", path: "/bids", icon: ListFilter },
    { name: "Contracts", path: "/contracts", icon: FileCheck },
    { name: "Messages", path: "/messages", icon: MessageSquare },
    { name: "Wallet", path: "/wallet", icon: Wallet },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary-600">Bell24H</h1>
      </div>
      
      <div className="flex flex-col justify-between h-full">
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md group",
                  isActive(item.path)
                    ? "text-white bg-primary-600"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon 
                  className={cn(
                    "w-6 h-6 mr-3",
                    isActive(item.path) ? "text-white" : "text-gray-500"
                  )} 
                />
                {item.name}
              </a>
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">{user?.username}</p>
              <p className="text-xs font-medium text-gray-500">{user?.companyName}</p>
            </div>
          </div>
          
          <div className="mt-3">
            <Button
              variant="outline"
              className="flex items-center justify-center w-full"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {logoutMutation.isPending ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
