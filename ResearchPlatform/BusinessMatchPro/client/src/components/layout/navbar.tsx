import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Bell,
  Wallet,
  Menu,
  User as UserIcon,
  Settings,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { WebSocketStatus } from "@/components/ui/websocket-status";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Marketplace", href: "/suppliers" },
    { name: "Submit RFQ", href: "/rfq" },
    { name: "Find Suppliers", href: "/suppliers" },
  ];

  // Log out the user
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get the user's initials for the avatar
  const getInitials = () => {
    if (!user || !user.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a className="flex items-center">
                  <svg
                    className="h-8 w-8 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 8a6 6 0 0 0-9.33-5"></path>
                    <path d="m10 2 1 2-1 2"></path>
                    <path d="M2 2a3 3 1 0 0 4 1.8"></path>
                    <circle cx="12" cy="12" r="7"></circle>
                    <path d="m12 8 2 2"></path>
                    <path d="m12 12 2 2"></path>
                    <path d="m12 16 2 2"></path>
                  </svg>
                  <span className="ml-2 text-xl font-bold text-primary font-heading">
                    Bell24h
                  </span>
                </a>
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href} className={`${
                      location === link.href
                        ? "border-primary text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {user ? (
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <WebSocketStatus className="mr-2" />

              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              </Button>

              <Link href="/wallet" className="p-1">
                <Button variant="ghost" size="icon" asChild>
                  <Wallet className="h-5 w-5" />
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="ml-2 p-1 rounded-full focus:outline-none"
                  >
                    <Avatar>
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href="/dashboard">
                    <DropdownMenuItem asChild>
                      <a className="cursor-pointer">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </a>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <Link href="/auth" className="p-1">
                <Button variant="ghost" asChild>
                  Sign in
                </Button>
              </Link>
              <Link href="/auth" className="p-1">
                <Button className="ml-3" asChild>
                  Register
                </Button>
              </Link>
            </div>
          )}

          <div className="-mr-2 flex items-center sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className={`${
                    location === link.href
                      ? "bg-primary-50 border-primary text-primary-700"
                      : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`} onClick={() => setMobileMenuOpen(false)}>
                {link.name}
              </Link>
            ))}
          </div>

          {user ? (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <Avatar>
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user.name}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {user.email}
                  </div>
                </div>
                <WebSocketStatus className="mx-2" />
                <Button variant="ghost" size="icon" className="ml-auto">
                  <Bell className="h-6 w-6" />
                </Button>
              </div>
              <div className="mt-3 space-y-1">
                <Link href="/dashboard" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link href="/wallet" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>
                  Wallet
                </Link>
                <a
                  href="#"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Settings
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Sign out
                </a>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex flex-col space-y-3 px-4">
                <Link href="/auth" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    className="w-full"
                    asChild
                  >
                    Register
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}