import { NextRequest, NextResponse } from 'next/server';
import { subscriptionService } from '@/lib/subscription-service';
import { prisma } from '@/lib/prisma';

/**
 * Get system-wide subscription analytics
 * GET /api/subscriptions/system-analytics
 * 
 * Query params: range (7d, 30d, 90d, 1y)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get total users
    const totalUsers = await prisma.user.count();
    
    // Get active subscribers (users with premium role)
    const activeSubscribers = await prisma.user.count({
      where: { role: 'PREMIUM_USER' }
    });

    // Get subscription events for the time range
    const subscriptionEvents = await prisma.subscriptionEvent.findMany({
      where: {
        timestamp: {
          gte: startDate
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    // Calculate metrics
    const conversionRate = totalUsers > 0 ? (activeSubscribers / totalUsers) * 100 : 0;
    
    // Calculate churn rate (cancellations in period / active subscribers at start)
    const cancellationsInPeriod = subscriptionEvents.filter(e => e.action === 'cancelled').length;
    const churnRate = activeSubscribers > 0 ? (cancellationsInPeriod / activeSubscribers) * 100 : 0;

    // Calculate MRR (Monthly Recurring Revenue)
    // This is a simplified calculation - in production you'd want more sophisticated revenue tracking
    const mrr = activeSubscribers * 999; // Assuming average ₹999 per subscriber

    // Calculate ARPU (Average Revenue Per User)
    const arpu = totalUsers > 0 ? mrr / totalUsers : 0;

    // Generate subscription trends data
    const subscriptionTrends = generateTrendsData(subscriptionEvents, startDate, now);

    // Get plan distribution
    const planDistribution = await getPlanDistribution();

    const analytics = {
      totalUsers,
      activeSubscribers,
      monthlyRecurringRevenue: mrr,
      churnRate: Number(churnRate.toFixed(2)),
      conversionRate: Number(conversionRate.toFixed(2)),
      averageRevenuePerUser: Number(arpu.toFixed(2)),
      subscriptionTrends,
      planDistribution
    };

    return NextResponse.json({
      success: true,
      analytics,
      range,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('System analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to generate system analytics' },
      { status: 500 }
    );
  }
}

/**
 * Generate trends data for charts
 */
function generateTrendsData(events: any[], startDate: Date, endDate: Date): any[] {
  const trends = [];
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Generate data points for each day
  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const dateStr = date.toISOString().split('T')[0];
    
    // Count events for this day
    const dayEvents = events.filter(e => {
      const eventDate = new Date(e.timestamp).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
    
    trends.push({
      date: dateStr,
      active: Math.floor(Math.random() * 100) + 50, // Placeholder - implement proper active user tracking
      cancelled: dayEvents.filter(e => e.action === 'cancelled').length,
      new: dayEvents.filter(e => e.action === 'created').length
    });
  }
  
  return trends;
}

/**
 * Get subscription plan distribution
 */
async function getPlanDistribution(): Promise<any[]> {
  try {
    // Get subscription events grouped by plan
    const planStats = await prisma.subscriptionEvent.groupBy({
      by: ['planId'],
      where: { action: 'created' },
      _count: {
        planId: true
      }
    });

    const total = planStats.reduce((sum, stat) => sum + stat._count.planId, 0);

    return planStats.map(stat => ({
      plan: stat.planId || 'free',
      count: stat._count.planId,
      percentage: total > 0 ? Number(((stat._count.planId / total) * 100).toFixed(1)) : 0
    }));
  } catch (error) {
    console.error('Failed to get plan distribution:', error);
    return [];
  }
}