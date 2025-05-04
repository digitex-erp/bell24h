import { 
  User, 
  Rfq, 
  Category, 
  Bid, 
  Product, 
  Message,
  Notification,
  Transaction,
  Escrow,
  Invoice,
  Shipment,
  MarketTrend,
  SupplierScore 
} from "@shared/schema";

export interface StatsCardProps {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  value: string | number;
  trend?: {
    value: string;
    direction: "up" | "down" | "stable";
  };
  subtitle?: string;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface IndustryTrend {
  category: string;
  percentage: number;
  percentageText: string;
  value: number;
  color: string;
}

export interface RFQTableItem {
  id: number;
  title: string;
  rfqNumber: string;
  responses: number;
  status: string;
}

export interface LogisticsTrackingItem {
  id: number;
  trackingNumber: string;
  orderNumber: string;
  description: string;
  status: string;
  origin: string;
  current: string;
  destination: string;
  progress: number;
}

export interface SupplierRiskItem {
  id: number;
  name: string;
  company: string;
  location: string;
  category: string;
  riskScore: number;
  riskTrend: "up" | "down" | "stable";
  factors: {
    name: string;
    value: string;
    indicator: "green" | "yellow" | "red";
  }[];
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  time: string;
  type: "success" | "info" | "warning";
  isRead: boolean;
}

export interface DashboardStats {
  activeRfqs: number;
  matchedSuppliers: number;
  walletBalance: number;
  pendingDeliveries: number;
  rfqTrend: number;
  matchTrend: number;
}

export interface UserMenuProps {
  user: User;
  onLogout: () => void;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePath: string;
  user: User;
}

export interface HeaderProps {
  onSidebarToggle: () => void;
  user: User;
  onLogout: () => void;
}

export interface WebSocketMessage {
  type: string;
  data: any;
}
