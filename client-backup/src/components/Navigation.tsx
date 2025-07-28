import React from 'react';
import { Link } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children }) => (
  <Link
    to={to}
    className="px-3 py-2 text-sm font-medium rounded-md hover:bg-blue-600 hover:text-white"
  >
    {children}
  </Link>
);

const Navigation: React.FC = () => {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">Bell24H</span>
            </div>
            <div className="ml-6 flex items-center space-x-4">
              <NavLink to="/">Dashboard</NavLink>
              <NavLink to="/rfqs">RFQs</NavLink>
              <NavLink to="/video-rfq">Video RFQ</NavLink>
              <NavLink to="/product-showcase">Product Showcase</NavLink>
              <NavLink to="/suppliers">Suppliers</NavLink>
              <NavLink to="/pricing">Pricing</NavLink>
              <NavLink to="/community">Community</NavLink>
              <NavLink to="/admin/dashboard">Admin</NavLink>
            </div>
          </div>
          <div className="flex items-center">
            <div className="ml-3 relative">
              <div>
                <button
                  type="button"
                  className="max-w-xs flex items-center text-sm rounded-full focus:outline-none"
                  id="user-menu"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span className="sr-only">Open user menu</span>
                  <img
                    className="h-8 w-8 rounded-full"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
