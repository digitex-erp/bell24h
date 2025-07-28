import { Category } from '../../types/categories.js';

export const apparel: Category = {
  id: 'apparel-fashion',
  name: 'Apparel & Fashion',
  description: 'Clothing, accessories, and fashion items',
  slug: 'apparel-fashion',
  icon: '👔',
  subcategories: [
    {
      id: 'mens-clothing',
      name: 'Men\'s Clothing',
      slug: 'mens-clothing',
      description: 'Shirts, pants, suits and more',
      icon: '👕'
    },
    {
      id: 'womens-clothing',
      name: 'Women\'s Clothing',
      slug: 'womens-clothing',
      description: 'Dresses, tops, skirts and more',
      icon: '👗'
    },
    {
      id: 'kids-clothing',
      name: 'Kids\' Clothing',
      slug: 'kids-clothing',
      description: 'Clothing for children and infants',
      icon: '👶'
    },
    {
      id: 'footwear',
      name: 'Footwear',
      slug: 'footwear',
      description: 'Shoes, boots, sandals and more',
      icon: '👞'
    },
    {
      id: 'fashion-accessories',
      name: 'Fashion Accessories',
      slug: 'fashion-accessories',
      description: 'Belts, scarves, hats and more',
      icon: '👜'
    },
    {
      id: 'jewelry-watches',
      name: 'Jewelry & Watches',
      slug: 'jewelry-watches',
      description: 'Fine jewelry, costume jewelry and watches',
      icon: '⌚'
    },
    {
      id: 'textile-fabrics',
      name: 'Textile & Fabrics',
      slug: 'textile-fabrics',
      description: 'Raw materials for clothing production',
      icon: '🧵'
    },
    {
      id: 'fashion-design-services',
      name: 'Fashion Design Services',
      slug: 'fashion-design-services',
      description: 'Custom design and tailoring services',
      icon: '✂️'
    }
  ]
};
