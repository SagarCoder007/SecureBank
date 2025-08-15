import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from '../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    if (accessToken) {
      try {
        // Delete the session from database
        await SessionService.deleteSession(accessToken);
      } catch (error) {
        // Session might not exist or already deleted, continue with logout
        console.log('Session not found during logout:', error);
      }
    }

    // Create response
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear auth cookies
    response.cookies.delete('auth-token');
    response.cookies.delete('banker-auth-token');

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
