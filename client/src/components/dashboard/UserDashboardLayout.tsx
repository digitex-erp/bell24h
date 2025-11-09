'use client';

import React from 'react';

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}

