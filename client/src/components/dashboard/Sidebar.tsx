'use client';

import React from 'react';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-purple-900 text-white p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">BELL24h</h2>
        <p className="text-sm text-purple-300">Dashboard</p>
      </div>
      <nav className="space-y-2">
        <Link href="/dashboard" className="block py-2 px-4 rounded hover:bg-purple-800">
          Overview
        </Link>
        <Link href="/rfq" className="block py-2 px-4 rounded hover:bg-purple-800">
          RFQs
        </Link>
        <Link href="/suppliers" className="block py-2 px-4 rounded hover:bg-purple-800">
          Suppliers
        </Link>
      </nav>
    </aside>
  );
}

