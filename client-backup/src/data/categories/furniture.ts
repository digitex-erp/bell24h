import { Category } from '../../types/categories.js';

export const furniture: Category = {
  id: 'furniture',
  name: 'Furniture',
  description: 'Home, office, and commercial furniture',
  slug: 'furniture',
  icon: '🪑',
  subcategories: [
    {
      id: 'home-furniture',
      name: 'Home Furniture',
      slug: 'home-furniture',
      description: 'Furniture for residential use',
      icon: '🛋️'
    },
    {
      id: 'office-furniture',
      name: 'Office Furniture',
      slug: 'office-furniture',
      description: 'Furniture for office and commercial spaces',
      icon: '🖥️'
    },
    {
      id: 'outdoor-furniture',
      name: 'Outdoor Furniture',
      slug: 'outdoor-furniture',
      description: 'Furniture for gardens, patios, and outdoor spaces',
      icon: '⛱️'
    },
    {
      id: 'furniture-parts',
      name: 'Furniture Parts & Accessories',
      slug: 'furniture-parts',
      description: 'Components and accessories for furniture',
      icon: '🔨'
    },
    {
      id: 'furniture-materials',
      name: 'Furniture Materials',
      slug: 'furniture-materials',
      description: 'Raw materials for furniture manufacturing',
      icon: '🪵'
    },
    {
      id: 'custom-furniture',
      name: 'Custom Furniture',
      slug: 'custom-furniture',
      description: 'Bespoke and made-to-order furniture',
      icon: '✏️'
    },
    {
      id: 'antique-furniture',
      name: 'Antique Furniture',
      slug: 'antique-furniture',
      description: 'Vintage and antique furniture pieces',
      icon: '🏺'
    },
    {
      id: 'furniture-manufacturing',
      name: 'Furniture Manufacturing Equipment',
      slug: 'furniture-manufacturing',
      description: 'Machinery for furniture production',
      icon: '⚙️'
    }
  ]
};
