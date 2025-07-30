import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get launch start time (48 hours ago)
    const launchStartTime = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // Fetch metrics from database
    const [totalRegistrations, rfqsCreated, aiMatches, activeUsers, testimonials] =
      await Promise.all([
        // Total registrations in last 48 hours
        prisma.user.count({
          where: {
            createdAt: {
              gte: launchStartTime,
            },
          },
        }),

        // RFQs created in last 48 hours
        prisma.rFQ.count({
          where: {
            createdAt: {
              gte: launchStartTime,
            },
          },
        }),

        // AI matches (RFQ responses) in last 48 hours
        prisma.rFQResponse.count({
          where: {
            createdAt: {
              gte: launchStartTime,
            },
            status: 'MATCHED',
          },
        }),

        // Active users (users with activity in last 24 hours)
        prisma.user.count({
          where: {
            OR: [
              {
                rfqs: {
                  some: {
                    createdAt: {
                      gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    },
                  },
                },
              },
              {
                rfqResponses: {
                  some: {
                    createdAt: {
                      gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    },
                  },
                },
              },
              {
                products: {
                  some: {
                    createdAt: {
                      gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    },
                  },
                },
              },
            ],
          },
        }),

        // Testimonials (placeholder - would need a testimonials table)
        0,
      ]);

    // Calculate conversion rate
    const conversionRate =
      totalRegistrations > 0 ? Math.round((rfqsCreated / totalRegistrations) * 100) : 0;

    const metrics = {
      totalRegistrations,
      rfqsCreated,
      aiMatches,
      testimonials,
      activeUsers,
      conversionRate,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching launch metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch launch metrics' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, userId, data } = body;

    // Track launch events
    await prisma.trafficAnalytics.create({
      data: {
        event: event,
        userId: userId || null,
        metadata: data || {},
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking launch event:', error);
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
  }
}
