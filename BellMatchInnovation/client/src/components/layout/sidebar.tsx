import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

interface SidebarItemProps {
  href: string;
  icon: string;
  children: React.ReactNode;
  active?: boolean;
}

const SidebarItem = ({ href, icon, children, active }: SidebarItemProps) => {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center space-x-2 p-2 rounded-md",
          active
            ? "bg-primary-50 text-primary-700"
            : "text-gray-600 hover:bg-gray-100"
        )}
      >
        <i className={`fas ${icon} w-5`}></i>
        <span>{children}</span>
      </a>
    </Link>
  );
};

interface SidebarProps {
  user: {
    name: string;
    role: string;
    avatar?: string;
  };
}

const Sidebar = ({ user }: SidebarProps) => {
  const [location] = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
            <i className="fas fa-bell text-white"></i>
          </div>
          <h1 className="text-xl font-bold text-gray-800">{APP_NAME}</h1>
        </div>
        <p className="text-xs text-gray-500 mt-1">{APP_DESCRIPTION}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <SidebarItem
          href="/"
          icon="fa-tachometer-alt"
          active={location === "/" || location === "/dashboard"}
        >
          Dashboard
        </SidebarItem>
        <SidebarItem
          href="/rfqs"
          icon="fa-file-invoice"
          active={location.startsWith("/rfqs")}
        >
          RFQs
        </SidebarItem>
        <SidebarItem
          href="/suppliers"
          icon="fa-users"
          active={location.startsWith("/suppliers")}
        >
          Suppliers
        </SidebarItem>
        <SidebarItem
          href="/messages"
          icon="fa-comment-dots"
          active={location.startsWith("/messages")}
        >
          Messages
        </SidebarItem>
        <SidebarItem
          href="/wallet"
          icon="fa-wallet"
          active={location.startsWith("/wallet")}
        >
          Wallet
        </SidebarItem>
        <SidebarItem
          href="/pricing"
          icon="fa-tags"
          active={location.startsWith("/pricing")}
        >
          Pricing Plans
        </SidebarItem>
        <SidebarItem
          href="/analytics"
          icon="fa-chart-line"
          active={location.startsWith("/analytics")}
        >
          Analytics
        </SidebarItem>
        <SidebarItem
          href="/settings"
          icon="fa-cog"
          active={location.startsWith("/settings")}
        >
          Settings
        </SidebarItem>

        <div className="pt-4 mt-4 border-t border-gray-200">
          <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Quick Tools
          </h3>
          <div className="mt-2 space-y-1">
            <SidebarItem
              href="/voice-rfq"
              icon="fa-microphone"
              active={location === "/voice-rfq"}
            >
              Voice RFQ
            </SidebarItem>
            <SidebarItem
              href="/video-rfq"
              icon="fa-video"
              active={location === "/video-rfq"}
            >
              Video RFQ
            </SidebarItem>
            <SidebarItem
              href="/risk-scoring"
              icon="fa-shield-alt"
              active={location === "/risk-scoring"}
            >
              Risk Scoring
            </SidebarItem>
            <SidebarItem
              href="/blockchain-simulator"
              icon="fa-cubes"
              active={location === "/blockchain-simulator"}
            >
              Blockchain Simulator
            </SidebarItem>
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.role}</p>
          </div>
          <button className="p-1 rounded-full text-gray-500 hover:bg-gray-100">
            <i className="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
