import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { RoleProvider } from '@/contexts/RoleContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: "Bell24H - India's #1 Voice & Video RFQ Marketplace",
  description: 'Post RFQs via voice, video, or text. Get bids in 24 hours.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body>
        <AuthProvider>
          <RoleProvider>
            <Header />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </RoleProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
