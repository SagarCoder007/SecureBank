import { NextRequest, NextResponse } from 'next/server';
import { DatabaseUtils } from '../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const isConnected = await DatabaseUtils.testConnection();
    
    if (isConnected) {
      return NextResponse.json({
        status: 'success',
        message: 'Database connection successful',
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Database test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
