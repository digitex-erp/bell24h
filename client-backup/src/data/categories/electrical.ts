import { Category } from '../../types/categories.js';

export const electrical: Category = {
  id: 'electrical',
  name: 'Electrical Equipment',
  description: 'Electrical components, equipment, and related products',
  slug: 'electrical',
  icon: '⚡',
  subcategories: [
    {
      id: 'electrical-components',
      name: 'Electrical Components',
      slug: 'electrical-components',
      description: 'Basic electrical components and parts',
      icon: '🔌'
    },
    {
      id: 'electrical-equipment',
      name: 'Electrical Equipment',
      slug: 'electrical-equipment',
      description: 'Machinery and equipment powered by electricity',
      icon: '⚙️'
    },
    {
      id: 'electrical-supplies',
      name: 'Electrical Supplies',
      slug: 'electrical-supplies',
      description: 'Wires, cables, and electrical supplies',
      icon: '🔌'
    },
    {
      id: 'lighting-equipment',
      name: 'Lighting Equipment',
      slug: 'lighting-equipment',
      description: 'Lights, fixtures, and lighting solutions',
      icon: '💡'
    },
    {
      id: 'electrical-testing',
      name: 'Electrical Testing Equipment',
      slug: 'electrical-testing',
      description: 'Equipment for testing electrical systems',
      icon: '🔍'
    },
    {
      id: 'electrical-control',
      name: 'Electrical Control Systems',
      slug: 'electrical-control',
      description: 'Systems for controlling electrical equipment',
      icon: '🎛️'
    },
    {
      id: 'electrical-generators',
      name: 'Electrical Generators',
      slug: 'electrical-generators',
      description: 'Equipment for generating electricity',
      icon: '⚡'
    },
    {
      id: 'electrical-services',
      name: 'Electrical Services',
      slug: 'electrical-services',
      description: 'Professional services for electrical systems',
      icon: '👨‍🔧'
    }
  ]
};
