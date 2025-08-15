import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../lib/middleware';
import { prisma } from '../../../lib/db';
import { Decimal } from '@prisma/client/runtime/library';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only customers can make deposits
    if (user.role !== 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Only customers can make deposits' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { amount, description, accountId } = body;

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid deposit amount' },
        { status: 400 }
      );
    }

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: user.userId
      }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found or access denied' },
        { status: 404 }
      );
    }

    // Convert amount to Decimal for precise calculation
    const depositAmount = new Decimal(amount);
    const currentBalance = account.balance;
    const newBalance = currentBalance.add(depositAmount);

    // Create transaction and update balance in a database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update account balance
      const updatedAccount = await tx.account.update({
        where: { id: accountId },
        data: { balance: newBalance }
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          accountId: accountId,
          type: 'DEPOSIT',
          amount: depositAmount,
          balanceAfter: newBalance,
          description: description || 'Deposit',
          status: 'COMPLETED'
        }
      });

      return { transaction, account: updatedAccount };
    });

    return NextResponse.json({
      success: true,
      message: 'Deposit successful',
      transaction: {
        id: result.transaction.id,
        type: result.transaction.type,
        amount: result.transaction.amount.toString(),
        balanceAfter: result.transaction.balanceAfter.toString(),
        description: result.transaction.description,
        createdAt: result.transaction.createdAt.toISOString()
      },
      newBalance: result.account.balance.toString()
    });

  } catch (error) {
    console.error('Deposit error:', error);
    return NextResponse.json(
      { error: 'Deposit failed. Please try again.' },
      { status: 500 }
    );
  }
}


