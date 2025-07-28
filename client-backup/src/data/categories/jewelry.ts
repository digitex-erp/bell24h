import { Category } from '../../types/categories.js';

export const jewelry: Category = {
  id: 'jewelry',
  name: 'Jewelry',
  description: 'Jewelry items, precious stones, and related equipment',
  slug: 'jewelry',
  icon: '💍',
  subcategories: [
    {
      id: 'fine-jewelry',
      name: 'Fine Jewelry',
      slug: 'fine-jewelry',
      description: 'Jewelry made with precious metals and gemstones',
      icon: '💎'
    },
    {
      id: 'fashion-jewelry',
      name: 'Fashion Jewelry',
      slug: 'fashion-jewelry',
      description: 'Costume and fashion jewelry items',
      icon: '👑'
    },
    {
      id: 'gemstones',
      name: 'Gemstones',
      slug: 'gemstones',
      description: 'Precious and semi-precious stones',
      icon: '💎'
    },
    {
      id: 'jewelry-making',
      name: 'Jewelry Making Supplies',
      slug: 'jewelry-making',
      description: 'Materials and supplies for making jewelry',
      icon: '🧵'
    },
    {
      id: 'jewelry-equipment',
      name: 'Jewelry Equipment',
      slug: 'jewelry-equipment',
      description: 'Tools and equipment for jewelry making',
      icon: '⚒️'
    },
    {
      id: 'watches',
      name: 'Watches',
      slug: 'watches',
      description: 'Wristwatches and timepieces',
      icon: '⌚'
    },
    {
      id: 'jewelry-packaging',
      name: 'Jewelry Packaging',
      slug: 'jewelry-packaging',
      description: 'Boxes and packaging for jewelry items',
      icon: '📦'
    },
    {
      id: 'jewelry-services',
      name: 'Jewelry Services',
      slug: 'jewelry-services',
      description: 'Repair, design, and other jewelry services',
      icon: '👨‍🔧'
    }
  ]
};
