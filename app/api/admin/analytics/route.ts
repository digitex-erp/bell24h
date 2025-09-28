import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Get current date and calculate date ranges
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Get time range from query params
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('range') || '7d';

    let startDate: Date;
    switch (timeRange) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = last7Days;
        break;
      case '30d':
        startDate = last30Days;
        break;
      case '90d':
        startDate = last90Days;
        break;
      default:
        startDate = last7Days;
    }

    // Fetch analytics data in parallel
    const [
      totalUsers,
      activeSuppliers,
      totalRevenue,
      recentLeads,
      recentRfqs,
      systemHealth,
      userGrowth,
      revenueGrowth
    ] = await Promise.all([
      // Total users count
      prisma.user.count(),
      
      // Active suppliers (users with supplier role)
      prisma.user.count({
        where: {
          role: 'SUPPLIER',
          isActive: true
        }
      }),
      
      // Total revenue from transactions
      prisma.transaction.aggregate({
        _sum: {
          amount: true
        },
        where: {
          status: 'COMPLETED'
        }
      }),
      
      // Recent leads
      prisma.lead.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // Recent RFQs
      prisma.rfq.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // System health (based on successful operations)
      prisma.transaction.count({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // User growth (previous period comparison)
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(startDate.getTime() - (now.getTime() - startDate.getTime())),
            lt: startDate
          }
        }
      }),
      
      // Revenue growth (previous period comparison)
      prisma.transaction.aggregate({
        _sum: {
          amount: true
        },
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(startDate.getTime() - (now.getTime() - startDate.getTime())),
            lt: startDate
          }
        }
      })
    ]);

    // Calculate growth percentages
    const userGrowthPercent = userGrowth > 0 ? ((totalUsers - userGrowth) / userGrowth) * 100 : 0;
    const revenueGrowthPercent = revenueGrowth._sum.amount && totalRevenue._sum.amount ? 
      ((Number(totalRevenue._sum.amount) - Number(revenueGrowth._sum.amount)) / Number(revenueGrowth._sum.amount)) * 100 : 0;

    // Calculate AI accuracy and fraud detection (mock data for now)
    const aiAccuracy = 94.2;
    const fraudDetection = 98.1;
    const uptime = 99.9;
    const performanceScore = 96.8;

    // Calculate system health percentage
    const totalTransactions = await prisma.transaction.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    });
    const systemHealthPercent = totalTransactions > 0 ? (systemHealth / totalTransactions) * 100 : 99.8;

    const analytics = {
      metrics: {
        totalUsers,
        activeSuppliers,
        totalRevenue: totalRevenue._sum.amount || 0,
        systemHealth: Math.round(systemHealthPercent * 10) / 10,
        aiAccuracy,
        fraudDetection,
        uptime,
        performanceScore,
        recentLeads,
        recentRfqs
      },
      growth: {
        userGrowth: Math.round(userGrowthPercent * 10) / 10,
        revenueGrowth: Math.round(revenueGrowthPercent * 10) / 10,
        leadGrowth: 12.5, // Mock data
        supplierGrowth: 8.2 // Mock data
      },
      timeRange,
      lastUpdated: now.toISOString()
    };

    return NextResponse.json(analytics);
    
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch analytics data' 
    }, { status: 500 });
  }
}
