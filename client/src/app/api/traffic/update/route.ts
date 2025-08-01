import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId, page, impression, click, conversion } = body;

    // Validate required fields
    if (!userId || !page) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and page' },
        { status: 400 }
      );
    }

    // Find existing analytics record for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let analytics = await prisma.trafficAnalytics.findFirst({
      where: {
        userId,
        productId: productId || null,
        page,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (analytics) {
      // Update existing record
      analytics = await prisma.trafficAnalytics.update({
        where: { id: analytics.id },
        data: {
          impressions: impression ? analytics.impressions + 1 : analytics.impressions,
          clicks: click ? analytics.clicks + 1 : analytics.clicks,
          conversions: conversion ? analytics.conversions + 1 : analytics.conversions,
        },
      });
    } else {
      // Create new record
      analytics = await prisma.trafficAnalytics.create({
        data: {
          userId,
          productId: productId || null,
          page,
          impressions: impression ? 1 : 0,
          clicks: click ? 1 : 0,
          conversions: conversion ? 1 : 0,
        },
      });
    }

    // Update product impressions if productId is provided
    if (productId && impression) {
      await prisma.product.update({
        where: { id: productId },
        data: {
          impressions: {
            increment: 1,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      analytics: {
        id: analytics.id,
        impressions: analytics.impressions,
        clicks: analytics.clicks,
        conversions: analytics.conversions,
        conversionRate: analytics.impressions > 0 
          ? (analytics.conversions / analytics.impressions) * 100 
          : 0,
      },
    });
  } catch (error) {
    console.error('Error updating traffic analytics:', error);
    return NextResponse.json(
      { error: 'Failed to update traffic analytics' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');
    const days = parseInt(searchParams.get('days') || '7');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await prisma.trafficAnalytics.findMany({
      where: {
        userId,
        productId: productId || null,
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Aggregate data
    const totalImpressions = analytics.reduce((sum, a) => sum + a.impressions, 0);
    const totalClicks = analytics.reduce((sum, a) => sum + a.clicks, 0);
    const totalConversions = analytics.reduce((sum, a) => sum + a.conversions, 0);

    return NextResponse.json({
      success: true,
      data: {
        analytics,
        summary: {
          totalImpressions,
          totalClicks,
          totalConversions,
          conversionRate: totalImpressions > 0 
            ? (totalConversions / totalImpressions) * 100 
            : 0,
          clickThroughRate: totalImpressions > 0 
            ? (totalClicks / totalImpressions) * 100 
            : 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching traffic analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch traffic analytics' },
      { status: 500 }
    );
  }
}