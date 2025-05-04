import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  BarChart, 
  MessageSquare, 
  FileText, 
  ShoppingBag, 
  Home, 
  Wallet, 
  MicVocal,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import { useState } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logout = () => {
    logoutMutation.mutate();
  };

  const navigationItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'RFQs', href: '/rfqs', icon: FileText },
    { name: 'Bids', href: '/bids', icon: ShoppingBag },
    { name: 'Contracts', href: '/contracts', icon: FileText },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Wallet', href: '/wallet', icon: Wallet },
    { name: 'Analytics', href: '/analytics', icon: BarChart },
    { name: 'Voice Analytics', href: '/voice-analytics', icon: MicVocal },
  ];

  const MobileNavigation = () => (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <div className="flex flex-col h-full">
          <div className="border-b p-4 flex items-center justify-between">
            <div className="font-semibold text-lg">Bell24h</div>
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>
          <nav className="flex flex-col flex-1 overflow-y-auto px-2 py-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <SheetClose asChild>
                    <a
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </a>
                  </SheetClose>
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-4">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user?.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium">{user?.username}</p>
              </div>
            </div>
            <SheetClose asChild>
              <Button
                variant="outline"
                className="mt-3 w-full justify-start"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r">
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex items-center h-16 px-4 border-b">
            <h1 className="text-xl font-bold">Bell24h</h1>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-4">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user?.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium">{user?.username}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="mt-3 w-full justify-start"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden border-b sticky top-0 z-10 bg-background">
        <div className="flex items-center justify-between px-4 h-16">
          <MobileNavigation />
          <h1 className="text-xl font-bold">Bell24h</h1>
          <div className="w-8" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 md:pl-64">
        <main className="flex-1 pb-10">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;