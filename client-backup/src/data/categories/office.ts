import { Category } from '../../types/categories.js';

export const office: Category = {
  id: 'office-supplies',
  name: 'Office Supplies',
  description: 'Stationery, office equipment, and supplies for workplaces',
  slug: 'office-supplies',
  icon: '📎',
  subcategories: [
    {
      id: 'stationery',
      name: 'Stationery',
      slug: 'stationery',
      description: 'Paper, pens, and general office stationery',
      icon: '✏️'
    },
    {
      id: 'office-equipment',
      name: 'Office Equipment',
      slug: 'office-equipment',
      description: 'Printers, copiers, and other office machines',
      icon: '🖨️'
    },
    {
      id: 'office-furniture',
      name: 'Office Furniture',
      slug: 'office-furniture',
      description: 'Desks, chairs, and furniture for offices',
      icon: '🪑'
    },
    {
      id: 'filing-storage',
      name: 'Filing & Storage',
      slug: 'filing-storage',
      description: 'Filing cabinets and storage solutions',
      icon: '🗄️'
    },
    {
      id: 'presentation-supplies',
      name: 'Presentation Supplies',
      slug: 'presentation-supplies',
      description: 'Whiteboards, projectors, and presentation equipment',
      icon: '📊'
    },
    {
      id: 'paper-products',
      name: 'Paper Products',
      slug: 'paper-products',
      description: 'Various paper products for office use',
      icon: '📄'
    },
    {
      id: 'office-consumables',
      name: 'Office Consumables',
      slug: 'office-consumables',
      description: 'Ink, toner, and other consumable supplies',
      icon: '🖋️'
    },
    {
      id: 'office-technology',
      name: 'Office Technology',
      slug: 'office-technology',
      description: 'Computers, phones, and other technology for offices',
      icon: '💻'
    }
  ]
};
