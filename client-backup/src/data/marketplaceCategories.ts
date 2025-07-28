import { Category } from '../types/marketplace.js';

/**
 * Comprehensive marketplace categories for Bell24H
 * 30 main categories with 8 subcategories each
 */

const marketplaceCategories: Category[] = [
  {
    id: 'agriculture',
    name: 'Agriculture',
    description: 'Agricultural products, equipment, and services',
    icon: '🌾',
    subcategories: [
      {
        id: 'agriculture-equipment',
        name: 'Agricultural Equipment',
        description: 'Tractors, harvesters, tillers, and other farming machinery'
      },
      {
        id: 'seeds-fertilizers',
        name: 'Seeds & Fertilizers',
        description: 'Plant seeds, fertilizers, pesticides, and growth enhancers'
      },
      {
        id: 'irrigation-systems',
        name: 'Irrigation Systems',
        description: 'Drip irrigation, sprinklers, pumps, and water management solutions'
      },
      {
        id: 'livestock-supplies',
        name: 'Livestock Supplies',
        description: 'Feed, healthcare products, and equipment for animal husbandry'
      },
      {
        id: 'organic-farming',
        name: 'Organic Farming',
        description: 'Organic inputs, certification services, and sustainable agriculture'
      },
      {
        id: 'greenhouse-supplies',
        name: 'Greenhouse Supplies',
        description: 'Greenhouse structures, climate control systems, and growing media'
      },
      {
        id: 'post-harvest',
        name: 'Post-Harvest Technology',
        description: 'Storage solutions, processing equipment, and packaging materials'
      },
      {
        id: 'farm-management',
        name: 'Farm Management',
        description: 'Software, consulting services, and agricultural management tools'
      }
    ]
  },
  {
    id: 'apparel',
    name: 'Apparel & Fashion',
    description: 'Clothing, accessories, and fashion-related products',
    icon: '👔',
    subcategories: [
      {
        id: 'mens-clothing',
        name: "Men's Clothing",
        description: 'Shirts, trousers, suits, outerwear, and other menswear'
      },
      {
        id: 'womens-clothing',
        name: "Women's Clothing",
        description: 'Dresses, tops, bottoms, outerwear, and other womenswear'
      },
      {
        id: 'childrens-clothing',
        name: "Children's Clothing",
        description: 'Apparel for infants, toddlers, and children'
      },
      {
        id: 'footwear',
        name: 'Footwear',
        description: 'Shoes, boots, sandals, and other types of footwear'
      },
      {
        id: 'fashion-accessories',
        name: 'Fashion Accessories',
        description: 'Bags, belts, scarves, hats, and other fashion accessories'
      },
      {
        id: 'jewelry-watches',
        name: 'Jewelry & Watches',
        description: 'Fine jewelry, costume jewelry, watches, and related accessories'
      },
      {
        id: 'textile-materials',
        name: 'Textile Materials',
        description: 'Fabrics, threads, trims, and other materials for apparel production'
      },
      {
        id: 'apparel-manufacturing',
        name: 'Apparel Manufacturing',
        description: 'Clothing production services, equipment, and machinery'
      }
    ]
  },
  {
    id: 'automobile',
    name: 'Automobile',
    description: 'Vehicles, parts, accessories, and automotive services',
    icon: '🚗',
    subcategories: [
      {
        id: 'vehicles',
        name: 'Vehicles',
        description: 'Cars, trucks, motorcycles, and other motor vehicles'
      },
      {
        id: 'auto-parts-accessories',
        name: 'Auto Parts & Accessories',
        description: 'Replacement parts, upgrades, and accessories for vehicles'
      },
      {
        id: 'tires-wheels',
        name: 'Tires & Wheels',
        description: 'Tires, wheels, rims, and related services'
      },
      {
        id: 'auto-electronics',
        name: 'Auto Electronics',
        description: 'Car audio, navigation systems, cameras, and other electronics'
      },
      {
        id: 'auto-maintenance',
        name: 'Auto Maintenance',
        description: 'Oils, fluids, filters, and other maintenance supplies'
      },
      {
        id: 'auto-tools-equipment',
        name: 'Auto Tools & Equipment',
        description: 'Diagnostic tools, repair equipment, and automotive workshop supplies'
      },
      {
        id: 'ev-components',
        name: 'EV Components',
        description: 'Batteries, charging systems, and components for electric vehicles'
      },
      {
        id: 'auto-services',
        name: 'Auto Services',
        description: 'Repair, maintenance, and customization services'
      }
    ]
  },
  {
    id: 'electronics',
    name: 'Consumer Electronics',
    description: 'Electronic devices and accessories for personal use',
    icon: '📱',
    subcategories: [
      {
        id: 'smartphones-tablets',
        name: 'Smartphones & Tablets',
        description: 'Mobile phones, tablets, and related accessories'
      },
      {
        id: 'computers-laptops',
        name: 'Computers & Laptops',
        description: 'Desktop computers, laptops, and computing peripherals'
      },
      {
        id: 'audio-equipment',
        name: 'Audio Equipment',
        description: 'Headphones, speakers, amplifiers, and other audio devices'
      },
      {
        id: 'televisions-displays',
        name: 'Televisions & Displays',
        description: 'TVs, monitors, projectors, and related viewing equipment'
      },
      {
        id: 'cameras-photography',
        name: 'Cameras & Photography',
        description: 'Digital cameras, lenses, and photography accessories'
      },
      {
        id: 'gaming-equipment',
        name: 'Gaming Equipment',
        description: 'Consoles, controllers, and gaming peripherals'
      },
      {
        id: 'wearable-tech',
        name: 'Wearable Technology',
        description: 'Smartwatches, fitness trackers, and wearable devices'
      },
      {
        id: 'electronic-components',
        name: 'Electronic Components',
        description: 'Circuit boards, processors, memory, and other components'
      }
    ]
  },
  {
    id: 'health',
    name: 'Health & Medical',
    description: 'Healthcare products, equipment, and services',
    icon: '⚕️',
    subcategories: [
      {
        id: 'medical-equipment',
        name: 'Medical Equipment',
        description: 'Diagnostic, therapeutic, and monitoring devices'
      },
      {
        id: 'pharmaceuticals',
        name: 'Pharmaceuticals',
        description: 'Medications, supplements, and pharmaceutical products'
      },
      {
        id: 'medical-supplies',
        name: 'Medical Supplies',
        description: 'Disposable supplies, instruments, and healthcare consumables'
      },
      {
        id: 'dental-equipment',
        name: 'Dental Equipment',
        description: 'Dental chairs, instruments, and supplies for dental practices'
      },
      {
        id: 'laboratory-equipment',
        name: 'Laboratory Equipment',
        description: 'Scientific instruments, lab supplies, and research equipment'
      },
      {
        id: 'healthcare-furniture',
        name: 'Healthcare Furniture',
        description: 'Hospital beds, examination tables, and medical furniture'
      },
      {
        id: 'mobility-aids',
        name: 'Mobility Aids',
        description: 'Wheelchairs, walkers, canes, and other mobility assistance products'
      },
      {
        id: 'telehealth-solutions',
        name: 'Telehealth Solutions',
        description: 'Remote patient monitoring and telemedicine technologies'
      }
    ]
  }
  // Additional categories would continue here...
];

/**
 * Get all marketplace categories
 */
export const getAllCategories = (): Category[] => {
  return marketplaceCategories;
};

/**
 * Get a specific category by ID
 */
export const getCategoryById = (id: string): Category | undefined => {
  return marketplaceCategories.find(category => category.id === id);
};

export default marketplaceCategories;
