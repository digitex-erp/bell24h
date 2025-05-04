import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Home, 
  FileText, 
  Clock, 
  Users, 
  BarChart2, 
  PieChart, 
  Settings,
  Zap,
  Menu,
  X,
  Mic
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navigation: NavSection[] = [
    {
      title: "Main",
      items: [
        { label: "Dashboard", icon: <Home className="h-5 w-5" />, href: "/dashboard" },
        { label: "My RFQs", icon: <FileText className="h-5 w-5" />, href: "/rfq/list" },
        { label: "Quote Responses", icon: <Clock className="h-5 w-5" />, href: "/quotes" },
        { label: "Suppliers", icon: <Users className="h-5 w-5" />, href: "/suppliers" },
        { label: "Voice Assistant", icon: <Mic className="h-5 w-5" />, href: "/voice-assistant" },
      ]
    },
    {
      title: "Analytics",
      items: [
        { label: "Trading Analytics", icon: <BarChart2 className="h-5 w-5" />, href: "/analytics" },
        { label: "Market Insights", icon: <PieChart className="h-5 w-5" />, href: "/insights" },
      ]
    },
    {
      title: "Settings",
      items: [
        { label: "Account Settings", icon: <Settings className="h-5 w-5" />, href: "/settings" },
      ]
    }
  ];

  // Get the user's initials for the avatar
  const getInitials = () => {
    if (!user || !user.username) return "U";
    return user.username.substring(0, 2).toUpperCase();
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <aside className={cn(
      "bg-neutral-900 text-white md:w-64 w-full md:fixed md:h-full md:overflow-y-auto z-10 transition-all duration-300 ease-in-out",
      isOpen ? "fixed inset-0 z-50" : "relative md:relative"
    )}>
      <div className="p-4 border-b border-neutral-700">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-primary-light" />
            <span className="text-xl font-bold">Bell24h</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-neutral-300 hover:text-white"
            onClick={toggleSidebar}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      
      <nav className={cn("p-2", !isOpen && "hidden md:block")}>
        {navigation.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <div className="pt-2 pb-1 text-xs text-neutral-400 font-semibold px-3 uppercase tracking-wider">
              {section.title}
            </div>

            {section.items.map((item, itemIndex) => (
              <Link 
                key={itemIndex} 
                href={item.href}
                onClick={() => setIsOpen(false)}
              >
                <a className={cn(
                  "flex items-center p-3 mb-1 rounded-lg",
                  location === item.href
                    ? "text-white bg-primary-dark"
                    : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                )}>
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </a>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className={cn("p-4 mt-4 border-t border-neutral-700", !isOpen && "hidden md:block")}>
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-white">{user?.companyName || 'User'}</p>
            <p className="text-xs text-neutral-400">{user?.role === 'buyer' ? 'Procurement Manager' : user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
