import { Category } from '../../types/categories.js';

export const agriculture: Category = {
  id: 'agriculture',
  name: 'Agriculture',
  description: 'Agricultural products and equipment',
  slug: 'agriculture',
  icon: '🌾',
  subcategories: [
    {
      id: 'agriculture-equipment',
      name: 'Agriculture Equipment',
      slug: 'agriculture-equipment',
      description: 'Farm machinery and tools',
      icon: '🚜'
    },
    {
      id: 'fresh-flowers',
      name: 'Fresh Flowers',
      slug: 'fresh-flowers',
      description: 'Fresh flower supply chain',
      icon: '💐'
    },
    {
      id: 'seeds-saplings',
      name: 'Seeds & Saplings',
      slug: 'seeds-saplings',
      description: 'Quality seeds and young plants',
      icon: '🌱'
    },
    {
      id: 'tractor-parts',
      name: 'Tractor Parts',
      slug: 'tractor-parts',
      description: 'Replacement parts for tractors',
      icon: '🔧'
    },
    {
      id: 'animal-feed',
      name: 'Animal Feed',
      slug: 'animal-feed',
      description: 'Nutrition for livestock',
      icon: '🐄'
    },
    {
      id: 'irrigation-systems',
      name: 'Irrigation Systems',
      slug: 'irrigation-systems',
      description: 'Water management solutions',
      icon: '💧'
    },
    {
      id: 'fertilizers-pesticides',
      name: 'Fertilizers & Pesticides',
      slug: 'fertilizers-pesticides',
      description: 'Crop enhancement and protection',
      icon: '🧪'
    },
    {
      id: 'organic-farming-tools',
      name: 'Organic Farming Tools',
      slug: 'organic-farming-tools',
      description: 'Tools for sustainable agriculture',
      icon: '🌿'
    }
  ]
};
