import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function MainLayout({ children, title, description }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <Header onMenuClick={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          {/* Page title and description */}
          {(title || description) && (
            <div className="mb-6">
              {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
              {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
            </div>
          )}
          
          {/* Main content */}
          {children}
        </main>
      </div>
    </div>
  );
}
