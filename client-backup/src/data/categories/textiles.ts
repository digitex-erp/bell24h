import { Category } from '../../types/categories.js';

export const textiles: Category = {
  id: 'textiles',
  name: 'Textiles & Leather Products',
  description: 'Textile materials, leather products, and related equipment',
  slug: 'textiles',
  icon: '🧵',
  subcategories: [
    {
      id: 'textile-materials',
      name: 'Textile Materials',
      slug: 'textile-materials',
      description: 'Raw materials for textile production',
      icon: '🧶'
    },
    {
      id: 'textile-machinery',
      name: 'Textile Machinery',
      slug: 'textile-machinery',
      description: 'Equipment for textile manufacturing',
      icon: '⚙️'
    },
    {
      id: 'leather-materials',
      name: 'Leather Materials',
      slug: 'leather-materials',
      description: 'Raw and processed leather materials',
      icon: '🐄'
    },
    {
      id: 'leather-products',
      name: 'Leather Products',
      slug: 'leather-products',
      description: 'Finished products made from leather',
      icon: '👜'
    },
    {
      id: 'textile-processing',
      name: 'Textile Processing',
      slug: 'textile-processing',
      description: 'Services for processing textiles',
      icon: '🏭'
    },
    {
      id: 'textile-chemicals',
      name: 'Textile Chemicals',
      slug: 'textile-chemicals',
      description: 'Chemicals used in textile production',
      icon: '🧪'
    },
    {
      id: 'textile-design',
      name: 'Textile Design',
      slug: 'textile-design',
      description: 'Design services for textiles',
      icon: '✏️'
    },
    {
      id: 'textile-recycling',
      name: 'Textile Recycling',
      slug: 'textile-recycling',
      description: 'Services for recycling textile materials',
      icon: '♻️'
    }
  ]
};
