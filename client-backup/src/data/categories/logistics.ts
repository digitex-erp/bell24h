import { Category } from '../../types/categories.js';

export const logistics: Category = {
  id: 'logistics',
  name: 'Logistics & Transportation',
  description: 'Transportation, shipping, and logistics services',
  slug: 'logistics',
  icon: '🚚',
  subcategories: [
    {
      id: 'freight-services',
      name: 'Freight Services',
      slug: 'freight-services',
      description: 'Cargo transportation and freight forwarding',
      icon: '🚢'
    },
    {
      id: 'warehousing',
      name: 'Warehousing',
      slug: 'warehousing',
      description: 'Storage and warehouse facilities',
      icon: '🏭'
    },
    {
      id: 'supply-chain-management',
      name: 'Supply Chain Management',
      slug: 'supply-chain-management',
      description: 'End-to-end supply chain solutions',
      icon: '📊'
    },
    {
      id: 'shipping-containers',
      name: 'Shipping Containers',
      slug: 'shipping-containers',
      description: 'Containers for shipping and storage',
      icon: '📦'
    },
    {
      id: 'logistics-equipment',
      name: 'Logistics Equipment',
      slug: 'logistics-equipment',
      description: 'Equipment for logistics operations',
      icon: '⚙️'
    },
    {
      id: 'transportation-services',
      name: 'Transportation Services',
      slug: 'transportation-services',
      description: 'Services for moving goods and people',
      icon: '🚛'
    },
    {
      id: 'tracking-systems',
      name: 'Tracking Systems',
      slug: 'tracking-systems',
      description: 'Technology for tracking shipments',
      icon: '📱'
    },
    {
      id: 'customs-brokerage',
      name: 'Customs Brokerage',
      slug: 'customs-brokerage',
      description: 'Services for customs clearance',
      icon: '📝'
    }
  ]
};
