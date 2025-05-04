import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FolderClosed, 
  Settings, 
  Terminal, 
  GitBranch, 
  HelpCircle,
  Bus
} from "lucide-react";

interface SidebarProps {
  currentStep: number;
}

export function Sidebar({ currentStep }: SidebarProps) {
  const navigationItems = [
    { 
      name: "Setup Wizard", 
      href: "/setup", 
      icon: LayoutDashboard, 
      current: true, 
      step: -1 
    },
    { 
      name: "Project Files", 
      href: "#", 
      icon: FolderClosed, 
      current: false, 
      step: 1 
    },
    { 
      name: "Environment Setup", 
      href: "#", 
      icon: Settings, 
      current: false, 
      step: 3 
    },
    { 
      name: "Terminal", 
      href: "#", 
      icon: Terminal, 
      current: false, 
      step: 0 
    },
    { 
      name: "GitHub Integration", 
      href: "#", 
      icon: GitBranch, 
      current: false, 
      step: 2 
    },
    { 
      name: "Help & Resources", 
      href: "#", 
      icon: HelpCircle, 
      current: false, 
      step: -1 
    },
  ];

  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-secondary-100 bg-white">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center space-x-2">
              <Bus className="h-6 w-6 text-primary-700" />
              <span className="text-xl font-bold text-primary-900">Bell24h</span>
            </div>
          </div>
          <div className="mt-6 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navigationItems.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    (item.current || item.step === currentStep)
                      ? "bg-primary-50 text-primary-700"
                      : "text-secondary-700 hover:bg-secondary-50",
                    item.step > -1 && item.step > currentStep 
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  )}
                  onClick={(e) => {
                    if (item.step > -1 && item.step > currentStep) {
                      e.preventDefault();
                    }
                  }}
                >
                  <item.icon className={cn(
                    "mr-3 h-5 w-5",
                    (item.current || item.step === currentStep)
                      ? "text-primary-500"
                      : "text-secondary-500"
                  )} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t border-secondary-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700">SH</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-secondary-700">samplinghub@gmail.com</p>
                <p className="text-xs font-medium text-secondary-500">Replit Account</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
