import { Link, useLocation } from "wouter";
import { User } from "@shared/schema";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Users, 
  Activity, 
  DollarSign, 
  BarChart, 
  Settings, 
  LogOut
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface SidebarProps {
  user: User;
  onLogout: () => void;
}

const menuItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/my-rfqs", icon: FileText, label: "My RFQs" },
  { href: "/messages", icon: MessageSquare, label: "Messages", badge: 8 },
  { href: "/suppliers", icon: Users, label: "Suppliers" },
  { href: "/analytics", icon: Activity, label: "Analytics" },
  { href: "/payments", icon: DollarSign, label: "Payments" },
  { href: "/trading", icon: BarChart, label: "Trading" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-md mr-3 bg-primary-500 flex items-center justify-center text-white font-bold">
            B24
          </div>
          <h1 className="text-xl font-bold text-neutral-800">Bell24h</h1>
        </div>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a 
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md", 
                location === item.href 
                  ? "bg-primary-50 text-primary-700" 
                  : "text-neutral-700 hover:bg-gray-100"
              )}
            >
              <item.icon 
                className={cn(
                  "mr-3 h-5 w-5", 
                  location === item.href ? "text-primary-500" : "text-neutral-500"
                )} 
              />
              {item.label}
              {item.badge && (
                <span className="ml-auto bg-primary-100 text-primary-800 text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </a>
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-3">
            <AvatarImage src={user.avatar || undefined} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-neutral-800">{user.name}</p>
            <p className="text-xs text-neutral-500">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Account
            </p>
          </div>
          <button 
            onClick={onLogout}
            className="ml-auto text-neutral-400 hover:text-neutral-600 focus:outline-none"
            aria-label="Log out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
