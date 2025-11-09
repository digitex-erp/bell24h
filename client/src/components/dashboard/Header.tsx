'use client';

import React from 'react';

export default function Header() {
  return (
    <header className="bg-white shadow p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Welcome Back</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Dashboard</span>
        </div>
      </div>
    </header>
  );
}

