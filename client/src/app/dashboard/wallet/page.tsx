'use client';
import { Suspense } from 'react';
import Wallet from '@/components/Wallet';

export default function WalletPage() {
  return (
    <div className='space-y-6'>
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h2 className='text-2xl font-bold text-gray-900 mb-4'>Wallet & Payments</h2>
        <p className='text-gray-600 mb-6'>
          Manage your wallet balance, transactions, and payment methods
        </p>
        <Suspense fallback={<div className='animate-pulse bg-gray-200 h-64 rounded-lg'></div>}>
          <Wallet />
        </Suspense>
      </div>
    </div>
  );
}
