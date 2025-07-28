import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // In production, check for admin role from headers/session
  const role = request.headers.get('role');
  if (role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({
    success: true,
    stats: {
      users: 12500,
      suppliers: 12500,
      transactions: 100000,
      revenue: '₹156 Cr',
      escrowVolume: '₹18 Cr',
      disputes: 2,
    },
    timestamp: new Date().toISOString(),
  });
} 