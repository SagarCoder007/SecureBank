import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../lib/middleware';
import { UserService, AccountService } from '../../lib/db';
import { prisma } from '../../lib/db';

// GET - Fetch user's transactions
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's accounts and their transactions
    const userWithAccounts = await UserService.findById(user.userId);
    if (!userWithAccounts) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all transactions for user's accounts
    const transactions = await prisma.transaction.findMany({
      where: {
        account: {
          userId: user.userId
        }
      },
      include: {
        account: {
          select: {
            accountNumber: true,
            accountType: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get account balances
    const accounts = await prisma.account.findMany({
      where: {
        userId: user.userId
      },
      select: {
        id: true,
        accountNumber: true,
        accountType: true,
        balance: true
      }
    });

    return NextResponse.json({
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount.toString(),
        balanceAfter: t.balanceAfter.toString(),
        description: t.description,
        status: t.status,
        createdAt: t.createdAt.toISOString(),
        account: t.account
      })),
      accounts: accounts.map(a => ({
        id: a.id,
        accountNumber: a.accountNumber,
        accountType: a.accountType,
        balance: a.balance.toString()
      }))
    });

  } catch (error) {
    console.error('Fetch transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}


