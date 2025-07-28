import { Category } from '../../types/categories.js';

export const electronics: Category = {
  id: 'consumer-electronics',
  name: 'Consumer Electronics',
  description: 'Electronic devices and accessories for consumers',
  slug: 'consumer-electronics',
  icon: '📱',
  subcategories: [
    {
      id: 'smartphones',
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Mobile phones with advanced computing capabilities',
      icon: '📱'
    },
    {
      id: 'laptops-computers',
      name: 'Laptops & Computers',
      slug: 'laptops-computers',
      description: 'Portable and desktop computing devices',
      icon: '💻'
    },
    {
      id: 'audio-equipment',
      name: 'Audio Equipment',
      slug: 'audio-equipment',
      description: 'Speakers, headphones, and sound systems',
      icon: '🎧'
    },
    {
      id: 'cameras-photography',
      name: 'Cameras & Photography',
      slug: 'cameras-photography',
      description: 'Digital cameras and photography equipment',
      icon: '📷'
    },
    {
      id: 'wearable-technology',
      name: 'Wearable Technology',
      slug: 'wearable-technology',
      description: 'Smartwatches, fitness trackers, and wearable devices',
      icon: '⌚'
    },
    {
      id: 'gaming-consoles',
      name: 'Gaming Consoles',
      slug: 'gaming-consoles',
      description: 'Video game consoles and accessories',
      icon: '🎮'
    },
    {
      id: 'home-entertainment',
      name: 'Home Entertainment',
      slug: 'home-entertainment',
      description: 'TVs, home theater systems, and streaming devices',
      icon: '📺'
    },
    {
      id: 'electronic-components',
      name: 'Electronic Components',
      slug: 'electronic-components',
      description: 'Parts and components for electronic devices',
      icon: '🔌'
    }
  ]
};
