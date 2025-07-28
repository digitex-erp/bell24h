import type { CurrencyInfo } from '../services/currencyService';

/**
 * Base product interface with common fields
 */
export interface BaseProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  status: 'draft' | 'published' | 'archived' | 'sold_out';
  tags?: string[];
  images?: string[];
  thumbnail_url?: string;
  video_url?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  metadata?: Record<string, any>;
}

/**
 * Product with pricing information
 */
export interface PricedProduct extends BaseProduct {
  base_price: number;
  base_currency: string;
  prices?: {
    [currency: string]: number; // Key is currency code, value is price in that currency
  };
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
    valid_until?: string;
  };
  tax_included: boolean;
  tax_rate?: number; // Tax rate as a decimal (e.g., 0.18 for 18%)
}

/**
 * Product variant
 */
export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  option1?: string;
  option2?: string;
  option3?: string;
  price: number;
  compare_at_price?: number;
  cost_price?: number;
  barcode?: string;
  inventory_quantity: number;
  weight?: number;
  weight_unit: 'g' | 'kg' | 'oz' | 'lb';
  requires_shipping: boolean;
  taxable: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Product with variants
 */
export interface ProductWithVariants extends PricedProduct {
  variants: ProductVariant[];
  options: ProductOption[];
}

/**
 * Product option (for variants)
 */
export interface ProductOption {
  id: string;
  product_id: string;
  name: string;
  position: number;
  values: string[];
}

/**
 * Product filter options
 */
export interface ProductFilterOptions {
  query?: string;
  category?: string;
  subcategory?: string;
  min_price?: number;
  max_price?: number;
  currency?: string;
  status?: string[];
  tags?: string[];
  sort_by?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}

/**
 * Product creation/update payload
 */
export interface ProductPayload extends Omit<BaseProduct, 'id' | 'created_at' | 'updated_at'> {
  base_price: number;
  base_currency: string;
  compare_at_price?: number;
  cost_price?: number;
  sku?: string;
  barcode?: string;
  inventory_quantity?: number;
  weight?: number;
  weight_unit?: 'g' | 'kg' | 'oz' | 'lb';
  requires_shipping?: boolean;
  taxable?: boolean;
  tax_rate?: number;
  tax_included?: boolean;
  variants?: Omit<ProductVariant, 'id' | 'product_id' | 'created_at' | 'updated_at'>[];
  options?: Omit<ProductOption, 'id' | 'product_id' | 'created_at' | 'updated_at'>[];
}

/**
 * Product search result with pagination
 */
export interface ProductSearchResult {
  products: (PricedProduct | ProductWithVariants)[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  filters?: {
    categories: Array<{ id: string; name: string; count: number }>;
    price_ranges: Array<{ min: number; max: number; count: number }>;
    currencies: CurrencyInfo[];
  };
}

/**
 * Product image
 */
export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text?: string;
  position: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Product collection
 */
export interface ProductCollection {
  id: string;
  title: string;
  description?: string;
  handle?: string;
  image_url?: string;
  products_count?: number;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Product showcase for display and editing
 */
export interface ProductShowcase {
  id?: string;
  title: string;
  description: string;
  category: string;
  price?: number;
  base_currency: string;
  prices?: {
    [currency: string]: number | undefined;
  };
  video_url?: string;
  thumbnail_url?: string;
  public_id?: string;
  user_id?: string;
  status: 'draft' | 'published' | 'archived';
  created_at?: string;
  updated_at?: string;
}
