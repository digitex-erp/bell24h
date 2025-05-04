import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/authSlice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from '@shared/schema';

interface NavbarProps {
  user: Partial<User>;
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout() as any);
  };

  return (
    <div className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center md:hidden">
              <button className="text-gray-500 hover:text-gray-700">
                <i className="fas fa-bars text-xl"></i>
              </button>
              <span className="ml-2 text-xl font-bold text-primary-900">Bell24h</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="relative mr-4">
              <button className="p-1 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none">
                <i className="fas fa-bell text-xl"></i>
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-destructive"></span>
              </button>
            </div>
            <div className="border-l pl-3 ml-3 border-gray-200">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary-700 flex items-center justify-center text-white">
                      <span className="text-sm font-medium">
                        {user.username?.substring(0, 2).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
                      {user.companyName || user.username}
                    </span>
                    <i className="fas fa-chevron-down ml-1 text-xs text-gray-400"></i>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <i className="fas fa-user mr-2"></i> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <i className="fas fa-cog mr-2"></i> Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <i className="fas fa-wallet mr-2"></i> Wallet
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt mr-2"></i> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
