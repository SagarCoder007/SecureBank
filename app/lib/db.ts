import { PrismaClient } from '@prisma/client';

declare global {
  // Allow global variable in development to prevent hot reload issues
  var prisma: PrismaClient | undefined;
}

/**
 * Prisma client singleton
 * Uses global variable in development to prevent multiple instances
 */
export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

/**
 * Database connection utilities
 */
export class DatabaseUtils {
  /**
   * Test database connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }

  /**
   * Gracefully disconnect from database
   */
  static async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }

  /**
   * Reset database (development only)
   */
  static async resetDatabase(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Database reset not allowed in production');
    }
    
    await prisma.transaction.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
  }
}

/**
 * User database operations
 */
export class UserService {
  /**
   * Create a new user
   */
  static async createUser(data: {
    email: string;
    username?: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'CUSTOMER' | 'BANKER' | 'ADMIN';
  }) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    });
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
      }
    });
  }

  /**
   * Find user by username
   */
  static async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
      include: {
        accounts: true,
      }
    });
  }

  /**
   * Find user by ID
   */
  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        accounts: {
          include: {
            transactions: {
              orderBy: { createdAt: 'desc' },
              take: 10, // Latest 10 transactions
            }
          }
        }
      }
    });
  }

  /**
   * Update user
   */
  static async updateUser(id: string, data: Partial<{
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
  }>) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      }
    });
  }
}

/**
 * Session database operations
 */
export class SessionService {
  /**
   * Create a new session
   */
  static async createSession(userId: string, token: string, expiresAt: Date) {
    return prisma.session.create({
      data: {
        userId,
        token,
        expiresAt,
      }
    });
  }

  /**
   * Find session by token
   */
  static async findByToken(token: string) {
    return prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
          }
        }
      }
    });
  }

  /**
   * Delete session (logout)
   */
  static async deleteSession(token: string) {
    return prisma.session.delete({
      where: { token }
    });
  }

  /**
   * Delete all expired sessions
   */
  static async cleanupExpiredSessions() {
    return prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
  }

  /**
   * Delete all sessions for a user (logout from all devices)
   */
  static async deleteAllUserSessions(userId: string) {
    return prisma.session.deleteMany({
      where: { userId }
    });
  }
}

/**
 * Account database operations
 */
export class AccountService {
  /**
   * Create a new account for a user
   */
  static async createAccount(userId: string, accountType: 'SAVINGS' | 'CHECKING' | 'BUSINESS' = 'SAVINGS') {
    // Generate unique account number
    const accountNumber = await AccountService.generateAccountNumber();
    
    return prisma.account.create({
      data: {
        userId,
        accountNumber,
        accountType,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });
  }

  /**
   * Generate unique account number
   */
  static async generateAccountNumber(): Promise<string> {
    let isUnique = false;
    let accountNumber = '';
    
    while (!isUnique) {
      // Generate 10-digit account number
      accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      
      const existing = await prisma.account.findUnique({
        where: { accountNumber }
      });
      
      isUnique = !existing;
    }
    
    return accountNumber;
  }

  /**
   * Get all accounts (for banker)
   */
  static async getAllAccounts() {
    return prisma.account.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Latest transaction for last activity
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export default prisma;
