// src/utils/supplierRatingService.ts
import { v4 as uuidv4 } from 'uuid';
import { sendNotification, NotificationType } from './notificationService.js';

// Supplier tier types
export enum SupplierTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum'
}

// Performance metric categories
export enum PerformanceCategory {
  DELIVERY = 'delivery',
  QUALITY = 'quality',
  COMMUNICATION = 'communication',
  PRICING = 'pricing',
  RELIABILITY = 'reliability'
}

// Performance rating interface
export interface PerformanceRating {
  id: string;
  supplierId: string;
  category: PerformanceCategory;
  score: number; // 1-5 scale
  orderId?: string;
  rfqId?: string;
  comment?: string;
  createdAt: Date;
  createdBy: string;
}

// Supplier rating interface
export interface SupplierRating {
  supplierId: string;
  supplierName: string;
  tier: SupplierTier;
  overallScore: number; // 1-5 scale
  categoryScores: {
    [PerformanceCategory.DELIVERY]: number;
    [PerformanceCategory.QUALITY]: number;
    [PerformanceCategory.COMMUNICATION]: number;
    [PerformanceCategory.PRICING]: number;
    [PerformanceCategory.RELIABILITY]: number;
  };
  ratings: PerformanceRating[];
  totalOrders: number;
  completedOrders: number;
  onTimeDeliveryRate: number; // Percentage
  qualityIssueRate: number; // Percentage
  responseTime: number; // Average in hours
  lastUpdated: Date;
}

// Supplier interface
export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  categories: string[]; // Array of category IDs
  description: string;
  logo?: string;
  website?: string;
  establishedYear?: number;
  employeeCount?: number;
  annualRevenue?: string;
  certifications?: string[];
  rating: SupplierRating;
  createdAt: Date;
  updatedAt: Date;
}

