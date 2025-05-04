
import { FastifyInstance } from 'fastify';
import { db } from './db';

export async function analyticsRoutes(app: FastifyInstance) {
  app.get('/api/analytics/revenue', async (req, reply) => {
    const { timeframe } = req.query as { timeframe: string };
    
    // Get transactions for the timeframe
    const transactions = await db
      .select()
      .from('transactions')
      .where('createdAt', '>=', getStartDate(timeframe));

    // Calculate revenue metrics
    const metrics = calculateRevenueMetrics(transactions);
    
    return metrics;
  });
}

function getStartDate(timeframe: string): string {
  const date = new Date();
  switch (timeframe) {
    case 'daily':
      date.setDate(date.getDate() - 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() - 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() - 1);
      break;
  }
  return date.toISOString();
}

function calculateRevenueMetrics(transactions: any[]) {
  // Calculate total revenue by type
  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const transactionFees = transactions
    .filter(t => t.type === 'transaction_fee')
    .reduce((sum, t) => sum + t.amount, 0);
  const escrowFees = transactions
    .filter(t => t.type === 'escrow_fee')
    .reduce((sum, t) => sum + t.amount, 0);
  const adRevenue = transactions
    .filter(t => t.type === 'ad_promotion')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalRevenue,
    transactionFees,
    escrowFees,
    adRevenue,
    trend: generateTrendData(transactions),
    distribution: generateDistributionData(transactions)
  };
}
