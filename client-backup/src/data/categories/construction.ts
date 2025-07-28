import { Category } from '../../types/categories.js';

export const construction: Category = {
  id: 'construction',
  name: 'Construction',
  description: 'Building materials, equipment, and construction services',
  slug: 'construction',
  icon: '🏗️',
  subcategories: [
    {
      id: 'building-materials',
      name: 'Building Materials',
      slug: 'building-materials',
      description: 'Materials used in construction projects',
      icon: '🧱'
    },
    {
      id: 'construction-machinery',
      name: 'Construction Machinery',
      slug: 'construction-machinery',
      description: 'Heavy equipment and machinery for construction',
      icon: '🚜'
    },
    {
      id: 'plumbing-supplies',
      name: 'Plumbing Supplies',
      slug: 'plumbing-supplies',
      description: 'Pipes, fixtures, and supplies for plumbing',
      icon: '🚿'
    },
    {
      id: 'electrical-supplies',
      name: 'Electrical Supplies',
      slug: 'electrical-supplies',
      description: 'Wiring, fixtures, and electrical components',
      icon: '💡'
    },
    {
      id: 'hardware-tools',
      name: 'Hardware & Tools',
      slug: 'hardware-tools',
      description: 'Hand tools, power tools, and hardware',
      icon: '🔨'
    },
    {
      id: 'paints-coatings',
      name: 'Paints & Coatings',
      slug: 'paints-coatings',
      description: 'Paints, varnishes, and protective coatings',
      icon: '🎨'
    },
    {
      id: 'roofing-materials',
      name: 'Roofing Materials',
      slug: 'roofing-materials',
      description: 'Materials for roof construction and repair',
      icon: '🏠'
    },
    {
      id: 'construction-services',
      name: 'Construction Services',
      slug: 'construction-services',
      description: 'Professional services for construction projects',
      icon: '👷'
    }
  ]
};
