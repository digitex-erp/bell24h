import React, { useState } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import { useQuery } from "@tanstack/react-query";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch user data
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['/api/users/me'],
    refetchOnWindowFocus: false,
  });

  // Fetch notifications count
  const { data: notificationsData } = useQuery({
    queryKey: ['/api/notifications/count'],
    refetchOnWindowFocus: false,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch unread messages count
  const { data: messagesData } = useQuery({
    queryKey: ['/api/messages/unread-count'],
    refetchOnWindowFocus: false,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const user = userData?.user || {
    name: "Guest User",
    firstName: "Guest",
    role: "Visitor",
  };

  const notificationsCount = notificationsData?.count || 0;
  const messagesCount = messagesData?.count || 0;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          ></div>
          <div className="fixed inset-y-0 left-0 z-40 w-64 bg-white">
            <Sidebar user={user} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <Sidebar user={user} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={user}
          onToggleSidebar={toggleSidebar}
          notifications={notificationsCount}
          messages={messagesCount}
        />
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {userLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
