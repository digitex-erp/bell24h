import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { User } from "@shared/schema";

import {
  LayoutDashboard,
  FileText,
  Box,
  BarChart3,
  MessageSquare,
  Wallet,
  Truck,
  Settings,
  HelpCircle
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePath: string;
  user: User;
}

export function Sidebar({ isOpen, onClose, activePath, user }: SidebarProps) {
  const navigationItems = [
    { path: "/", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: "/rfqs", label: "Manage RFQs", icon: <FileText className="h-5 w-5" /> },
    { path: "/products", label: "Product Catalog", icon: <Box className="h-5 w-5" /> },
    { path: "/analytics", label: "Analytics", icon: <BarChart3 className="h-5 w-5" /> },
    { path: "/messages", label: "Messages", icon: <MessageSquare className="h-5 w-5" />, badge: 3 },
    { path: "/wallet", label: "Wallet", icon: <Wallet className="h-5 w-5" /> },
    { path: "/logistics", label: "Logistics", icon: <Truck className="h-5 w-5" /> },
    { path: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
    { path: "/help", label: "Help & Support", icon: <HelpCircle className="h-5 w-5" /> }
  ];

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-64 lg:flex-shrink-0",
        {
          "translate-x-0": isOpen,
          "-translate-x-full": !isOpen
        }
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo Area */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-primary-500"
          >
            <path d="M18 8a6 6 0 0 1-6 6v-6h6z" />
            <path d="M18 8a6 6 0 0 0-6-6H4v20h8a6 6 0 0 0 6-6V8z" />
          </svg>
          <h1 className="ml-2 text-xl font-bold text-primary-500">Bell24h</h1>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                {
                  "text-primary-500 bg-primary-50": activePath === item.path,
                  "text-gray-600 hover:bg-gray-100": activePath !== item.path
                }
              )}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
              {item.badge && (
                <span className="ml-auto bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
              {user.fullName.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user.fullName}</p>
              <p className="text-xs font-medium text-gray-500">
                {user.role === "both" ? "Buyer/Supplier" : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
