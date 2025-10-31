import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bell24h - Procurement Platform',
  description: 'AI-Powered Procurement and Supplier Matching',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Razorpay Script loaded asynchronously */}
        <script 
          src="https://checkout.razorpay.com/v1/checkout.js" 
          async
          defer
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <main className="min-h-screen bg-background">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
