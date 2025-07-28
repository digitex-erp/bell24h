import { Category } from '../../types/categories.js';

export const environment: Category = {
  id: 'environment',
  name: 'Environment',
  description: 'Environmental services, equipment, and sustainable solutions',
  slug: 'environment',
  icon: '🌍',
  subcategories: [
    {
      id: 'waste-management',
      name: 'Waste Management',
      slug: 'waste-management',
      description: 'Services and equipment for waste handling and disposal',
      icon: '♻️'
    },
    {
      id: 'water-treatment',
      name: 'Water Treatment',
      slug: 'water-treatment',
      description: 'Equipment and services for water purification and treatment',
      icon: '💧'
    },
    {
      id: 'air-quality',
      name: 'Air Quality Control',
      slug: 'air-quality',
      description: 'Systems for monitoring and improving air quality',
      icon: '💨'
    },
    {
      id: 'environmental-testing',
      name: 'Environmental Testing',
      slug: 'environmental-testing',
      description: 'Services for environmental testing and analysis',
      icon: '🔬'
    },
    {
      id: 'recycling-equipment',
      name: 'Recycling Equipment',
      slug: 'recycling-equipment',
      description: 'Machinery for recycling materials',
      icon: '♻️'
    },
    {
      id: 'sustainable-energy',
      name: 'Sustainable Energy Solutions',
      slug: 'sustainable-energy',
      description: 'Equipment and services for renewable energy',
      icon: '☀️'
    },
    {
      id: 'environmental-consulting',
      name: 'Environmental Consulting',
      slug: 'environmental-consulting',
      description: 'Professional consulting for environmental issues',
      icon: '📝'
    },
    {
      id: 'green-building',
      name: 'Green Building Materials',
      slug: 'green-building',
      description: 'Sustainable materials for construction',
      icon: '🏗️'
    }
  ]
};
