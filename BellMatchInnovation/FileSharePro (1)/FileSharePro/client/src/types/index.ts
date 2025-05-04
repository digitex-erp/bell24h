export interface User {
  id: number;
  username: string;
  email: string;
  role: 'buyer' | 'supplier' | 'admin';
  firstName?: string;
  lastName?: string;
  companyName?: string;
  profilePicture?: string;
  createdAt: Date;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  parentCategoryId?: number;
}

export interface RFQ {
  id: number;
  userId: number;
  categoryId?: number;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'pending' | 'closed';
  location?: string;
  quantity?: number;
  budget?: number;
  specifications?: Record<string, any>;
  attachments?: string[];
  isVoiceBased?: boolean;
  isVideoBased?: boolean;
  videoUrl?: string;
  voiceTranscription?: string;
  closingDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface VoiceRFQData {
  title?: string;
  description: string;
  voiceTranscription: string;
  isVoiceBased: boolean;
  categoryId?: number;
  location?: string;
  closingDate: string;
  specifications?: Record<string, any>;
}

export interface Quote {
  id: number;
  rfqId: number;
  userId: number;
  status: 'pending' | 'accepted' | 'rejected';
  price: number;
  deliveryTime: string;
  additionalInfo?: string;
  attachments?: string[];
  isVideoBased?: boolean;
  videoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  status: 'sent' | 'delivered' | 'read';
  attachments?: string[];
  createdAt: Date;
}

export interface SupplierProfile {
  id: number;
  userId: number;
  company: string;
  description: string;
  industry: string;
  location: string;
  certifications?: string[];
  establishedYear?: number;
  employeeCount?: number;
  website?: string;
  contactEmail: string;
  contactPhone?: string;
  logo?: string;
  gallery?: string[];
  socialMedia?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: number;
  rfqId: number;
  quoteId: number;
  buyerId: number;
  supplierId: number;
  amount: number;
  status: 'pending' | 'escrow' | 'released' | 'refunded' | 'canceled';
  transactionId?: string;
  paymentMethod: string;
  paymentDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  type: 'quote' | 'message' | 'payment' | 'system' | 'trading';
  title: string;
  content: string;
  createdAt: Date;
  read: boolean;
  link?: string;
  senderId?: number;
}

// Trading related types
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop' | 'oco' | 'iceberg';
export type OrderSide = 'buy' | 'sell';
export type OrderStatus = 'open' | 'partial' | 'filled' | 'cancelled' | 'rejected' | 'expired';
export type AlertType = 'price' | 'volume' | 'technical' | 'news';

export interface TradingPair {
  id: number;
  baseAsset: string;
  quoteAsset: string;
  minQty: number;
  maxQty: number;
  stepSize: number;
  minPrice: number;
  maxPrice: number;
  tickSize: number;
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface TradingOrder {
  id: number;
  userId: number;
  pairId: number;
  type: OrderType;
  side: OrderSide;
  status: OrderStatus;
  price?: number;
  stopPrice?: number;
  quantity: number;
  filledQuantity: number;
  totalCost?: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
  clientOrderId?: string;
  notes?: string;
  pair?: TradingPair;
}

export interface TradingPosition {
  id: number;
  userId: number;
  pairId: number;
  side: OrderSide;
  entryPrice: number;
  quantity: number;
  leverage: number;
  liquidationPrice?: number;
  takeProfitPrice?: number;
  stopLossPrice?: number;
  unrealizedPnl?: number;
  realizedPnl: number;
  margin: number;
  createdAt: Date;
  updatedAt?: Date;
  pair?: TradingPair;
}

export interface TradingAlert {
  id: number;
  userId: number;
  pairId: number;
  type: AlertType;
  triggerValue: number;
  comparison: string;
  isActive: boolean;
  message?: string;
  notifyVia: string[];
  lastTriggered?: Date;
  cooldownMinutes: number;
  createdAt: Date;
  updatedAt?: Date;
  pair?: TradingPair;
}

export interface MarketDepthEntry {
  id: number;
  pairId: number;
  side: OrderSide;
  price: number;
  quantity: number;
  timestamp: Date;
  pair?: TradingPair;
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
  total: number;
}