import { Category } from '../../types/categories.js';

export const automobile: Category = {
  id: 'automobile',
  name: 'Automobile',
  description: 'Vehicles, parts, and automotive services',
  slug: 'automobile',
  icon: '🚗',
  subcategories: [
    {
      id: 'auto-parts',
      name: 'Auto Parts & Accessories',
      slug: 'auto-parts',
      description: 'Replacement parts and accessories for vehicles',
      icon: '🔧'
    },
    {
      id: 'commercial-vehicles',
      name: 'Commercial Vehicles',
      slug: 'commercial-vehicles',
      description: 'Trucks, buses, and other commercial transport',
      icon: '🚚'
    },
    {
      id: 'passenger-cars',
      name: 'Passenger Cars',
      slug: 'passenger-cars',
      description: 'Sedans, SUVs, and other personal vehicles',
      icon: '🚙'
    },
    {
      id: 'electric-vehicles',
      name: 'Electric Vehicles',
      slug: 'electric-vehicles',
      description: 'Battery-powered and hybrid vehicles',
      icon: '⚡'
    },
    {
      id: 'automotive-electronics',
      name: 'Automotive Electronics',
      slug: 'automotive-electronics',
      description: 'Navigation systems, entertainment, and control modules',
      icon: '📱'
    },
    {
      id: 'tires-wheels',
      name: 'Tires & Wheels',
      slug: 'tires-wheels',
      description: 'Tires, rims, and related accessories',
      icon: '🛞'
    },
    {
      id: 'auto-maintenance',
      name: 'Auto Maintenance Equipment',
      slug: 'auto-maintenance',
      description: 'Tools and equipment for vehicle maintenance',
      icon: '🔨'
    },
    {
      id: 'auto-manufacturing',
      name: 'Auto Manufacturing Equipment',
      slug: 'auto-manufacturing',
      description: 'Equipment for automotive production',
      icon: '🏭'
    }
  ]
};
