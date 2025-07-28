import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { db } from '../../../../lib/db';
import { shipments, shipmentUpdates } from '../../../../lib/db/schema/logistics';
import { and, eq, gte, count, avg, sql } from 'drizzle-orm';
import { subDays } from 'date-fns';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'You must be logged in to access this resource' });
  }

  // Only allow GET method for analytics
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // Get timeframe from query parameters
    const { timeframe = '30days' } = req.query;
    let dateFilter: Date;
    
    // Calculate the date filter based on the timeframe
    switch(timeframe) {
      case '7days':
        dateFilter = subDays(new Date(), 7);
        break;
      case '90days':
        dateFilter = subDays(new Date(), 90);
        break;
      case 'all':
        dateFilter = new Date(0); // Beginning of time
        break;
      case '30days':
      default:
        dateFilter = subDays(new Date(), 30);
        break;
    }
    
    const dateFilterStr = dateFilter.toISOString();
    
    // Get total shipments
    const totalShipmentsResult = await db.select({
      count: count()
    }).from(shipments).where(gte(shipments.createdAt, dateFilterStr));
    const totalShipments = totalShipmentsResult[0]?.count || 0;
    
    // Get active shipments (those not in a final state)
    const activeShipmentsResult = await db.select({
      count: count()
    }).from(shipments).where(
      and(
        gte(shipments.createdAt, dateFilterStr),
        sql`${shipments.status} NOT IN ('DELIVERED', 'CANCELLED', 'RETURNED')`
      )
    );
    const activeShipments = activeShipmentsResult[0]?.count || 0;
    
    // Get completed shipments (those in a final state)
    const completedShipmentsResult = await db.select({
      count: count()
    }).from(shipments).where(
      and(
        gte(shipments.createdAt, dateFilterStr),
        sql`${shipments.status} IN ('DELIVERED', 'CANCELLED', 'RETURNED')`
      )
    );
    const completedShipments = completedShipmentsResult[0]?.count || 0;
    
    // Get international shipments
    const internationalShipmentsResult = await db.select({
      count: count()
    }).from(shipments).where(
      and(
        gte(shipments.createdAt, dateFilterStr),
        eq(shipments.isInternational, true)
      )
    );
    const internationalShipments = internationalShipmentsResult[0]?.count || 0;
    
    // Calculate average delivery time
    const avgDeliveryTimeResult = await db.select({
      avgDays: sql`AVG(DATEDIFF(day, ${shipments.createdAt}, ${shipments.updatedAt}))`
    }).from(shipments).where(
      and(
        gte(shipments.createdAt, dateFilterStr),
        eq(shipments.status, 'DELIVERED')
      )
    );
    const averageDeliveryTime = avgDeliveryTimeResult[0]?.avgDays || 0;
    
    // Calculate on-time delivery rate (simplified calculation)
    // We'll assume a shipment is on-time if it was delivered within 7 days (adjust as needed)
    const onTimeDeliveriesResult = await db.select({
      count: count()
    }).from(shipments).where(
      and(
        gte(shipments.createdAt, dateFilterStr),
        eq(shipments.status, 'DELIVERED'),
        sql`DATEDIFF(day, ${shipments.createdAt}, ${shipments.updatedAt}) <= 7`
      )
    );
    const onTimeDeliveries = onTimeDeliveriesResult[0]?.count || 0;
    const onTimeDeliveryRate = completedShipments > 0 
      ? (onTimeDeliveries / completedShipments) * 100 
      : 100;
    
    // Get shipments created this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const shipmentsThisMonthResult = await db.select({
      count: count()
    }).from(shipments).where(gte(shipments.createdAt, thisMonth.toISOString()));
    const shipmentsThisMonth = shipmentsThisMonthResult[0]?.count || 0;
    
    // Calculate shipments trend (comparing to previous period)
    const previousPeriodStart = new Date(thisMonth);
    previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);
    
    const previousPeriodShipmentsResult = await db.select({
      count: count()
    }).from(shipments).where(
      and(
        gte(shipments.createdAt, previousPeriodStart.toISOString()),
        sql`${shipments.createdAt} < ${thisMonth.toISOString()}`
      )
    );
    const previousPeriodShipments = previousPeriodShipmentsResult[0]?.count || 1; // Avoid division by zero
    
    const shipmentsTrend = ((shipmentsThisMonth - previousPeriodShipments) / previousPeriodShipments) * 100;
    
    // Get status breakdown
    const statusBreakdownResult = await db.select({
      status: shipments.status,
      count: count(),
    }).from(shipments)
      .where(gte(shipments.createdAt, dateFilterStr))
      .groupBy(shipments.status);
    
    // Get provider breakdown
    const providerBreakdownResult = await db.select({
      provider: shipments.provider,
      count: count(),
    }).from(shipments)
      .where(gte(shipments.createdAt, dateFilterStr))
      .groupBy(shipments.provider);
    
    // Get destination country breakdown
    const countryBreakdownResult = await db.select({
      country: shipments.deliveryCountry,
      count: count(),
    }).from(shipments)
      .where(gte(shipments.createdAt, dateFilterStr))
      .groupBy(shipments.deliveryCountry);
    
    // Get daily shipments data
    // This is simplified and would actually require more complex SQL for real implementation
    const dailyShipmentsQuery = `
      SELECT 
        DATE_FORMAT(createdAt, '%b %d') as date,
        COUNT(*) as created,
        SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END) as delivered
      FROM shipments
      WHERE createdAt >= ?
      GROUP BY DATE_FORMAT(createdAt, '%b %d')
      ORDER BY createdAt
    `;
    
    const dailyShipments = []; // Would normally come from executing the query above
    
    // Combine all data into the response format
    const dashboardData = {
      stats: {
        totalShipments,
        activeShipments,
        completedShipments,
        internationalShipments,
        averageDeliveryTime,
        onTimeDeliveryRate,
        shipmentsThisMonth,
        shipmentsTrend,
      },
      statusBreakdown: statusBreakdownResult,
      providerBreakdown: providerBreakdownResult,
      destinationCountries: countryBreakdownResult,
      dailyShipments,
    };
    
    return res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Error generating dashboard analytics:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to generate dashboard analytics' 
    });
  }
}
