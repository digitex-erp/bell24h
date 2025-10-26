// Complete 50 Categories for Bell24h - www.bell24h.com
// This file combines all 50 categories with comprehensive mock data

import { Category } from './complete-categories';
import { REMAINING_CATEGORIES, generateAllCategories } from './remaining-categories';

// Import the first 3 categories from complete-categories
import { COMPLETE_CATEGORIES } from './complete-categories';

// Combine all 50 categories
export const ALL_50_CATEGORIES: Category[] = [
  ...COMPLETE_CATEGORIES, // First 3 categories
  ...REMAINING_CATEGORIES, // Categories 4-6
  ...generateAllCategories() // Categories 7-50
];

// Export trending categories
export const TRENDING_CATEGORIES = ALL_50_CATEGORIES.filter(cat => cat.trending);

// Export categories by search
export const getCategoriesBySearch = (searchTerm: string): Category[] => {
  const term = searchTerm.toLowerCase();
  return ALL_50_CATEGORIES.filter(
    cat =>
      cat.name.toLowerCase().includes(term) ||
      cat.description.toLowerCase().includes(term) ||
      cat.subcategories.some(sub => sub.name.toLowerCase().includes(term))
  );
};

// Export category by ID
export const getCategoryById = (id: string): Category | undefined => {
  return ALL_50_CATEGORIES.find(cat => cat.id === id);
};

// Export subcategory by ID
export const getSubcategoryById = (categoryId: string, subcategoryId: string) => {
  const category = getCategoryById(categoryId);
  return category?.subcategories.find(sub => sub.id === subcategoryId);
};

// Export categories by trending status
export const getTrendingCategories = (): Category[] => {
  return ALL_50_CATEGORIES.filter(cat => cat.trending);
};

// Export categories by activity status
export const getActiveCategories = (): Category[] => {
  return ALL_50_CATEGORIES.filter(cat => cat.isActive);
};

// Export categories with mock orders
export const getCategoriesWithMockOrders = (): Category[] => {
  return ALL_50_CATEGORIES.filter(cat => cat.mockOrderCount > 0);
};

// Export categories by supplier count (top suppliers)
export const getTopSupplierCategories = (limit: number = 10): Category[] => {
  return ALL_50_CATEGORIES
    .sort((a, b) => b.supplierCount - a.supplierCount)
    .slice(0, limit);
};

// Export categories by RFQ count (most active)
export const getMostActiveCategories = (limit: number = 10): Category[] => {
  return ALL_50_CATEGORIES
    .sort((a, b) => b.rfqCount - a.rfqCount)
    .slice(0, limit);
};

// Export categories by mock order count (most orders)
export const getMostOrderedCategories = (limit: number = 10): Category[] => {
  return ALL_50_CATEGORIES
    .sort((a, b) => b.mockOrderCount - a.mockOrderCount)
    .slice(0, limit);
};

// Export category statistics
export const getCategoryStatistics = () => {
  const totalCategories = ALL_50_CATEGORIES.length;
  const activeCategories = getActiveCategories().length;
  const trendingCategories = getTrendingCategories().length;
  const totalSuppliers = ALL_50_CATEGORIES.reduce((sum, cat) => sum + cat.supplierCount, 0);
  const totalProducts = ALL_50_CATEGORIES.reduce((sum, cat) => sum + cat.productCount, 0);
  const totalRFQs = ALL_50_CATEGORIES.reduce((sum, cat) => sum + cat.rfqCount, 0);
  const totalMockOrders = ALL_50_CATEGORIES.reduce((sum, cat) => sum + cat.mockOrderCount, 0);

  return {
    totalCategories,
    activeCategories,
    trendingCategories,
    totalSuppliers,
    totalProducts,
    totalRFQs,
    totalMockOrders,
    averageSuppliersPerCategory: Math.round(totalSuppliers / totalCategories),
    averageProductsPerCategory: Math.round(totalProducts / totalCategories),
    averageRFQsPerCategory: Math.round(totalRFQs / totalCategories),
    averageMockOrdersPerCategory: Math.round(totalMockOrders / totalCategories)
  };
};

// Export category groups for dashboard display
export const getCategoryGroups = () => {
  return {
    trending: getTrendingCategories(),
    mostActive: getMostActiveCategories(5),
    topSuppliers: getTopSupplierCategories(5),
    mostOrdered: getMostOrderedCategories(5),
    all: ALL_50_CATEGORIES
  };
};

// Export for database seeding
export const getCategoriesForSeeding = () => {
  return ALL_50_CATEGORIES.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    icon: cat.icon,
    supplierCount: cat.supplierCount,
    productCount: cat.productCount,
    rfqCount: cat.rfqCount,
    mockOrderCount: cat.mockOrderCount,
    trending: cat.trending,
    isActive: cat.isActive,
    sortOrder: cat.sortOrder,
    metaTitle: cat.seo.metaTitle,
    metaDescription: cat.seo.metaDescription,
    keywords: cat.seo.keywords
  }));
};

// Export subcategories for database seeding
export const getSubcategoriesForSeeding = () => {
  const subcategories: any[] = [];
  
  ALL_50_CATEGORIES.forEach(category => {
    category.subcategories.forEach(subcategory => {
      subcategories.push({
        id: subcategory.id,
        name: subcategory.name,
        slug: subcategory.slug,
        description: subcategory.description,
        categoryId: category.id,
        supplierCount: subcategory.supplierCount,
        productCount: subcategory.productCount,
        rfqCount: subcategory.rfqCount,
        mockOrderCount: subcategory.mockOrderCount,
        isActive: subcategory.isActive,
        sortOrder: subcategory.sortOrder
      });
    });
  });
  
  return subcategories;
};

// Export mock orders for database seeding
export const getMockOrdersForSeeding = () => {
  const mockOrders: any[] = [];
  
  ALL_50_CATEGORIES.forEach(category => {
    category.mockOrders.forEach(order => {
      mockOrders.push({
        id: order.id,
        title: order.title,
        description: order.description,
        value: order.value,
        currency: order.currency,
        status: order.status,
        buyer: order.buyer,
        supplier: order.supplier,
        category: order.category,
        subcategory: order.subcategory,
        categoryId: category.id,
        createdAt: order.createdAt,
        completedAt: order.completedAt
      });
    });
  });
  
  return mockOrders;
};
