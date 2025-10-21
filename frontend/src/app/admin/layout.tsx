import React from 'react'

export const metadata = {
  title: 'Admin - Bell24h'
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <h1 className="text-lg font-semibold">Bell24h Admin</h1>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-6">{children}</main>
    </div>
  )
}
