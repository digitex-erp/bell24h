'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface User {
  id?: string;
  name?: string;
  email?: string;
}

interface UserDashboardLayoutProps {
  children: React.ReactNode;
  user?: User;
}

export default function UserDashboardLayout({ children, user }: UserDashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

