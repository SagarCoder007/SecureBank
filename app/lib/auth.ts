import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
// ACCESS_TOKEN_SECRET available for future use if needed

/**
 * Password hashing utilities using bcrypt
 */
export class PasswordUtils {
  /**
   * Hash a plain text password
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Verify a password against its hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

/**
 * JWT token utilities
 */
export class JWTUtils {
  /**
   * Generate a JWT token for user session
   */
  static generateJWT(payload: { userId: string; email: string; role: string }): string {
    return jwt.sign(
      payload,
      JWT_SECRET,
      {
        expiresIn: '7d', // Token expires in 7 days
        issuer: 'banking-portal',
        audience: 'banking-users'
      }
    );
  }

  /**
   * Verify and decode JWT token
   */
  static verifyJWT(token: string): {userId: string; email: string; role: string} {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded as {userId: string; email: string; role: string};
    } catch {
      throw new Error('Invalid or expired token');
    }
  }
}

/**
 * Access token utilities using crypto for 36-character alphanumeric tokens
 */
export class AccessTokenUtils {
  /**
   * Generate a 36-character alphanumeric access token
   */
  static generateAccessToken(): string {
    // Generate random bytes and convert to alphanumeric string
    const bytes = crypto.randomBytes(27); // 27 bytes * 4/3 ≈ 36 chars in base64
    const token = bytes.toString('base64')
      .replace(/[+/=]/g, '') // Remove non-alphanumeric characters
      .substring(0, 36); // Ensure exactly 36 characters
    
    // If somehow less than 36 chars, pad with random alphanumeric
    if (token.length < 36) {
      const additional = crypto.randomBytes(18).toString('hex').substring(0, 36 - token.length);
      return (token + additional).substring(0, 36);
    }
    
    return token;
  }

  /**
   * Generate token expiration date (24 hours from now)
   */
  static generateTokenExpiration(): Date {
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 24);
    return expiration;
  }
}

/**
 * Authentication validation utilities
 */
export class AuthValidation {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static isValidPassword(password: string): boolean {
    // At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Validate username format
   */
  static isValidUsername(username: string): boolean {
    // 3-20 characters, alphanumeric and underscores only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  }
}

/**
 * Error types for authentication
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: new AuthError('Invalid email or password', 'INVALID_CREDENTIALS', 401),
  USER_NOT_FOUND: new AuthError('User not found', 'USER_NOT_FOUND', 404),
  EMAIL_ALREADY_EXISTS: new AuthError('Email already registered', 'EMAIL_EXISTS', 409),
  USERNAME_ALREADY_EXISTS: new AuthError('Username already taken', 'USERNAME_EXISTS', 409),
  INVALID_TOKEN: new AuthError('Invalid or expired token', 'INVALID_TOKEN', 401),
  ACCESS_DENIED: new AuthError('Access denied', 'ACCESS_DENIED', 403),
  WEAK_PASSWORD: new AuthError('Password does not meet requirements', 'WEAK_PASSWORD', 400),
  INVALID_EMAIL: new AuthError('Invalid email format', 'INVALID_EMAIL', 400),
} as const;
