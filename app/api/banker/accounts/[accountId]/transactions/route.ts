import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../../lib/middleware';
import { prisma } from '../../../../../lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { accountId: string } }
) {
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
        { error: 'Access denied. Banker privileges required.' },
        { status: 403 }
      );
    }

    const { accountId } = params;

    // Get account with user information
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            createdAt: true,
          }
        }
      }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Get all transactions for this account
    const transactions = await prisma.transaction.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' }
    });

    const formattedAccount = {
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
        joinedAt: account.user.createdAt.toISOString(),
      }
    };

    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount.toString(),
      balanceAfter: transaction.balanceAfter.toString(),
      description: transaction.description,
      status: transaction.status,
      createdAt: transaction.createdAt.toISOString(),
    }));

    return NextResponse.json({
      account: formattedAccount,
      transactions: formattedTransactions
    });

  } catch (error) {
    console.error('Account transactions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account transactions' },
      { status: 500 }
    );
  }
}


