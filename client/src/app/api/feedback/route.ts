import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, rating, message, email, timestamp, userAgent, url } = body;

    // Validate required fields
    if (!type || !rating || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store feedback in database (if tables exist)
    try {
      // For now, we'll log the feedback and could store it in a simple table later
      console.log('📝 User Feedback Received:', {
        type,
        rating,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        email: email || 'anonymous',
        timestamp,
        url
      });

      // You could create a feedback table in the schema and store it here
      // await prisma.feedback.create({
      //   data: {
      //     type,
      //     rating,
      //     message,
      //     email,
      //     userAgent,
      //     url,
      //     createdAt: new Date(timestamp)
      //   }
      // });

    } catch (dbError) {
      console.error('Database error storing feedback:', dbError);
      // Continue even if database storage fails
    }

    // Send notification (you could integrate with Slack, email, etc.)
    const notificationData = {
      type: 'feedback',
      data: {
        type,
        rating,
        message: message.substring(0, 200),
        email: email || 'anonymous',
        url,
        timestamp
      }
    };

    console.log('🔔 Feedback Notification:', notificationData);

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return feedback statistics (if you have a feedback table)
    const stats = {
      totalFeedback: 0,
      averageRating: 0,
      recentFeedback: []
    };

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Feedback stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback stats' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 