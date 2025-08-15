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
      const session = await SessionService.findByToken(accessToken);
      
      if (!session) {
        return {
          user: null,
          error: 'Invalid access token',
        };
      }

      // Check if token is expired
      if (new Date() > session.expiresAt) {
        // Clean up expired token
        await SessionService.deleteSession(accessToken);
        return {
          user: null,
          error: 'Access token expired',
        };
      }

      // Check if user is active
      if (!session.user.isActive) {
        return {
          user: null,
          error: 'Account is deactivated',
        };
      }

      return {
        user: {
          userId: session.user.id,
          email: session.user.email,
          role: session.user.role,
        },
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
