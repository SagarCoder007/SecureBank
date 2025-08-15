import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../lib/middleware';
import { prisma } from '../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only bankers and admins can access this endpoint
    if (user.role !== 'BANKER' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: `Access denied. Role '${user.role}' not authorized. Banker privileges required.` },
        { status: 403 }
      );
    }

    // Get all accounts with user information and latest transaction
    const accounts = await prisma.account.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            createdAt: true,
            isActive: true,
          }
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Latest transaction
        },
        _count: {
          select: { transactions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate some banking statistics
    const totalAccounts = accounts.length;
    const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0);
    const activeAccounts = accounts.filter(account => account.user.isActive).length;
    
    // Get total transactions count
    const totalTransactions = await prisma.transaction.count();

    const formattedAccounts = accounts.map(account => ({
      id: account.id,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      balance: account.balance.toString(),
      isActive: account.isActive,
      createdAt: account.createdAt.toISOString(),
      user: {
        firstName: account.user.firstName,
        lastName: account.user.lastName,
        email: account.user.email,
        role: account.user.role,
        isActive: account.user.isActive,
        joinedAt: account.user.createdAt.toISOString(),
      },
      transactionCount: account._count.transactions,
      lastTransaction: account.transactions[0] ? {
        type: account.transactions[0].type,
        amount: account.transactions[0].amount.toString(),
        createdAt: account.transactions[0].createdAt.toISOString(),
      } : null,
    }));

    return NextResponse.json({
      accounts: formattedAccounts,
      statistics: {
        totalAccounts,
        activeAccounts,
        totalBalance: totalBalance.toString(),
        totalTransactions,
      }
    });

  } catch (error) {
    console.error('Banker accounts fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}


