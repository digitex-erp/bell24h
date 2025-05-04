import { ReactNode } from "react";
import Sidebar from "./sidebar";
import TopNav from "./top-nav";
import { useMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useMobile();
  
  return (
    <div className="flex h-screen overflow-hidden bg-dark-50 font-sans text-dark-800">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav />
        
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
