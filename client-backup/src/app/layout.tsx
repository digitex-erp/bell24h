import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ClientProviders from '@/components/ClientProviders'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
// import { ThemeProvider } from '@/providers/ThemeProvider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bell24H Dashboard',
  description: 'Bell24H Management Dashboard',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetch session server-side
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders session={session}>
          {/* <ThemeProvider> */}
            <Header />
            <main className="pt-16">
              {children}
            </main>
            <Footer />
          {/* </ThemeProvider> */}
        </ClientProviders>
      </body>
    </html>
  )
}

