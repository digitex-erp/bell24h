import React, { useState } from "react";
import { Link } from "wouter";
import { APP_NAME } from "@/lib/constants";

interface HeaderProps {
  user: {
    name: string;
    firstName: string;
    avatar?: string;
  };
  onToggleSidebar: () => void;
  notifications: number;
  messages: number;
}

const Header = ({ user, onToggleSidebar, notifications, messages }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3 md:hidden">
          <button 
            className="p-2 text-gray-500 hover:text-gray-600 focus:outline-none"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <i className="fas fa-bars"></i>
          </button>
          <Link href="/">
            <a className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
                <i className="fas fa-bell text-white"></i>
              </div>
              <h1 className="text-xl font-bold text-gray-800">{APP_NAME}</h1>
            </a>
          </Link>
        </div>

        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                placeholder="Search RFQs, suppliers, products..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/notifications">
            <a className="p-2 text-gray-500 hover:text-gray-600 relative focus:outline-none" aria-label="Notifications">
              <i className="fas fa-bell"></i>
              {notifications > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-danger-500"></span>
              )}
            </a>
          </Link>
          <Link href="/messages">
            <a className="p-2 text-gray-500 hover:text-gray-600 relative focus:outline-none" aria-label="Messages">
              <i className="fas fa-comment-dots"></i>
              {messages > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-danger-500"></span>
              )}
            </a>
          </Link>
          <div className="hidden md:block">
            <Link href="/profile">
              <a className="flex items-center space-x-2">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                    {user.firstName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-800">
                  {user.firstName}
                </span>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
