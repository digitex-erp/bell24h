import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useSelector } from 'react-redux';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user } = useSelector((state: any) => state.auth);

  if (!user) {
    return <div>{children}</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <Navbar user={user} />

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
