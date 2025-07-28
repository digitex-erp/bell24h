import { Category } from '../../types/categories.js';

export const chemicals: Category = {
  id: 'chemicals',
  name: 'Chemicals',
  description: 'Industrial chemicals, raw materials, and related products',
  slug: 'chemicals',
  icon: '🧪',
  subcategories: [
    {
      id: 'industrial-chemicals',
      name: 'Industrial Chemicals',
      slug: 'industrial-chemicals',
      description: 'Chemicals for industrial applications',
      icon: '🏭'
    },
    {
      id: 'laboratory-chemicals',
      name: 'Laboratory Chemicals',
      slug: 'laboratory-chemicals',
      description: 'Chemicals for laboratory and research use',
      icon: '🔬'
    },
    {
      id: 'agricultural-chemicals',
      name: 'Agricultural Chemicals',
      slug: 'agricultural-chemicals',
      description: 'Fertilizers, pesticides, and other agricultural chemicals',
      icon: '🌱'
    },
    {
      id: 'cleaning-chemicals',
      name: 'Cleaning Chemicals',
      slug: 'cleaning-chemicals',
      description: 'Chemicals for cleaning and sanitation',
      icon: '🧼'
    },
    {
      id: 'chemical-equipment',
      name: 'Chemical Equipment',
      slug: 'chemical-equipment',
      description: 'Equipment for chemical processing',
      icon: '⚗️'
    },
    {
      id: 'chemical-raw-materials',
      name: 'Chemical Raw Materials',
      slug: 'chemical-raw-materials',
      description: 'Raw materials for chemical production',
      icon: '📦'
    },
    {
      id: 'specialty-chemicals',
      name: 'Specialty Chemicals',
      slug: 'specialty-chemicals',
      description: 'Chemicals for specific applications',
      icon: '💎'
    },
    {
      id: 'chemical-safety',
      name: 'Chemical Safety Equipment',
      slug: 'chemical-safety',
      description: 'Safety equipment for handling chemicals',
      icon: '🛡️'
    }
  ]
};
