import { Category, Subcategory } from '../types/categories';
import { categories } from '../data/categories';

// Get all categories
export const getAllCategories = async (): Promise<Category[]> => {
  // In a real application, this would be an API call to your backend
  // For now, we'll simulate an API call with a Promise
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(categories);
    }, 300); // Simulate network delay
  });
};

// Get a specific category by slug
export const getCategoryBySlug = async (slug: string): Promise<Category | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const category = categories.find(cat => cat.slug === slug) || null;
      resolve(category);
    }, 300);
  });
};

// Get subcategories for a specific category
export const getSubcategoriesByCategorySlug = async (categorySlug: string): Promise<Subcategory[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const category = categories.find(cat => cat.slug === categorySlug);
      resolve(category ? category.subcategories : []);
    }, 300);
  });
};

// Search categories and subcategories
export const searchCategories = async (query: string): Promise<{
  categories: Category[];
  subcategories: { categorySlug: string; subcategory: Subcategory }[];
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const normalizedQuery = query.toLowerCase().trim();
      
      // Search categories
      const matchedCategories = categories.filter(category => 
        category.name.toLowerCase().includes(normalizedQuery) || 
        category.description.toLowerCase().includes(normalizedQuery)
      );
      
      // Search subcategories
      const matchedSubcategories: { categorySlug: string; subcategory: Subcategory }[] = [];
      
      categories.forEach(category => {
        category.subcategories.forEach(subcategory => {
          if (
            subcategory.name.toLowerCase().includes(normalizedQuery) ||
            (subcategory.description && subcategory.description.toLowerCase().includes(normalizedQuery))
          ) {
            matchedSubcategories.push({
              categorySlug: category.slug,
              subcategory
            });
          }
        });
      });
      
      resolve({
        categories: matchedCategories,
        subcategories: matchedSubcategories
      });
    }, 300);
  });
};
