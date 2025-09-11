// app/api/health/route.ts - Production health check endpoint
import { NextResponse } from 'next/server';
import { msg91Service } from '../../../lib/msg91';
import { razorpayService } from '../../../lib/razorpay';
import { resendService } from '../../../lib/resend';
import { safeQuery } from '../../../lib/db';

export async function GET() {
  const startTime = Date.now();
  
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      services: {
        database: { status: 'unknown', message: 'Checking...' },
        msg91: { status: 'unknown', message: 'Checking...' },
        razorpay: { status: 'unknown', message: 'Checking...' },
        resend: { status: 'unknown', message: 'Checking...' }
      },
      responseTime: 0
    };

    // Check database
    try {
      await safeQuery('SELECT 1');
      health.services.database = {
        status: 'healthy',
        message: 'Database connection successful'
      };
    } catch (error) {
      health.services.database = {
        status: 'error',
        message: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }

    // Check MSG91
    try {
      const msg91Health = await msg91Service.healthCheck();
      health.services.msg91 = msg91Health;
    } catch (error) {
      health.services.msg91 = {
        status: 'error',
        message: `MSG91 error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }

    // Check Razorpay
    try {
      const razorpayHealth = await razorpayService.healthCheck();
      health.services.razorpay = razorpayHealth;
    } catch (error) {
      health.services.razorpay = {
        status: 'error',
        message: `Razorpay error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }

    // Check Resend
    try {
      const resendHealth = await resendService.healthCheck();
      health.services.resend = resendHealth;
    } catch (error) {
      health.services.resend = {
        status: 'error',
        message: `Resend error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }

    // Determine overall status
    const serviceStatuses = Object.values(health.services).map(s => s.status);
    if (serviceStatuses.includes('error')) {
      health.status = 'degraded';
    } else if (serviceStatuses.includes('warning')) {
      health.status = 'warning';
    }

    health.responseTime = Date.now() - startTime;

    return NextResponse.json(health, {
      status: health.status === 'healthy' ? 200 : 503
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime
    }, { status: 500 });
  }
}