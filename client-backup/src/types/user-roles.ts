export enum UserRole {
  ADMIN = 'ADMIN',
  BUSINESS = 'BUSINESS', // B2B Users
  CONSUMER = 'CONSUMER', // B2C Users
  SUPPLIER = 'SUPPLIER',
  ENTERPRISE = 'ENTERPRISE', // Large B2B Users
  STAFF = 'STAFF', // Staff members of businesses
  GUEST = 'GUEST'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  SUSPENDED = 'SUSPENDED'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  company?: string;
  businessType?: string;
  verificationStatus?: {
    documentVerified: boolean;
    addressVerified: boolean;
    taxVerified: boolean;
    bankVerified: boolean;
  };
  preferences?: {
    language: string;
    currency: string;
    notificationPreferences: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  billingInfo?: {
    plan: string;
    subscriptionId: string;
    paymentMethod: string;
    billingAddress: string;
  };
  metadata?: Record<string, any>;
}

export interface EnterpriseUser extends User {
  role: UserRole.ENTERPRISE;
  teamMembers: string[];
  departments: string[];
  purchaseOrders: string[];
  contracts: string[];
}

export interface ConsumerUser extends User {
  role: UserRole.CONSUMER;
  shippingAddresses: {
    id: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zip: string;
    isDefault: boolean;
  }[];
  wishList: string[];
  orderHistory: string[];
  reviews: string[];
}

export interface SupplierUser extends User {
  role: UserRole.SUPPLIER;
  businessCategory: string[];
  products: string[];
  certifications: string[];
  ratings: number;
  reviewCount: number;
  deliveryPerformance: number;
  paymentTerms: string;
}
