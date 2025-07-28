import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';
import { useAuth } from '@/contexts/AuthContext';

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activePath, setActivePath] = useState('');

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return activePath === path ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600';
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <TooltipProvider>
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0">
                <Link to="/" className="flex items-center">
                  <h1 className="text-xl font-bold text-blue-600">Bell24H</h1>
                </Link>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-2">
                <Link 
                  to="/" 
                  className={`${isActive('/')} px-3 py-2 text-sm font-medium rounded-md transition-colors`}
                >
                  {t('nav.home')}
                </Link>
                <Link 
                  to="/suppliers" 
                  className={`${isActive('/suppliers')} px-3 py-2 text-sm font-medium rounded-md transition-colors`}
                >
                  {t('nav.suppliers')}
                </Link>
                <Link 
                  to="/rfqs" 
                  className={`${isActive('/rfqs')} px-3 py-2 text-sm font-medium rounded-md transition-colors`}
                >
                  {t('nav.rfqs')}
                </Link>
                <Link 
                  to="/analytics" 
                  className={`${isActive('/analytics')} px-3 py-2 text-sm font-medium rounded-md transition-colors`}
                >
                  {t('nav.analytics')}
                </Link>
                <Link 
                  to="/marketplace" 
                  className={`${isActive('/marketplace')} px-3 py-2 text-sm font-medium rounded-md transition-colors`}
                >
                  {t('nav.marketplace')}
                </Link>
              </nav>

              {/* Right side actions */}
              <div className="flex items-center space-x-4">
                <LanguageSwitcher />
                
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/account"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium rounded-md transition-colors"
                    >
                      {t('nav.account')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium rounded-md transition-colors"
                    >
                      {t('nav.logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium rounded-md transition-colors"
                    >
                      {t('nav.login')}
                    </Link>
                    <Link
                      to="/register"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      {t('nav.register')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-8rem)]">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {children || <Outlet />}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('footer.company')}</h3>
                <ul className="space-y-2">
                  <li><Link to="/about" className="text-sm text-gray-600 hover:text-blue-600">{t('footer.about')}</Link></li>
                  <li><Link to="/careers" className="text-sm text-gray-600 hover:text-blue-600">{t('footer.careers')}</Link></li>
                  <li><Link to="/blog" className="text-sm text-gray-600 hover:text-blue-600">{t('footer.blog')}</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('footer.resources')}</h3>
                <ul className="space-y-2">
                  <li><Link to="/help" className="text-sm text-gray-600 hover:text-blue-600">{t('footer.helpCenter')}</Link></li>
                  <li><Link to="/contact" className="text-sm text-gray-600 hover:text-blue-600">{t('footer.contact')}</Link></li>
                  <li><Link to="/privacy" className="text-sm text-gray-600 hover:text-blue-600">{t('footer.privacy')}</Link></li>
                  <li><Link to="/terms" className="text-sm text-gray-600 hover:text-blue-600">{t('footer.terms')}</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('footer.legal')}</h3>
                <ul className="space-y-2">
                  <li><Link to="/gdpr" className="text-sm text-gray-600 hover:text-blue-600">GDPR</Link></li>
                  <li><Link to="/ccpa" className="text-sm text-gray-600 hover:text-blue-600">CCPA</Link></li>
                  <li><Link to="/cookies" className="text-sm text-gray-600 hover:text-blue-600">{t('footer.cookiePolicy')}</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('footer.newsletter')}</h3>
                <p className="text-sm text-gray-600 mb-4">{t('footer.newsletterDesc')}</p>
                <div className="flex">
                  <input 
                    type="email" 
                    placeholder={t('footer.emailPlaceholder')} 
                    className="px-4 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500 block w-full text-sm"
                  />
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-r-md text-sm font-medium hover:bg-blue-700 transition-colors">
                    {t('footer.subscribe')}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Bell24H. {t('footer.allRights')}
              </p>
            </div>
          </div>
        </footer>

        <Toaster />
      </TooltipProvider>
    </div>
  );
};

export default MainLayout;
