import { Category } from '../../types/categories.js';

export const sports: Category = {
  id: 'sports-entertainment',
  name: 'Sports & Entertainment',
  description: 'Sports equipment, entertainment products, and related services',
  slug: 'sports-entertainment',
  icon: '🏆',
  subcategories: [
    {
      id: 'sports-equipment',
      name: 'Sports Equipment',
      slug: 'sports-equipment',
      description: 'Equipment for various sports and activities',
      icon: '⚽'
    },
    {
      id: 'fitness-equipment',
      name: 'Fitness Equipment',
      slug: 'fitness-equipment',
      description: 'Equipment for exercise and fitness',
      icon: '🏋️'
    },
    {
      id: 'outdoor-recreation',
      name: 'Outdoor Recreation',
      slug: 'outdoor-recreation',
      description: 'Equipment for outdoor activities',
      icon: '🏕️'
    },
    {
      id: 'entertainment-equipment',
      name: 'Entertainment Equipment',
      slug: 'entertainment-equipment',
      description: 'Equipment for entertainment venues',
      icon: '🎭'
    },
    {
      id: 'musical-instruments',
      name: 'Musical Instruments',
      slug: 'musical-instruments',
      description: 'Instruments and music equipment',
      icon: '🎸'
    },
    {
      id: 'gaming-equipment',
      name: 'Gaming Equipment',
      slug: 'gaming-equipment',
      description: 'Video games and gaming equipment',
      icon: '🎮'
    },
    {
      id: 'sports-facilities',
      name: 'Sports Facilities',
      slug: 'sports-facilities',
      description: 'Equipment for sports venues and facilities',
      icon: '🏟️'
    },
    {
      id: 'event-management',
      name: 'Event Management',
      slug: 'event-management',
      description: 'Services for organizing sports and entertainment events',
      icon: '📅'
    }
  ]
};