// Mock suppliers data
const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'TechSolutions Inc.',
    email: 'info@techsolutions.com',
    phone: '+91 9876543210',
    address: {
      street: '123 Tech Park',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'India'
    },
    categories: ['IT & Software', 'Consumer Electronics'],
    description: 'Leading provider of IT solutions and services',
    logo: 'https://example.com/logos/techsolutions.png',
    website: 'https://techsolutions.com',
    establishedYear: 2010,
    employeeCount: 250,
    annualRevenue: '₹50-100 Crore',
    certifications: ['ISO 9001', 'ISO 27001'],
    rating: {
      supplierId: '1',
      supplierName: 'TechSolutions Inc.',
      tier: SupplierTier.GOLD,
      overallScore: 4.7,
      categoryScores: {
        [PerformanceCategory.DELIVERY]: 4.8,
        [PerformanceCategory.QUALITY]: 4.9,
        [PerformanceCategory.COMMUNICATION]: 4.5,
        [PerformanceCategory.PRICING]: 4.3,
        [PerformanceCategory.RELIABILITY]: 4.8
      },
      ratings: [
        {
          id: '1',
          supplierId: '1',
          category: PerformanceCategory.QUALITY,
          score: 5,
          orderId: 'ORD-2025-0001',
          comment: 'Excellent product quality, exceeded expectations',
          createdAt: new Date('2025-05-10'),
          createdBy: 'user123'
        },
        {
          id: '2',
          supplierId: '1',
          category: PerformanceCategory.DELIVERY,
          score: 5,
          orderId: 'ORD-2025-0001',
          comment: 'Delivered ahead of schedule',
          createdAt: new Date('2025-05-10'),
          createdBy: 'user123'
        }
      ],
      totalOrders: 45,
      completedOrders: 45,
      onTimeDeliveryRate: 98,
      qualityIssueRate: 2,
      responseTime: 3.5,
      lastUpdated: new Date('2025-05-15')
    },
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2025-05-15')
  },
  {
    id: '2',
    name: 'Global Textiles Ltd.',
    email: 'contact@globaltextiles.com',
    phone: '+91 8765432109',
    address: {
      street: '456 Textile Hub',
      city: 'Surat',
      state: 'Gujarat',
      postalCode: '395001',
      country: 'India'
    },
    categories: ['Textiles & Leather Products', 'Apparel & Fashion'],
    description: 'Manufacturer and exporter of high-quality textiles',
    logo: 'https://example.com/logos/globaltextiles.png',
    website: 'https://globaltextiles.com',
    establishedYear: 2005,
    employeeCount: 500,
    annualRevenue: '₹100-500 Crore',
    certifications: ['ISO 9001', 'OEKO-TEX'],
    rating: {
      supplierId: '2',
      supplierName: 'Global Textiles Ltd.',
      tier: SupplierTier.SILVER,
      overallScore: 3.9,
      categoryScores: {
        [PerformanceCategory.DELIVERY]: 3.7,
        [PerformanceCategory.QUALITY]: 4.2,
        [PerformanceCategory.COMMUNICATION]: 3.5,
        [PerformanceCategory.PRICING]: 4.1,
        [PerformanceCategory.RELIABILITY]: 3.8
      },
      ratings: [
        {
          id: '3',
          supplierId: '2',
          category: PerformanceCategory.QUALITY,
          score: 4,
          orderId: 'ORD-2025-0002',
          comment: 'Good quality materials',
          createdAt: new Date('2025-05-12'),
          createdBy: 'user456'
        },
        {
          id: '4',
          supplierId: '2',
          category: PerformanceCategory.DELIVERY,
          score: 3,
          orderId: 'ORD-2025-0002',
          comment: 'Slight delay in delivery',
          createdAt: new Date('2025-05-12'),
          createdBy: 'user456'
        }
      ],
      totalOrders: 78,
      completedOrders: 75,
      onTimeDeliveryRate: 85,
      qualityIssueRate: 5,
      responseTime: 8,
      lastUpdated: new Date('2025-05-14')
    },
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2025-05-14')
  },
  {
    id: '3',
    name: 'MediPharm Supplies',
    email: 'info@medipharm.com',
    phone: '+91 7654321098',
    address: {
      street: '789 Healthcare Avenue',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500001',
      country: 'India'
    },
    categories: ['Health & Medical', 'Chemicals'],
    description: 'Supplier of pharmaceutical and medical equipment',
    logo: 'https://example.com/logos/medipharm.png',
    website: 'https://medipharm.com',
    establishedYear: 2008,
    employeeCount: 350,
    annualRevenue: '₹50-100 Crore',
    certifications: ['ISO 9001', 'ISO 13485', 'GMP'],
    rating: {
      supplierId: '3',
      supplierName: 'MediPharm Supplies',
      tier: SupplierTier.PLATINUM,
      overallScore: 4.9,
      categoryScores: {
        [PerformanceCategory.DELIVERY]: 4.9,
        [PerformanceCategory.QUALITY]: 5.0,
        [PerformanceCategory.COMMUNICATION]: 4.8,
        [PerformanceCategory.PRICING]: 4.7,
        [PerformanceCategory.RELIABILITY]: 5.0
      },
      ratings: [
        {
          id: '5',
          supplierId: '3',
          category: PerformanceCategory.QUALITY,
          score: 5,
          orderId: 'ORD-2025-0003',
          comment: 'Exceptional quality, meets all regulatory standards',
          createdAt: new Date('2025-05-14'),
          createdBy: 'user789'
        },
        {
          id: '6',
          supplierId: '3',
          category: PerformanceCategory.RELIABILITY,
          score: 5,
          orderId: 'ORD-2025-0003',
          comment: 'Extremely reliable, consistent quality across all orders',
          createdAt: new Date('2025-05-14'),
          createdBy: 'user789'
        }
      ],
      totalOrders: 120,
      completedOrders: 120,
      onTimeDeliveryRate: 99,
      qualityIssueRate: 0.5,
      responseTime: 2,
      lastUpdated: new Date('2025-05-16')
    },
    createdAt: new Date('2023-02-20'),
    updatedAt: new Date('2025-05-16')
  },
  {
    id: '4',
    name: 'BuildWell Construction Supplies',
    email: 'contact@buildwell.com',
    phone: '+91 6543210987',
    address: {
      street: '101 Construction Plaza',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India'
    },
    categories: ['Construction', 'Tools'],
    description: 'Supplier of construction materials and equipment',
    logo: 'https://example.com/logos/buildwell.png',
    website: 'https://buildwell.com',
    establishedYear: 2012,
    employeeCount: 200,
    annualRevenue: '₹10-50 Crore',
    certifications: ['ISO 9001'],
    rating: {
      supplierId: '4',
      supplierName: 'BuildWell Construction Supplies',
      tier: SupplierTier.BRONZE,
      overallScore: 3.2,
      categoryScores: {
        [PerformanceCategory.DELIVERY]: 3.0,
        [PerformanceCategory.QUALITY]: 3.5,
        [PerformanceCategory.COMMUNICATION]: 2.8,
        [PerformanceCategory.PRICING]: 3.7,
        [PerformanceCategory.RELIABILITY]: 3.0
      },
      ratings: [
        {
          id: '7',
          supplierId: '4',
          category: PerformanceCategory.DELIVERY,
          score: 2,
          orderId: 'ORD-2025-0004',
          comment: 'Significant delays in delivery',
          createdAt: new Date('2025-05-08'),
          createdBy: 'user101'
        },
        {
          id: '8',
          supplierId: '4',
          category: PerformanceCategory.QUALITY,
          score: 3,
          orderId: 'ORD-2025-0004',
          comment: 'Average quality, some items needed replacement',
          createdAt: new Date('2025-05-08'),
          createdBy: 'user101'
        }
      ],
      totalOrders: 35,
      completedOrders: 30,
      onTimeDeliveryRate: 70,
      qualityIssueRate: 15,
      responseTime: 12,
      lastUpdated: new Date('2025-05-10')
    },
    createdAt: new Date('2023-04-05'),
    updatedAt: new Date('2025-05-10')
  },
  {
    id: '5',
    name: 'FoodPro Industries',
    email: 'info@foodpro.com',
    phone: '+91 5432109876',
    address: {
      street: '222 Food Processing Zone',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postalCode: '600001',
      country: 'India'
    },
    categories: ['Food & Beverage'],
    description: 'Manufacturer and supplier of food processing equipment',
    logo: 'https://example.com/logos/foodpro.png',
    website: 'https://foodpro.com',
    establishedYear: 2009,
    employeeCount: 180,
    annualRevenue: '₹10-50 Crore',
    certifications: ['ISO 9001', 'HACCP', 'FSSAI'],
    rating: {
      supplierId: '5',
      supplierName: 'FoodPro Industries',
      tier: SupplierTier.GOLD,
      overallScore: 4.5,
      categoryScores: {
        [PerformanceCategory.DELIVERY]: 4.3,
        [PerformanceCategory.QUALITY]: 4.7,
        [PerformanceCategory.COMMUNICATION]: 4.4,
        [PerformanceCategory.PRICING]: 4.2,
        [PerformanceCategory.RELIABILITY]: 4.6
      },
      ratings: [
        {
          id: '9',
          supplierId: '5',
          category: PerformanceCategory.QUALITY,
          score: 5,
          orderId: 'ORD-2025-0005',
          comment: 'Excellent quality equipment, meets all food safety standards',
          createdAt: new Date('2025-05-15'),
          createdBy: 'user202'
        },
        {
          id: '10',
          supplierId: '5',
          category: PerformanceCategory.COMMUNICATION,
          score: 4,
          orderId: 'ORD-2025-0005',
          comment: 'Good communication throughout the order process',
          createdAt: new Date('2025-05-15'),
          createdBy: 'user202'
        }
      ],
      totalOrders: 65,
      completedOrders: 63,
      onTimeDeliveryRate: 92,
      qualityIssueRate: 3,
      responseTime: 5,
      lastUpdated: new Date('2025-05-16')
    },
    createdAt: new Date('2023-05-12'),
    updatedAt: new Date('2025-05-16')
  }
];

