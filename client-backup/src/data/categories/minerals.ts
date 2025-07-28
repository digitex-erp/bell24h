import { Category } from '../../types/categories.js';

export const minerals: Category = {
  id: 'minerals-metallurgy',
  name: 'Minerals & Metallurgy',
  description: 'Mining equipment, metals, minerals, and metallurgical products',
  slug: 'minerals-metallurgy',
  icon: '⛏️',
  subcategories: [
    {
      id: 'mining-equipment',
      name: 'Mining Equipment',
      slug: 'mining-equipment',
      description: 'Equipment for mining operations',
      icon: '⛏️'
    },
    {
      id: 'metal-products',
      name: 'Metal Products',
      slug: 'metal-products',
      description: 'Finished products made from metals',
      icon: '🔨'
    },
    {
      id: 'raw-metals',
      name: 'Raw Metals',
      slug: 'raw-metals',
      description: 'Unprocessed metals and alloys',
      icon: '🧲'
    },
    {
      id: 'minerals',
      name: 'Minerals',
      slug: 'minerals',
      description: 'Various minerals and mineral products',
      icon: '💎'
    },
    {
      id: 'metallurgical-equipment',
      name: 'Metallurgical Equipment',
      slug: 'metallurgical-equipment',
      description: 'Equipment for metal processing',
      icon: '⚙️'
    },
    {
      id: 'metal-processing',
      name: 'Metal Processing Services',
      slug: 'metal-processing',
      description: 'Services for processing metals',
      icon: '🏭'
    },
    {
      id: 'mineral-processing',
      name: 'Mineral Processing',
      slug: 'mineral-processing',
      description: 'Equipment and services for mineral processing',
      icon: '⚗️'
    },
    {
      id: 'metallurgical-testing',
      name: 'Metallurgical Testing',
      slug: 'metallurgical-testing',
      description: 'Testing services for metals and minerals',
      icon: '🔬'
    }
  ]
};
