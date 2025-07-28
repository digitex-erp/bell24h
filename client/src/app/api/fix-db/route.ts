import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Set the correct DATABASE_URL
    const correctDbUrl = "postgresql://postgres:lTbKChgEtrkiElIkFNhXuXzxbyqECLPC@shortline.proxy.rlwy.net:45776/railway?sslmode=require";
    
    // Override the environment variable for this request
    process.env.DATABASE_URL = correctDbUrl;
    
    console.log('Fixed DATABASE_URL to external Railway URL');
    
    return NextResponse.json({
      success: true,
      message: 'Database URL fixed to external Railway URL',
      timestamp: new Date().toISOString(),
      dbUrlMasked: correctDbUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')
    });
  } catch (error) {
    console.error('Error fixing database URL:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fix database URL',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 