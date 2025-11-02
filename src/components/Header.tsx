"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Bell24h</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/rfq"
              className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
            >
              RFQs
            </Link>
            <Link
              href="/suppliers"
              className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Suppliers
            </Link>
            <Link
              href="/buyer"
              className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Buyer Dashboard
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/register">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

