import { Category } from '../../types/categories.js';

export const gifts: Category = {
  id: 'gifts-crafts',
  name: 'Gifts & Crafts',
  description: 'Gift items, crafts, and related products',
  slug: 'gifts-crafts',
  icon: '🎁',
  subcategories: [
    {
      id: 'corporate-gifts',
      name: 'Corporate Gifts',
      slug: 'corporate-gifts',
      description: 'Gifts for business and corporate purposes',
      icon: '💼'
    },
    {
      id: 'handmade-crafts',
      name: 'Handmade Crafts',
      slug: 'handmade-crafts',
      description: 'Artisanal and handcrafted items',
      icon: '🧶'
    },
    {
      id: 'festive-decorations',
      name: 'Festive Decorations',
      slug: 'festive-decorations',
      description: 'Decorations for festivals and celebrations',
      icon: '🎄'
    },
    {
      id: 'art-collectibles',
      name: 'Art & Collectibles',
      slug: 'art-collectibles',
      description: 'Artistic works and collectible items',
      icon: '🖼️'
    },
    {
      id: 'craft-supplies',
      name: 'Craft Supplies',
      slug: 'craft-supplies',
      description: 'Materials and supplies for crafting',
      icon: '✂️'
    },
    {
      id: 'personalized-gifts',
      name: 'Personalized Gifts',
      slug: 'personalized-gifts',
      description: 'Custom and personalized gift items',
      icon: '🏷️'
    },
    {
      id: 'souvenirs',
      name: 'Souvenirs',
      slug: 'souvenirs',
      description: 'Mementos and souvenir items',
      icon: '🧸'
    },
    {
      id: 'gift-packaging',
      name: 'Gift Packaging',
      slug: 'gift-packaging',
      description: 'Materials for packaging gifts',
      icon: '📦'
    }
  ]
};
