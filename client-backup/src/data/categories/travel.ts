import { Category } from '../../types/categories.js';

export const travel: Category = {
  id: 'travel-hospitality',
  name: 'Travel & Hospitality',
  description: 'Travel services, hospitality equipment, and related products',
  slug: 'travel-hospitality',
  icon: '✈️',
  subcategories: [
    {
      id: 'hotel-supplies',
      name: 'Hotel Supplies & Equipment',
      slug: 'hotel-supplies',
      description: 'Supplies and equipment for hotels',
      icon: '🏨'
    },
    {
      id: 'restaurant-equipment',
      name: 'Restaurant Equipment',
      slug: 'restaurant-equipment',
      description: 'Equipment for restaurants and food service',
      icon: '🍽️'
    },
    {
      id: 'travel-accessories',
      name: 'Travel Accessories',
      slug: 'travel-accessories',
      description: 'Products for travelers',
      icon: '🧳'
    },
    {
      id: 'tourism-services',
      name: 'Tourism Services',
      slug: 'tourism-services',
      description: 'Services for tourism and travel',
      icon: '🏝️'
    },
    {
      id: 'event-equipment',
      name: 'Event Equipment',
      slug: 'event-equipment',
      description: 'Equipment for events and conferences',
      icon: '🎪'
    },
    {
      id: 'catering-equipment',
      name: 'Catering Equipment',
      slug: 'catering-equipment',
      description: 'Equipment for catering services',
      icon: '🍲'
    },
    {
      id: 'hospitality-software',
      name: 'Hospitality Software',
      slug: 'hospitality-software',
      description: 'Software for hospitality management',
      icon: '💻'
    },
    {
      id: 'hospitality-consulting',
      name: 'Hospitality Consulting',
      slug: 'hospitality-consulting',
      description: 'Consulting services for hospitality industry',
      icon: '📝'
    }
  ]
};
