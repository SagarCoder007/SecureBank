import { NextRequest, NextResponse } from 'next/server';
import { JWTUtils, AUTH_ERRORS } from './auth';
import { SessionService } from './db';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
}

/**
 * Middleware to authenticate requests using JWT or access token
 */
export async function authenticate(request: NextRequest): Promise<{
  user: AuthenticatedUser | null;
  error: string | null;
}> {
  try {
    // Try to get JWT from cookie first
    const jwtToken = request.cookies.get('auth-token')?.value || 
                    request.cookies.get('banker-auth-token')?.value;

    if (jwtToken) {
      try {
        const decoded = JWTUtils.verifyJWT(jwtToken);
        return {
          user: {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
          },
          error: null,
        };
      } catch (error) {
        // JWT invalid, try access token
      }
    }

    // Try access token from Authorization header
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    if (accessToken) {
      console.log('Middleware - checking access token:', {
        hasToken: !!accessToken,
        tokenLength: accessToken.length,
        tokenPreview: accessToken.substring(0, 10) + '...'
      });

      const session = await SessionService.findByToken(accessToken);
      
      console.log('Middleware - session lookup:', {
        hasSession: !!session,
        sessionId: session?.id,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        userRole: session?.user?.role,
        isExpired: session ? new Date() > session.expiresAt : null
      });

      if (!session) {
        console.log('Middleware - no session found for token');
        return {
          user: null,
          error: 'Invalid access token',
        };
      }

      // Check if token is expired
      if (new Date() > session.expiresAt) {
        console.log('Middleware - token expired, cleaning up');
        // Clean up expired token
        await SessionService.deleteSession(accessToken);
        return {
          user: null,
          error: 'Access token expired',
        };
      }

      // Check if user is active
      if (!session.user.isActive) {
        console.log('Middleware - user account deactivated');
        return {
          user: null,
          error: 'Account is deactivated',
        };
      }

      const authenticatedUser = {
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role,
      };

      console.log('Middleware - authentication successful:', authenticatedUser);

      return {
        user: authenticatedUser,
        error: null,
      };
    }

    return {
      user: null,
      error: 'No authentication token provided',
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return {
      user: null,
      error: 'Authentication failed',
    };
  }
}

/**
 * Middleware factory to protect routes with role-based access
 */
export function requireAuth(allowedRoles?: string[]) {
  return async function(request: NextRequest) {
    const { user, error } = await authenticate(request);

    if (error || !user) {
      return NextResponse.json(
        { error: error || AUTH_ERRORS.INVALID_TOKEN.message },
        { status: 401 }
      );
    }

    // Check role if specified
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: AUTH_ERRORS.ACCESS_DENIED.message },
        { status: AUTH_ERRORS.ACCESS_DENIED.statusCode }
      );
    }

    return user;
  };
}

/**
 * Helper to get current authenticated user from request
 */
export async function getCurrentUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  const { user } = await authenticate(request);
  return user;
}

/**
 * Check if user has specific role
 */
export function hasRole(user: AuthenticatedUser, role: string): boolean {
  return user.role === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: AuthenticatedUser, roles: string[]): boolean {
  return roles.includes(user.role);
}

/**
 * Response helpers for authentication errors
 */
export const AuthResponses = {
  unauthorized: () => NextResponse.json(
    { error: AUTH_ERRORS.INVALID_TOKEN.message },
    { status: AUTH_ERRORS.INVALID_TOKEN.statusCode }
  ),
  
  forbidden: () => NextResponse.json(
    { error: AUTH_ERRORS.ACCESS_DENIED.message },
    { status: AUTH_ERRORS.ACCESS_DENIED.statusCode }
  ),
  
  invalidCredentials: () => NextResponse.json(
    { error: AUTH_ERRORS.INVALID_CREDENTIALS.message },
    { status: AUTH_ERRORS.INVALID_CREDENTIALS.statusCode }
  ),
};
