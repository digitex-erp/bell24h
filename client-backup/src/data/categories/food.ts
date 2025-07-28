import { Category } from '../../types/categories.js';

export const food: Category = {
  id: 'food-beverage',
  name: 'Food & Beverage',
  description: 'Food products, beverages, and related equipment',
  slug: 'food-beverage',
  icon: '🍽️',
  subcategories: [
    {
      id: 'processed-food',
      name: 'Processed Food',
      slug: 'processed-food',
      description: 'Packaged and processed food products',
      icon: '🥫'
    },
    {
      id: 'beverages',
      name: 'Beverages',
      slug: 'beverages',
      description: 'Drinks and liquid refreshments',
      icon: '🥤'
    },
    {
      id: 'dairy-products',
      name: 'Dairy Products',
      slug: 'dairy-products',
      description: 'Milk, cheese, and other dairy items',
      icon: '🧀'
    },
    {
      id: 'bakery-products',
      name: 'Bakery Products',
      slug: 'bakery-products',
      description: 'Bread, pastries, and baked goods',
      icon: '🍞'
    },
    {
      id: 'meat-poultry',
      name: 'Meat & Poultry',
      slug: 'meat-poultry',
      description: 'Meat and poultry products',
      icon: '🥩'
    },
    {
      id: 'seafood',
      name: 'Seafood',
      slug: 'seafood',
      description: 'Fish and seafood products',
      icon: '🐟'
    },
    {
      id: 'food-processing-equipment',
      name: 'Food Processing Equipment',
      slug: 'food-processing-equipment',
      description: 'Machinery for food processing',
      icon: '⚙️'
    },
    {
      id: 'food-packaging',
      name: 'Food Packaging',
      slug: 'food-packaging',
      description: 'Materials and equipment for food packaging',
      icon: '📦'
    }
  ]
};
