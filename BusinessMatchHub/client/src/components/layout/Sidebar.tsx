import React from 'react';
import { Link, useLocation } from 'wouter';

const Sidebar: React.FC = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'fas fa-home' },
    { path: '/my-rfqs', label: 'My RFQs', icon: 'fas fa-file-alt' },
    { path: '/my-bids', label: 'My Bids', icon: 'fas fa-gavel' },
    { path: '/suppliers', label: 'Suppliers', icon: 'fas fa-building' },
    { path: '/messages', label: 'Messages', icon: 'fas fa-comments' },
    { path: '/analytics', label: 'Analytics', icon: 'fas fa-chart-line' },
    { path: '/wallet', label: 'Wallet & Payments', icon: 'fas fa-wallet' },
    { path: '/invoices', label: 'Invoices', icon: 'fas fa-file-invoice-dollar' },
  ];

  const bottomNavItems = [
    { path: '/settings', label: 'Settings', icon: 'fas fa-cog' },
    { path: '/help', label: 'Help & Support', icon: 'fas fa-question-circle' },
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        {/* Sidebar component */}
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-primary-900 text-white">
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <span className="text-2xl font-bold">Bell24h</span>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <a
                    className={`group flex items-center px-2 py-3 text-sm font-medium rounded-md ${
                      isActive(item.path)
                        ? 'bg-primary-800 text-white'
                        : 'text-primary-100 hover:bg-primary-800'
                    }`}
                  >
                    <i className={`${item.icon} mr-3 text-lg`}></i>
                    {item.label}
                  </a>
                </Link>
              ))}
              <div className="pt-8">
                <div className="px-2 space-y-1">
                  {bottomNavItems.map((item) => (
                    <Link key={item.path} href={item.path}>
                      <a
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          isActive(item.path)
                            ? 'bg-primary-800 text-white'
                            : 'text-primary-100 hover:bg-primary-800'
                        }`}
                      >
                        <i className={`${item.icon} mr-3 text-lg`}></i>
                        {item.label}
                      </a>
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
