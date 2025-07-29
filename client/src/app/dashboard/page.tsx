'use client';

import RoleToggle, {
  BuyerDashboard,
  MSMEDashboard,
  ManufacturerDashboard,
  SupplierDashboard,
} from '@/components/RoleToggle';
import {
  BarChart3,
  Brain,
  Building2,
  CheckCircle,
  Factory,
  FileText,
  LogOut,
  MessageSquare,
  Mic,
  Package,
  Plus,
  Search,
  Shield,
  ShoppingCart,
  Star,
  Target,
  TrendingUp,
  Truck,
  Upload,
  Users,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState<'buyer' | 'supplier' | 'msme' | 'manufacturer'>(
    'buyer'
  );
  const [availableRoles, setAvailableRoles] = useState<
    Array<'buyer' | 'supplier' | 'msme' | 'manufacturer'>
  >(['buyer']);
  const router = useRouter();

  // Live stats for different roles
  const [liveStats, setLiveStats] = useState({
    buyer: {
      activeRFQs: 23,
      pendingQuotes: 8,
      sourcingProjects: 12,
      savedSuppliers: 156,
      monthlySpend: 245000,
      suppliersConnected: 48,
    },
    supplier: {
      activeListings: 15,
      quoteRequests: 34,
      salesOpportunities: 7,
      businessConnections: 89,
      monthlyRevenue: 520000,
      productsListed: 24,
    },
    msme: {
      msmeBenefits: 45000,
      governmentSchemes: 3,
      certificationStatus: 'Valid',
      bulkOrders: 8,
      exportAssistance: 2,
    },
    manufacturer: {
      productionCapacity: 85,
      customOrders: 12,
      qualityScore: 98.5,
      supplyChainPartners: 23,
      technicalSpecs: 45,
    },
  });

  useEffect(() => {
    // Check authentication with retry logic
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth-token');
        const userData = localStorage.getItem('bell24h-user') || localStorage.getItem('user-data');

        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);

            // Set available roles based on user data
            const userRoles = parsedUser.roles || ['buyer'];
            setAvailableRoles(userRoles);
            setCurrentRole(userRoles[0]);

            setIsLoading(false);
            console.log('User authenticated:', parsedUser.email);
          } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('auth-token');
            localStorage.removeItem('bell24h-user');
            localStorage.removeItem('user-data');
          }
        } else {
          console.log('No user data found, showing demo dashboard');
          // Show demo dashboard with all roles available
          setUser({
            email: 'demo@bell24h.com',
            name: 'Demo User',
            role: 'BUYER',
            roles: ['buyer', 'supplier', 'msme', 'manufacturer'],
            trafficTier: 'GOLD',
          });
          setAvailableRoles(['buyer', 'supplier', 'msme', 'manufacturer']);
          setCurrentRole('buyer');
          setIsLoading(false);
        }
      }
    };

    // Initial check
    checkAuth();

    // Retry after a short delay in case localStorage was just set
    const retryTimer = setTimeout(() => {
      if (isLoading && typeof window !== 'undefined') {
        console.log('Retrying auth check...');
        checkAuth();
      }
    }, 500);

    return () => clearTimeout(retryTimer);
  }, [router, isLoading]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('bell24h-user');
      localStorage.removeItem('user-data');
      router.push('/auth/login');
    }
  };

  const handleRoleChange = (newRole: 'buyer' | 'supplier' | 'msme' | 'manufacturer') => {
    setCurrentRole(newRole);
    // In a real app, you might want to update the user's current role in the database
    console.log(`Switched to ${newRole} role`);
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading Bell24h 2.0 Dashboard...</p>
        </div>
      </div>
    );
  }

  const getCurrentStats = () => {
    return liveStats[currentRole];
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'buyer':
        return <ShoppingCart className='w-5 h-5' />;
      case 'supplier':
        return <Building2 className='w-5 h-5' />;
      case 'msme':
        return <Users className='w-5 h-5' />;
      case 'manufacturer':
        return <Factory className='w-5 h-5' />;
      default:
        return <Users className='w-5 h-5' />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'buyer':
        return 'bg-blue-500';
      case 'supplier':
        return 'bg-green-500';
      case 'msme':
        return 'bg-purple-500';
      case 'manufacturer':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const quickActions = {
    buyer: [
      {
        title: 'Create RFQ',
        icon: Plus,
        action: () => router.push('/rfq/create'),
        color: 'bg-blue-500',
      },
      {
        title: 'Find Suppliers',
        icon: Search,
        action: () => router.push('/suppliers'),
        color: 'bg-green-500',
      },
      {
        title: 'View Analytics',
        icon: BarChart3,
        action: () => router.push('/analytics'),
        color: 'bg-purple-500',
      },
      {
        title: 'Manage Wallet',
        icon: Wallet,
        action: () => router.push('/dashboard/wallet'),
        color: 'bg-orange-500',
      },
    ],
    supplier: [
      {
        title: 'Upload Product',
        icon: Upload,
        action: () => router.push('/products/upload'),
        color: 'bg-green-500',
      },
      {
        title: 'Respond to RFQs',
        icon: FileText,
        action: () => router.push('/rfq/responses'),
        color: 'bg-blue-500',
      },
      {
        title: 'View Analytics',
        icon: BarChart3,
        action: () => router.push('/analytics'),
        color: 'bg-purple-500',
      },
      {
        title: 'Manage Showcase',
        icon: Star,
        action: () => router.push('/showcase'),
        color: 'bg-orange-500',
      },
    ],
    msme: [
      {
        title: 'MSME Benefits',
        icon: Shield,
        action: () => router.push('/msme/benefits'),
        color: 'bg-purple-500',
      },
      {
        title: 'Government Schemes',
        icon: Target,
        action: () => router.push('/msme/schemes'),
        color: 'bg-blue-500',
      },
      {
        title: 'Bulk Orders',
        icon: Package,
        action: () => router.push('/msme/bulk-orders'),
        color: 'bg-green-500',
      },
      {
        title: 'Export Assistance',
        icon: Truck,
        action: () => router.push('/msme/export'),
        color: 'bg-orange-500',
      },
    ],
    manufacturer: [
      {
        title: 'Production Capacity',
        icon: Factory,
        action: () => router.push('/manufacturer/capacity'),
        color: 'bg-orange-500',
      },
      {
        title: 'Custom Orders',
        icon: Package,
        action: () => router.push('/manufacturer/custom'),
        color: 'bg-blue-500',
      },
      {
        title: 'Quality Control',
        icon: Shield,
        action: () => router.push('/manufacturer/quality'),
        color: 'bg-green-500',
      },
      {
        title: 'Supply Chain',
        icon: Truck,
        action: () => router.push('/manufacturer/supply-chain'),
        color: 'bg-purple-500',
      },
    ],
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50'>
      {/* HEADER */}
      <header className='bg-white shadow-lg border-b border-gray-200'>
        <div className='px-6 py-4'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center space-x-4'>
              <Link
                href='/'
                className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
              >
                BELL24H 2.0
              </Link>
              <div className='border-l border-gray-300 pl-4'>
                <h1 className='text-2xl font-bold text-gray-900'>Multi-Role Dashboard</h1>
                <p className='text-sm text-gray-600'>Welcome back, {user?.name || 'Demo User'}</p>
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              {/* Role Toggle */}
              <RoleToggle
                currentRole={currentRole}
                availableRoles={availableRoles}
                onRoleChange={handleRoleChange}
                className='mr-4'
              />

              <button className='p-2 rounded-lg hover:bg-gray-100 transition-colors'>
                <span className='text-lg'>🔔</span>
              </button>
              <button className='p-2 rounded-lg hover:bg-gray-100 transition-colors'>
                <span className='text-lg'>⚙️</span>
              </button>
              <button
                onClick={handleLogout}
                className='flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors'
              >
                <LogOut className='w-4 h-4' />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className='p-6'>
        {/* SUCCESS MESSAGE */}
        <div className='mb-6 bg-green-50 border border-green-200 rounded-lg p-4'>
          <div className='flex items-center'>
            <div className='text-green-400 mr-3'>
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div>
              <p className='text-green-800 font-medium'>🎉 Bell24h 2.0 Dashboard Active!</p>
              <p className='text-green-700 text-sm'>
                Multi-role system with traffic-based pricing and AI features enabled.
              </p>
            </div>
          </div>
        </div>

        {/* Current Role Display */}
        <div className='mb-8'>
          <div
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getRoleColor(currentRole)} text-white`}
          >
            {getRoleIcon(currentRole)}
            <span className='ml-2 capitalize'>Currently in {currentRole} mode</span>
          </div>
        </div>

        {/* Role-Specific Dashboard */}
        <div className='mb-8'>
          {currentRole === 'buyer' && <BuyerDashboard />}
          {currentRole === 'supplier' && <SupplierDashboard />}
          {currentRole === 'msme' && <MSMEDashboard />}
          {currentRole === 'manufacturer' && <ManufacturerDashboard />}
        </div>

        {/* Quick Actions */}
        <div className='mb-8'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>Quick Actions</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {quickActions[currentRole].map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`${action.color} text-white p-4 rounded-xl hover:opacity-90 transition-all duration-200 flex items-center space-x-3`}
              >
                <action.icon className='w-6 h-6' />
                <span className='font-medium'>{action.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Features Section */}
        <div className='mb-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center'>
            <Brain className='w-6 h-6 mr-2 text-purple-600' />
            AI-Powered Features
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Link
              href='/dashboard/voice-rfq'
              className='bg-white p-4 rounded-lg border border-purple-200 hover:border-purple-300 transition-colors'
            >
              <div className='flex items-center space-x-3'>
                <Mic className='w-6 h-6 text-purple-600' />
                <div>
                  <h3 className='font-medium text-gray-900'>Voice RFQ</h3>
                  <p className='text-sm text-gray-600'>Create RFQs with voice commands</p>
                </div>
              </div>
            </Link>
            <Link
              href='/dashboard/ai-matching'
              className='bg-white p-4 rounded-lg border border-purple-200 hover:border-purple-300 transition-colors'
            >
              <div className='flex items-center space-x-3'>
                <Brain className='w-6 h-6 text-purple-600' />
                <div>
                  <h3 className='font-medium text-gray-900'>AI Matching</h3>
                  <p className='text-sm text-gray-600'>Smart supplier recommendations</p>
                </div>
              </div>
            </Link>
            <Link
              href='/dashboard/analytics'
              className='bg-white p-4 rounded-lg border border-purple-200 hover:border-purple-300 transition-colors'
            >
              <div className='flex items-center space-x-3'>
                <BarChart3 className='w-6 h-6 text-purple-600' />
                <div>
                  <h3 className='font-medium text-gray-900'>Analytics</h3>
                  <p className='text-sm text-gray-600'>Traffic-based insights</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Traffic-Based Pricing Preview */}
        <div className='mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center'>
            <TrendingUp className='w-6 h-6 mr-2 text-blue-600' />
            Traffic-Based Pricing
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='bg-white p-4 rounded-lg'>
              <div className='text-sm text-gray-600'>Current Tier</div>
              <div className='text-2xl font-bold text-blue-600'>{user?.trafficTier || 'GOLD'}</div>
              <div className='text-sm text-green-600'>+50% traffic boost</div>
            </div>
            <div className='bg-white p-4 rounded-lg'>
              <div className='text-sm text-gray-600'>Impressions Today</div>
              <div className='text-2xl font-bold text-purple-600'>1,247</div>
              <div className='text-sm text-green-600'>+12% from yesterday</div>
            </div>
            <div className='bg-white p-4 rounded-lg'>
              <div className='text-sm text-gray-600'>Revenue Impact</div>
              <div className='text-2xl font-bold text-green-600'>₹45,230</div>
              <div className='text-sm text-green-600'>+8% from traffic pricing</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>Recent Activity</h2>
          <div className='space-y-4'>
            <div className='flex items-center space-x-3 p-3 rounded-lg bg-green-50'>
              <CheckCircle className='w-5 h-5 text-green-500' />
              <div>
                <p className='font-medium text-sm'>Product uploaded successfully</p>
                <p className='text-xs text-gray-600'>2 hours ago</p>
              </div>
            </div>
            <div className='flex items-center space-x-3 p-3 rounded-lg bg-blue-50'>
              <MessageSquare className='w-5 h-5 text-blue-500' />
              <div>
                <p className='font-medium text-sm'>New RFQ response received</p>
                <p className='text-xs text-gray-600'>4 hours ago</p>
              </div>
            </div>
            <div className='flex items-center space-x-3 p-3 rounded-lg bg-purple-50'>
              <TrendingUp className='w-5 h-5 text-purple-500' />
              <div>
                <p className='font-medium text-sm'>Traffic tier upgraded to GOLD</p>
                <p className='text-xs text-gray-600'>1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
