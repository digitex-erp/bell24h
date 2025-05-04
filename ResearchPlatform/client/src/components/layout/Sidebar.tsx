import { Link, useLocation } from "wouter";
import { 
  BarChart2, 
  Home, 
  Settings, 
  Users, 
  FileText, 
  Globe, 
  CreditCard, 
  Headphones,
  TrendingUp,
  LineChart
} from "lucide-react";

// Navigation item type
type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
};

// Navigation data
const navigationItems: NavItem[] = [
  {
    title: "Home",
    href: "/",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <BarChart2 className="h-5 w-5" />,
  },
  {
    title: "Voice RFQ",
    href: "/voice-rfq",
    icon: <Headphones className="h-5 w-5" />,
    badge: "90%",
  },
  {
    title: "Payments",
    href: "/payments",
    icon: <CreditCard className="h-5 w-5" />,
    badge: "80%",
  },
  {
    title: "GST Validation",
    href: "/gst-validation",
    icon: <FileText className="h-5 w-5" />,
    badge: "100%",
  },
  {
    title: "Global Trade Insights",
    href: "/global-trade-insights",
    icon: <Globe className="h-5 w-5" />,
    badge: "NEW",
  },
  {
    title: "Stock Analysis",
    href: "/stock-analysis",
    icon: <LineChart className="h-5 w-5" />,
    badge: "NEW",
  },
  {
    title: "Industry Trends",
    href: "/industry-trends",
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    title: "Users",
    href: "/users",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

export function MobileMenu() {
  const [location] = useLocation();

  return (
    <div className="h-full flex flex-col bg-background border-r border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mr-2">
            B
          </div>
          <h1 className="text-lg font-semibold text-foreground">Bell24h</h1>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a
              className={`flex items-center px-3 py-2 rounded-md text-sm ${
                location === item.href
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-foreground hover:bg-accent/50 hover:text-accent-foreground"
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.title}</span>
              {item.badge && (
                <span className="ml-auto bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                  {item.badge}
                </span>
              )}
            </a>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-border">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <Users className="h-4 w-4" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-foreground">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@bell24h.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-border lg:bg-background">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mr-2">
              B
            </div>
            <h1 className="text-lg font-semibold text-foreground">Bell24h</h1>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    location === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent/50 hover:text-accent-foreground"
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                      {item.badge}
                    </span>
                  )}
                </a>
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-border p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-foreground">Admin User</p>
              <p className="text-xs text-muted-foreground">admin@bell24h.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