// Get all suppliers
export const getSuppliers = (): Supplier[] => {
  const storedSuppliers = localStorage.getItem('bell24h_suppliers');
  if (storedSuppliers) {
    const parsedSuppliers = JSON.parse(storedSuppliers);
    // Convert string dates back to Date objects
    return parsedSuppliers.map((supplier: any) => ({
      ...supplier,
      createdAt: new Date(supplier.createdAt),
      updatedAt: new Date(supplier.updatedAt),
      rating: {
        ...supplier.rating,
        lastUpdated: new Date(supplier.rating.lastUpdated),
        ratings: supplier.rating.ratings.map((rating: any) => ({
          ...rating,
          createdAt: new Date(rating.createdAt)
        }))
      }
    }));
  }
  
  // If no suppliers in localStorage, initialize with mock data
  localStorage.setItem('bell24h_suppliers', JSON.stringify(mockSuppliers));
  return mockSuppliers;
};

// Get supplier by ID
export const getSupplierById = (id: string): Supplier | undefined => {
  const suppliers = getSuppliers();
  return suppliers.find(supplier => supplier.id === id);
};

// Get suppliers by tier
export const getSuppliersByTier = (tier: SupplierTier): Supplier[] => {
  const suppliers = getSuppliers();
  return suppliers.filter(supplier => supplier.rating.tier === tier);
};

