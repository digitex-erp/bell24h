import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, getUserRole } from '../lib/supabaseClient';

export default function Navbar({ user, loading }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const role = await getUserRole();
        setUserRole(role);
      }
    };
    
    fetchUserRole();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a className="text-2xl font-bold text-primary-600">Bell24h</a>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/">
                <a className={`${router.pathname === '/' ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Home
                </a>
              </Link>
              {user && userRole === 'buyer' && (
                <>
                  <Link href="/dashboard/buyer">
                    <a className={`${router.pathname === '/dashboard/buyer' ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                      Dashboard
                    </a>
                  </Link>
                  <Link href="/rfq/create">
                    <a className={`${router.pathname === '/rfq/create' ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                      Create RFQ
                    </a>
                  </Link>
                </>
              )}
              {user && userRole === 'supplier' && (
                <Link href="/dashboard/supplier">
                  <a className={`${router.pathname === '/dashboard/supplier' ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                    Dashboard
                  </a>
                </Link>
              )}
              {user && userRole === 'admin' && (
                <Link href="/dashboard/admin">
                  <a className={`${router.pathname === '/dashboard/admin' ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                    Admin Panel
                  </a>
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {!loading && (
              <>
                {user ? (
                  <div className="ml-3 relative">
                    <div className="flex items-center space-x-4">
                      <Link href="/wallet">
                        <a className="text-sm font-medium text-gray-700 hover:text-gray-900">
                          Wallet
                        </a>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="text-sm font-medium text-gray-700 hover:text-gray-900"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link href="/auth/login">
                      <a className="text-sm font-medium text-gray-700 hover:text-gray-900">
                        Sign in
                      </a>
                    </Link>
                    <Link href="/auth/register">
                      <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        Sign up
                      </a>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link href="/">
            <a
              className={`${
                router.pathname === '/'
                  ? 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              Home
            </a>
          </Link>
          {user && userRole === 'buyer' && (
            <>
              <Link href="/dashboard/buyer">
                <a
                  className={`${
                    router.pathname === '/dashboard/buyer'
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                >
                  Dashboard
                </a>
              </Link>
              <Link href="/rfq/create">
                <a
                  className={`${
                    router.pathname === '/rfq/create'
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                >
                  Create RFQ
                </a>
              </Link>
            </>
          )}
          {user && userRole === 'supplier' && (
            <Link href="/dashboard/supplier">
              <a
                className={`${
                  router.pathname === '/dashboard/supplier'
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              >
                Dashboard
              </a>
            </Link>
          )}
          {user && userRole === 'admin' && (
            <Link href="/dashboard/admin">
              <a
                className={`${
                  router.pathname === '/dashboard/admin'
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              >
                Admin Panel
              </a>
            </Link>
          )}
        </div>
        {!loading && (
          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <div className="space-y-1">
                <Link href="/wallet">
                  <a className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700">
                    Wallet
                  </a>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link href="/auth/login">
                  <a className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700">
                    Sign in
                  </a>
                </Link>
                <Link href="/auth/register">
                  <a className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700">
                    Sign up
                  </a>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
