import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    tiers: [
      { name: 'Free', price: '₹0', features: ['5 RFQs/month', 'Basic AI', 'Wallet access'] },
      { name: 'Pro', price: '₹15k/year', features: ['Unlimited RFQs', 'SHAP', 'Priority support'] },
      { name: 'Enterprise', price: '₹50k/month', features: ['Custom AI', 'API', 'Escrow', 'Invoice discounting'] },
    ],
    competitor: {
      name: 'IndiaMART',
      priceRange: '₹18k-₹36k/year',
      freeTier: false,
    },
    timestamp: new Date().toISOString(),
  });
} 