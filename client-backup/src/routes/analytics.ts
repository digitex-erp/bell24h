import express from 'express';
import { db } from '../server';
import { bids, contracts, rfqs } from '../db/schema';
import { and, count, eq, sql } from 'drizzle-orm';

const router = express.Router();

// Get overall platform statistics
router.get('/stats', async (req, res) => {
  try {
    const [totalRFQs] = await db.select({ count: count() }).from(rfqs);
    const [totalBids] = await db.select({ count: count() }).from(bids);
    const [totalContracts] = await db.select({ count: count() }).from(contracts);
    
    const [totalValue] = await db.select({
      value: sql<number>`sum(contract_value)`
    }).from(contracts);

    res.json({
      totalRFQs: totalRFQs.count,
      totalBids: totalBids.count,
      totalContracts: totalContracts.count,
      totalContractValue: totalValue.value || 0
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get monthly contract values
router.get('/monthly-contracts', async (req, res) => {
  try {
    const monthlyStats = await db.select({
      month: sql<string>`to_char(created_at, 'YYYY-MM')`,
      value: sql<number>`sum(contract_value)`,
      count: count()
    })
    .from(contracts)
    .groupBy(sql`to_char(created_at, 'YYYY-MM')`)
    .orderBy(sql`to_char(created_at, 'YYYY-MM')`);

    res.json(monthlyStats);
  } catch (error) {
    console.error('Error fetching monthly contracts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get RFQ success rate by category
router.get('/rfq-success-rate', async (req, res) => {
  try {
    const successRates = await db.select({
      category: rfqs.category,
      total: count(),
      success: count(contracts.id)
    })
    .from(rfqs)
    .leftJoin(contracts, eq(rfqs.id, contracts.rfqId))
    .groupBy(rfqs.category);

    const result = successRates.map(rate => ({
      category: rate.category,
      total: rate.total,
      success: rate.success,
      rate: (rate.success / rate.total) * 100
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching RFQ success rates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