// Get suppliers by category
export const getSuppliersByCategory = (categoryId: string): Supplier[] => {
  const suppliers = getSuppliers();
  return suppliers.filter(supplier => supplier.categories.includes(categoryId));
};

// Add a new performance rating
export const addPerformanceRating = (
  supplierId: string,
  category: PerformanceCategory,
  score: number,
  comment?: string,
  orderId?: string,
  rfqId?: string,
  createdBy: string = 'system'
): PerformanceRating | undefined => {
  const suppliers = getSuppliers();
  const supplierIndex = suppliers.findIndex(supplier => supplier.id === supplierId);
  
  if (supplierIndex === -1) {
    return undefined;
  }
  
  // Create new rating
  const newRating: PerformanceRating = {
    id: uuidv4(),
    supplierId,
    category,
    score,
    orderId,
    rfqId,
    comment,
    createdAt: new Date(),
    createdBy
  };
  
  // Add rating to supplier
  const supplier = suppliers[supplierIndex];
  supplier.rating.ratings.push(newRating);
  
  // Recalculate category score
  const categoryRatings = supplier.rating.ratings.filter(rating => rating.category === category);
  const categoryScore = categoryRatings.reduce((sum, rating) => sum + rating.score, 0) / categoryRatings.length;
  supplier.rating.categoryScores[category] = parseFloat(categoryScore.toFixed(1));
  
  // Recalculate overall score
  const overallScore = Object.values(supplier.rating.categoryScores).reduce((sum, score) => sum + score, 0) / 
    Object.keys(supplier.rating.categoryScores).length;
  supplier.rating.overallScore = parseFloat(overallScore.toFixed(1));
  
  // Update tier based on overall score
  supplier.rating.tier = calculateTier(supplier.rating.overallScore, supplier.rating.totalOrders);
  
  // Update last updated timestamp
  supplier.rating.lastUpdated = new Date();
  supplier.updatedAt = new Date();
  
  // Save updated suppliers
  localStorage.setItem('bell24h_suppliers', JSON.stringify(suppliers));
  
  // Send notification
  sendNotification(
    NotificationType.SYSTEM,
    `Supplier ${supplier.name} has received a new rating in ${category}`
  );
  
  return newRating;
};

