import { useState } from "react";
import { User } from "@shared/schema";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface AppShellProps {
  user: User;
  children: React.ReactNode;
  onLogout: () => void;
}

export default function AppShell({ user, children, onLogout }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-4 flex justify-between items-center md:hidden">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-md mr-2 bg-primary-500 flex items-center justify-center text-white font-bold">
            B24
          </div>
          <h1 className="text-lg font-bold text-neutral-800">Bell24h</h1>
        </div>
        <button
          onClick={toggleSidebar}
          className="text-gray-500 focus:outline-none"
          aria-label="Open menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </header>

      {/* Mobile Sidebar (Overlay) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={toggleSidebar}
            aria-hidden="true"
          ></div>
          <div className="fixed inset-y-0 left-0 flex flex-col w-80 max-w-sm bg-white z-50">
            <Sidebar user={user} onLogout={onLogout} />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <Sidebar user={user} onLogout={onLogout} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        <Header user={user} onLogout={onLogout} toggleSidebar={toggleSidebar} />
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
