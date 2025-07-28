export interface Tariff {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  maxUsers?: number;
  maxStorage?: number;
  maxRequests?: number;
  isPopular?: boolean;
  discountPercentage?: number;
}

export interface TariffFormData {
  selectedPlan: string;
  billingCycle: 'monthly' | 'yearly';
  quantity: number;
  currency: string;
  promoCode?: string;
}

export interface TariffPageProps {
  className?: string;
}
