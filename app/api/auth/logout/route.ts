import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from '../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    console.log('Logout API called:', {
      hasAuthHeader: !!authHeader,
      hasAccessToken: !!accessToken,
      tokenLength: accessToken?.length || 0
    });

    if (accessToken) {
      try {
        // Delete the session from database
        await SessionService.deleteSession(accessToken);
        console.log('Session deleted successfully for token');
      } catch (error) {
        // Session might not exist or already deleted, continue with logout
        console.log('Session not found during logout (this is normal):', error);
      }
    } else {
      console.log('No access token provided for logout');
    }

    // Clean up any expired sessions while we're at it
    try {
      await SessionService.cleanupExpiredSessions();
      console.log('Expired sessions cleaned up');
    } catch (error) {
      console.log('Failed to cleanup expired sessions:', error);
    }

    // Create response
    const response = NextResponse.json(
      { 
        message: 'Logged out successfully',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );

    // Clear auth cookies (both customer and banker)
    response.cookies.delete('auth-token');
    response.cookies.delete('banker-auth-token');
    
    console.log('Logout completed successfully');

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Allow GET method for logout as well (for convenience)
  return POST(request);
}
