import { useState, useEffect } from 'react';

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  children?: Category[];
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Use the environment variable for API URL, fallback to localhost:5000
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/categories`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status}`);
        }
        
        const data = await response.json();
        // Handle both array format (from emergency server) and object format (from full backend)
        setCategories(Array.isArray(data) ? data : (data.data || []));
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
        // Fallback to default categories if API fails
        setCategories([
          { id: '1', name: 'All Categories', isEnabled: true, createdAt: '', updatedAt: '' },
          { id: '2', name: 'Electronics', isEnabled: true, createdAt: '', updatedAt: '' },
          { id: '3', name: 'Textiles', isEnabled: true, createdAt: '', updatedAt: '' },
          { id: '4', name: 'Machinery', isEnabled: true, createdAt: '', updatedAt: '' },
          { id: '5', name: 'Chemicals', isEnabled: true, createdAt: '', updatedAt: '' },
          { id: '6', name: 'Construction', isEnabled: true, createdAt: '', updatedAt: '' },
          { id: '7', name: 'Food & Beverage', isEnabled: true, createdAt: '', updatedAt: '' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}; 