// Calculate tier based on overall score and order count
export const calculateTier = (overallScore: number, orderCount: number): SupplierTier => {
  // Platinum: 4.7+ score with at least 50 orders
  if (overallScore >= 4.7 && orderCount >= 50) {
    return SupplierTier.PLATINUM;
  }
  
  // Gold: 4.2+ score with at least 30 orders
  if (overallScore >= 4.2 && orderCount >= 30) {
    return SupplierTier.GOLD;
  }
  
  // Silver: 3.7+ score with at least 15 orders
  if (overallScore >= 3.7 && orderCount >= 15) {
    return SupplierTier.SILVER;
  }
  
  // Bronze: Everyone else
  return SupplierTier.BRONZE;
};

// Update supplier metrics
export const updateSupplierMetrics = (
  supplierId: string,
  metrics: {
    totalOrders?: number;
    completedOrders?: number;
    onTimeDeliveryRate?: number;
    qualityIssueRate?: number;
    responseTime?: number;
  }
): Supplier | undefined => {
  const suppliers = getSuppliers();
  const supplierIndex = suppliers.findIndex(supplier => supplier.id === supplierId);
  
  if (supplierIndex === -1) {
    return undefined;
  }
  
  // Update metrics
  const supplier = suppliers[supplierIndex];
  if (metrics.totalOrders !== undefined) supplier.rating.totalOrders = metrics.totalOrders;
  if (metrics.completedOrders !== undefined) supplier.rating.completedOrders = metrics.completedOrders;
  if (metrics.onTimeDeliveryRate !== undefined) supplier.rating.onTimeDeliveryRate = metrics.onTimeDeliveryRate;
  if (metrics.qualityIssueRate !== undefined) supplier.rating.qualityIssueRate = metrics.qualityIssueRate;
  if (metrics.responseTime !== undefined) supplier.rating.responseTime = metrics.responseTime;
  
  // Update tier based on overall score and updated order count
  supplier.rating.tier = calculateTier(supplier.rating.overallScore, supplier.rating.totalOrders);
  
  // Update last updated timestamp
  supplier.rating.lastUpdated = new Date();
  supplier.updatedAt = new Date();
  
  // Save updated suppliers
  localStorage.setItem('bell24h_suppliers', JSON.stringify(suppliers));
  
  return supplier;
};

// Get tier benefits
export const getTierBenefits = (tier: SupplierTier): string[] => {
  switch (tier) {
    case SupplierTier.PLATINUM:
      return [
        'Priority in RFQ matching',
        'Featured supplier status',
        'Reduced platform fees (2%)',
        'Dedicated account manager',
        'Early payment options (Net-15)',
        'Premium badge on profile',
        'Access to exclusive events',
        'Priority customer support',
        'Free premium analytics',
        'Verified supplier status'
      ];
    case SupplierTier.GOLD:
      return [
        'Higher visibility in search results',
        'Reduced platform fees (3%)',
        'Early payment options (Net-30)',
        'Gold badge on profile',
        'Priority customer support',
        'Access to advanced analytics',
        'Verified supplier status'
      ];
    case SupplierTier.SILVER:
      return [
        'Improved search ranking',
        'Standard platform fees (4%)',
        'Silver badge on profile',
        'Faster customer support',
        'Basic analytics dashboard'
      ];
    case SupplierTier.BRONZE:
      return [
        'Standard search visibility',
        'Standard platform fees (5%)',
        'Bronze badge on profile',
        'Standard customer support'
      ];
    default:
      return [];
  }
};

// Get tier color
export const getTierColor = (tier: SupplierTier): string => {
  switch (tier) {
    case SupplierTier.PLATINUM:
      return '#8892b0';
    case SupplierTier.GOLD:
      return '#ffd700';
    case SupplierTier.SILVER:
      return '#c0c0c0';
    case SupplierTier.BRONZE:
      return '#cd7f32';
    default:
      return '#000000';
  }
};

// Initialize suppliers data
export const initializeSuppliersData = (): void => {
  const storedSuppliers = localStorage.getItem('bell24h_suppliers');
  if (!storedSuppliers) {
    localStorage.setItem('bell24h_suppliers', JSON.stringify(mockSuppliers));
  }
};
