export type RFQCategory = 
  | 'agriculture'
  | 'apparel-fashion'
  | 'automobile'
  | 'ayurveda-herbal'
  | 'business-services'
  | 'chemical'
  | 'computers-internet'
  | 'consumer-electronics'
  | 'cosmetics-personal-care'
  | 'electronics-electrical'
  | 'food-beverage'
  | 'furniture-carpentry'
  | 'gifts-crafts'
  | 'health-beauty'
  | 'home-furnishings'
  | 'home-supplies'
  | 'industrial-machinery'
  | 'industrial-supplies'
  | 'jewelry-designers'
  | 'mineral-metals'
  | 'office-supplies'
  | 'packaging-paper'
  | 'real-estate-construction'
  | 'security-products'
  | 'sports-entertainment'
  | 'telecommunication'
  | 'textiles-fabrics'
  | 'tools-equipment'
  | 'tours-travels'
  | 'toys-games'
  | 'renewable-energy'
  | 'artificial-intelligence'
  | 'sustainable-eco'
  | 'healthcare-technology'
  | 'ecommerce-platforms'
  | 'gaming-esports'
  | 'electric-vehicles'
  | 'drones-uavs'
  | 'wearable-technology'
  | 'logistics-supply-chain'
  | '3d-printing'
  | 'food-tech'
  | 'iron-steel'
  | 'mining-raw-materials'
  | 'metal-recycling'
  | 'metallurgy-metalworking'
  | 'heavy-machinery'
  | 'ferrous-non-ferrous'
  | 'mining-safety'
  | 'precious-metals';

export interface RFQ {
  id: string;
  category: RFQCategory;
  subcategory?: string;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  specifications: string[];
  timeline: string;
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
  location: {
    country: string;
    city?: string;
  };
  status: 'open' | 'closed' | 'in_progress';
  createdAt: string;
  updatedAt: string;
  buyerId: string;
  responses?: RFQResponse[];
}

export interface RFQResponse {
  id: string;
  rfqId: string;
  supplierId: string;
  price: number;
  currency: string;
  deliveryTime: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface CategoryConfig {
  id: RFQCategory;
  name: string;
  description: string;
  icon: string;
  subcategories: string[];
  mockupRFQs: Omit<RFQ, 'id' | 'createdAt' | 'updatedAt' | 'buyerId' | 'responses'>[];
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
} 