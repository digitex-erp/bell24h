/**
 * ✅ PRODUCTION-READY Dashboard Stats API
 * Fetches real-time statistics from InsForge database
 * Replaces hardcoded mock data with actual database queries
 */
import { NextRequest, NextResponse } from 'next/server';
import { insforge, db } from '@/lib/insforge';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await insforge.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 🔥 PARALLEL DATABASE QUERIES FOR PERFORMANCE
    const [
      rfqsResult,
      quotesResult,
      transactionsResult,
      suppliersResult,
      notificationsResult
    ] = await Promise.all([
      // Total RFQs by user
      db.rfqs()
        .select('id, status, created_at', { count: 'exact' })
        .eq('user_id', user.id),

      // Quotes received (for buyer) or submitted (for supplier)
      db.quotes()
        .select('id, status, rfq_id, created_at', { count: 'exact' })
        .in('rfq_id',
          db.rfqs().select('id').eq('user_id', user.id)
        ),

      // Transactions
      db.transactions()
        .select('id, amount, status, created_at', { count: 'exact' })
        .or(`buyer_id.eq.${user.id},supplier_id.eq.${user.id}`),

      // Total verified suppliers (system-wide)
      db.suppliers()
        .select('id', { count: 'exact' })
        .eq('verified', true)
        .eq('is_active', true),

      // Unread notifications
      db.notifications()
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('read', false)
    ]);

    // Process RFQs data
    const rfqs = rfqsResult.data || [];
    const totalRFQs = rfqsResult.count || 0;
    const activeRFQs = rfqs.filter((r: any) => r.status === 'open').length;
    const closedRFQs = rfqs.filter((r: any) => r.status === 'closed').length;
    const awardedRFQs = rfqs.filter((r: any) => r.status === 'awarded').length;

    // Process Quotes data
    const quotes = quotesResult.data || [];
    const totalQuotes = quotesResult.count || 0;
    const pendingQuotes = quotes.filter((q: any) => q.status === 'pending').length;
    const acceptedQuotes = quotes.filter((q: any) => q.status === 'accepted').length;

    // Process Transactions data
    const transactions = transactionsResult.data || [];
    const totalTransactions = transactionsResult.count || 0;
    const completedTransactions = transactions.filter((t: any) => t.status === 'completed').length;
    const totalSpent = transactions
      .filter((t: any) => t.buyer_id === user.id && t.status === 'completed')
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0);
    const totalEarned = transactions
      .filter((t: any) => t.supplier_id === user.id && t.status === 'completed')
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0);

    // Process Suppliers data
    const totalSuppliers = suppliersResult.count || 0;

    // Process Notifications
    const unreadNotifications = notificationsResult.count || 0;

    // 🔥 CALCULATE REAL-TIME METRICS
    const stats = {
      // RFQ Stats
      totalRFQs,
      activeRFQs,
      closedRFQs,
      awardedRFQs,
      draftRFQs: rfqs.filter((r: any) => r.status === 'draft').length,

      // Quote Stats
      totalQuotes,
      pendingQuotes,
      acceptedQuotes,
      rejectedQuotes: quotes.filter((q: any) => q.status === 'rejected').length,
      shortlistedQuotes: quotes.filter((q: any) => q.status === 'shortlisted').length,

      // Transaction Stats
      totalTransactions,
      completedTransactions,
      pendingTransactions: transactions.filter((t: any) => t.status === 'pending').length,
      totalSpent: Math.round(totalSpent * 100) / 100,
      totalEarned: Math.round(totalEarned * 100) / 100,

      // Supplier Stats
      totalSuppliers,

      // Notification Stats
      unreadNotifications,

      // Activity Stats (last 30 days)
      recentRFQs: rfqs.filter((r: any) => {
        const createdAt = new Date(r.created_at);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return createdAt > thirtyDaysAgo;
      }).length,

      recentQuotes: quotes.filter((q: any) => {
        const createdAt = new Date(q.created_at);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return createdAt > thirtyDaysAgo;
      }).length,

      // Engagement Metrics
      averageQuotesPerRFQ: totalRFQs > 0 ? Math.round((totalQuotes / totalRFQs) * 10) / 10 : 0,
      rfqSuccessRate: totalRFQs > 0 ? Math.round((awardedRFQs / totalRFQs) * 100) : 0,

      // User info
      userId: user.id,
      userEmail: user.email || null,

      // Timestamp
      generatedAt: new Date().toISOString()
    };

    console.log(`✅ Dashboard stats generated for user ${user.id}`);

    return NextResponse.json({
      success: true,
      stats,
      message: 'Dashboard statistics fetched successfully'
    });

  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard statistics',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/dashboard/stats/recent-activity
 * Fetches recent activity timeline
 */
export async function POST(request: NextRequest) {
  try {
    const { limit = 10, offset = 0 } = await request.json();

    const { data: { user }, error: authError } = await insforge.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch recent audit logs
    const { data: activities, error } = await db.audit_logs()
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Recent activity fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch recent activity' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      activities: activities || [],
      count: activities?.length || 0
    });

  } catch (error: any) {
    console.error('Recent activity error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recent activity' },
      { status: 500 }
    );
  }
}
