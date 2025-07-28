import { Category } from '../../types/categories.js';

export const toys: Category = {
  id: 'toys',
  name: 'Toys & Hobbies',
  description: 'Toys, games, and hobby supplies',
  slug: 'toys',
  icon: '🧸',
  subcategories: [
    {
      id: 'educational-toys',
      name: 'Educational Toys',
      slug: 'educational-toys',
      description: 'Toys designed for learning and development',
      icon: '🧩'
    },
    {
      id: 'action-figures',
      name: 'Action Figures & Collectibles',
      slug: 'action-figures',
      description: 'Collectible figures and memorabilia',
      icon: '🦸'
    },
    {
      id: 'board-games',
      name: 'Board Games & Puzzles',
      slug: 'board-games',
      description: 'Games and puzzles for entertainment',
      icon: '🎲'
    },
    {
      id: 'outdoor-toys',
      name: 'Outdoor Toys',
      slug: 'outdoor-toys',
      description: 'Toys for outdoor play',
      icon: '🏐'
    },
    {
      id: 'hobby-supplies',
      name: 'Hobby Supplies',
      slug: 'hobby-supplies',
      description: 'Materials and supplies for various hobbies',
      icon: '🎨'
    },
    {
      id: 'electronic-toys',
      name: 'Electronic Toys',
      slug: 'electronic-toys',
      description: 'Battery-operated and electronic toys',
      icon: '🤖'
    },
    {
      id: 'model-kits',
      name: 'Model Kits',
      slug: 'model-kits',
      description: 'Scale models and assembly kits',
      icon: '✈️'
    },
    {
      id: 'toy-manufacturing',
      name: 'Toy Manufacturing Equipment',
      slug: 'toy-manufacturing',
      description: 'Equipment for toy production',
      icon: '⚙️'
    }
  ]
};
