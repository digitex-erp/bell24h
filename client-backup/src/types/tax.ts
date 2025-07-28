// Tax rate configuration for different regions
export interface TaxRate {
  // India
  gst?: number;        // Goods and Services Tax (India)
  sgst?: number;      // State GST (India)
  cgst?: number;      // Central GST (India)
  igst?: number;      // Integrated GST (India, for inter-state)
  tcs?: number;       // Tax Collected at Source (India)
  
  // International
  vat?: number;        // Value Added Tax (EU, UAE, etc.)
  salesTax?: number;   // Sales Tax (US, Canada)
  localTax?: number;  // Local/city tax
  
  // Other taxes
  customDuty?: number; // Customs duty for imports
  [key: string]: number | undefined; // Allow dynamic tax types
}

export interface TaxCalculationResult {
  subtotal: number;           // Amount before tax
  taxDetails: Record<string, number>; // Breakdown of different tax components
  totalTax: number;           // Sum of all taxes
  totalAmount: number;        // Subtotal + totalTax
  currency: string;           // Currency code (e.g., 'INR', 'USD')
  isTaxInclusive: boolean;    // Whether tax is included in the price
}

export interface TaxRegion {
  code: string;  // Region code (e.g., 'IN-MH', 'US-CA')
  name: string;  // Display name (e.g., 'India - Maharashtra')
}

export interface TaxExemption {
  id: string;
  type: 'gst' | 'vat' | 'sales_tax' | 'customs';
  certificateNumber?: string;
  expiryDate?: Date;
  description?: string;
}

export interface TaxSettings {
  taxId?: string;
  isTaxExempt: boolean;
  taxExemptions?: TaxExemption[];
  businessName?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}
