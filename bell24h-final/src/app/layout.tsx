import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bell24h - AI Powered B2B Marketplace',
  description: 'India\'s Leading AI-Powered B2B Marketplace',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 antialiased">
        {children}
      </body>
    </html>
  )
}
