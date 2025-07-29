import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET() {
  try {
    // Basic health check with database connectivity test
    const supabase = createClient();
    
    // Test database connection
    const { error: dbError } = await supabase
      .from('messages')
      .select('count')
      .limit(1);
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      database: dbError ? 'unhealthy' : 'healthy'
    };

    // If database is unhealthy, return 503
    if (dbError) {
      return NextResponse.json(
        { 
          ...healthData,
          status: 'degraded',
          error: 'Database connectivity issue'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(healthData, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        uptime: process.uptime()
      },
      { status: 503 }
    );
  }
}