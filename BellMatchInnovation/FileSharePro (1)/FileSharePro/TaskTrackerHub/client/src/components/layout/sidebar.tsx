import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";

import {
  Home,
  FileText,
  Users,
  BarChart3,
  CreditCard,
  FileBarChart,
  Lightbulb,
  Tag,
  TrendingUp,
  Mic
} from "lucide-react";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function SidebarItem({ href, icon, label, active }: SidebarItemProps) {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center px-4 py-2 text-dark-600 rounded-md hover:bg-dark-100",
          active && "bg-primary-50 text-primary-700"
        )}
      >
        {icon}
        {label}
      </a>
    </Link>
  );
}

export default function Sidebar() {
  const [location] = useLocation();
  const isMobile = useMobile();
  const [isOpen, setIsOpen] = useState(false);
  
  if (isMobile && !isOpen) {
    return null;
  }
  
  return (
    <aside className={cn(
      "bg-white border-r border-dark-200",
      isMobile ? "absolute z-30 inset-y-0 left-0 w-64" : "hidden md:flex md:flex-shrink-0"
    )}>
      <div className="flex flex-col w-64">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-dark-200">
          <span className="text-2xl font-bold font-heading text-primary-600">Bell24h</span>
          
          {isMobile && (
            <button
              className="absolute top-4 right-4 p-1"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-6 h-6 text-dark-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          )}
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          <SidebarItem 
            href="/" 
            icon={<Home className="w-5 h-5 mr-3" />} 
            label="Dashboard" 
            active={location === "/"}
          />
          
          <SidebarItem 
            href="/rfqs" 
            icon={<FileText className="w-5 h-5 mr-3" />} 
            label="RFQs" 
            active={location === "/rfqs"}
          />
          
          <SidebarItem 
            href="/suppliers" 
            icon={<Users className="w-5 h-5 mr-3" />} 
            label="Suppliers" 
            active={location === "/suppliers"}
          />
          
          <SidebarItem 
            href="/analytics" 
            icon={<BarChart3 className="w-5 h-5 mr-3" />} 
            label="Analytics" 
            active={location === "/analytics"}
          />
          
          <SidebarItem 
            href="/payments" 
            icon={<CreditCard className="w-5 h-5 mr-3" />} 
            label="Payments" 
            active={location === "/payments"}
          />
          
          <SidebarItem 
            href="/reports" 
            icon={<FileBarChart className="w-5 h-5 mr-3" />} 
            label="Reports" 
            active={location === "/reports"}
          />
          
          <div className="pt-4 mt-4 border-t border-dark-200">
            <h3 className="px-4 py-2 text-xs font-semibold text-dark-500 uppercase">AI Features</h3>
            
            <SidebarItem 
              href="/supplier-insights" 
              icon={<Lightbulb className="w-5 h-5 mr-3" />} 
              label="Supplier Insights" 
              active={location === "/supplier-insights"}
            />
            
            <SidebarItem 
              href="/risk-scoring" 
              icon={<Tag className="w-5 h-5 mr-3" />} 
              label="Risk Scoring" 
              active={location === "/risk-scoring"}
            />
            
            <SidebarItem 
              href="/market-trends" 
              icon={<TrendingUp className="w-5 h-5 mr-3" />} 
              label="Market Trends" 
              active={location === "/market-trends"}
            />
            
            <SidebarItem 
              href="/voice-assistant" 
              icon={<Mic className="w-5 h-5 mr-3" />} 
              label="Voice Assistant" 
              active={location === "/voice-assistant"}
            />
          </div>
        </nav>
      </div>
    </aside>
  );
}
