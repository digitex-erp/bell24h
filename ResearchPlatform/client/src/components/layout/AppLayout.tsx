import React from "react";
import { Link, useLocation } from "wouter";
import { PageTransition } from "@/components/ui/micro-interactions";
import { Home, BarChart4, Bell, User, Headphones, TrendingUp, Tags, Globe, AlertCircle, Volume2, Sparkles, LineChart } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b shadow-sm bg-background">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <div className="font-bold text-xl text-primary flex items-center cursor-pointer">
                <Bell className="mr-2 h-6 w-6" />
                <span>Bell24h</span>
              </div>
            </Link>
          </div>
          <nav className="hidden md:flex space-x-4">
            <NavLink href="/" icon={<Home size={18} />} label="Home" currentPath={location} />
            <NavLink href="/dashboard" icon={<BarChart4 size={18} />} label="Dashboard" currentPath={location} />
            <NavLink href="/voice-rfq" icon={<Headphones size={18} />} label="Voice RFQ" currentPath={location} />
            <NavLink href="/industry-trends" icon={<TrendingUp size={18} />} label="Industry Trends" currentPath={location} />
            <NavLink href="/global-trade-insights" icon={<Globe size={18} />} label="Global Trade" currentPath={location} />
            <NavLink href="/stock-analysis" icon={<LineChart size={18} />} label="Stock Analysis" currentPath={location} />
            <NavLink href="/rfq-categorization" icon={<Tags size={18} />} label="RFQ Categorization" currentPath={location} />
            <NavLink href="/gemini-ai" icon={<Sparkles size={18} />} label="Gemini AI" currentPath={location} />
            <NavLink href="/alerts" icon={<AlertCircle size={18} />} label="Alerts" currentPath={location} />
            <NavLink href="/audio-test" icon={<Volume2 size={18} />} label="Audio Test" currentPath={location} />
          </nav>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-muted transition-colors">
              <Bell size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-muted transition-colors">
              <User size={20} />
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 bg-muted/30">
        <PageTransition location={location} transitionType="fade">
          {children}
        </PageTransition>
      </main>
      
      <footer className="border-t py-6 bg-background">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Bell24h Marketplace. All rights reserved.</p>
          <div className="flex justify-center mt-4 space-x-6">
            <Link href="/privacy">
              <span className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</span>
            </Link>
            <Link href="/terms">
              <span className="hover:text-primary transition-colors cursor-pointer">Terms of Service</span>
            </Link>
            <Link href="/contact">
              <span className="hover:text-primary transition-colors cursor-pointer">Contact Us</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  currentPath: string;
}

function NavLink({ href, icon, label, currentPath }: NavLinkProps) {
  const isActive = currentPath === href;
  
  return (
    <Link href={href}>
      <div 
        className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors cursor-pointer ${
          isActive 
            ? 'bg-primary/10 text-primary font-medium' 
            : 'hover:bg-muted'
        }`}
      >
        {icon}
        <span>{label}</span>
      </div>
    </Link>
  );
}