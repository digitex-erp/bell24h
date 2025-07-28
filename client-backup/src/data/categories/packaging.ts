import { Category } from '../../types/categories.js';

export const packaging: Category = {
  id: 'packaging',
  name: 'Packaging & Printing',
  description: 'Packaging materials, printing services, and related equipment',
  slug: 'packaging',
  icon: '📦',
  subcategories: [
    {
      id: 'packaging-materials',
      name: 'Packaging Materials',
      slug: 'packaging-materials',
      description: 'Materials for product packaging',
      icon: '📦'
    },
    {
      id: 'packaging-machinery',
      name: 'Packaging Machinery',
      slug: 'packaging-machinery',
      description: 'Equipment for packaging products',
      icon: '⚙️'
    },
    {
      id: 'printing-services',
      name: 'Printing Services',
      slug: 'printing-services',
      description: 'Commercial printing services',
      icon: '🖨️'
    },
    {
      id: 'printing-equipment',
      name: 'Printing Equipment',
      slug: 'printing-equipment',
      description: 'Machinery for printing',
      icon: '🖨️'
    },
    {
      id: 'labels-tags',
      name: 'Labels & Tags',
      slug: 'labels-tags',
      description: 'Product labels and identification tags',
      icon: '🏷️'
    },
    {
      id: 'packaging-design',
      name: 'Packaging Design',
      slug: 'packaging-design',
      description: 'Design services for packaging',
      icon: '✏️'
    },
    {
      id: 'sustainable-packaging',
      name: 'Sustainable Packaging',
      slug: 'sustainable-packaging',
      description: 'Eco-friendly packaging solutions',
      icon: '♻️'
    },
    {
      id: 'packaging-testing',
      name: 'Packaging Testing',
      slug: 'packaging-testing',
      description: 'Testing services for packaging materials',
      icon: '🔍'
    }
  ]
};
