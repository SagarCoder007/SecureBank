import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../../lib/middleware';
import { prisma } from '../../../../../lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
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

    const { accountId } = await params;

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

    // Account details available for future use if needed

    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount.toString(),
      balanceAfter: transaction.balanceAfter.toString(),
      description: transaction.description,
      status: transaction.status,
      createdAt: transaction.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedTransactions);

  } catch (error) {
    console.error('Account transactions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account transactions' },
      { status: 500 }
    );
  }
}


