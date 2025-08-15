import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../lib/middleware';
import { prisma } from '../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('Dashboard API: Starting request');
    
    const user = await getCurrentUser(request);
    console.log('Dashboard API: User authenticated:', { userId: user?.userId, role: user?.role });

    if (!user) {
      console.log('Dashboard API: No user found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only bankers and admins can access this endpoint
    if (user.role !== 'BANKER' && user.role !== 'ADMIN') {
      console.log('Dashboard API: Access denied for role:', user.role);
      return NextResponse.json(
        { error: 'Access denied. Banker privileges required.' },
        { status: 403 }
      );
    }

    console.log('Dashboard API: Fetching accounts...');
    
    // Get all accounts with user information
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
          take: 1,
        },
        _count: {
          select: { transactions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }).catch((error) => {
      console.error('Error fetching accounts:', error);
      return [];
    });

    console.log('Dashboard API: Accounts fetched:', accounts.length);

    // Get recent transactions (last 10)
    const recentTransactions = await prisma.transaction.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        account: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        }
      }
    }).catch((error) => {
      console.error('Error fetching recent transactions:', error);
      return [];
    });

    console.log('Dashboard API: Recent transactions fetched:', recentTransactions.length);

    // Calculate statistics
    const totalAccounts = accounts.length;
    const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0);
    const activeAccounts = accounts.filter(account => account.user.isActive).length;
    const totalTransactions = await prisma.transaction.count().catch((error) => {
      console.error('Error counting transactions:', error);
      return 0;
    });

    console.log('Dashboard API: Total transactions counted:', totalTransactions);

    // Get monthly transaction data for analytics (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTransactions = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    }).catch((error) => {
      console.error('Error fetching monthly transactions:', error);
      return [];
    });

    console.log('Dashboard API: Monthly transactions processed:', monthlyTransactions.length);

    // Get transaction trends by month (simplified approach)
    const sixMonthsAgoDate = new Date();
    sixMonthsAgoDate.setMonth(sixMonthsAgoDate.getMonth() - 6);

    const transactionTrends = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgoDate
        }
      },
      select: {
        type: true,
        amount: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    }).catch((error) => {
      console.error('Error fetching transaction trends:', error);
      return [];
    });

    console.log('Dashboard API: Transaction trends fetched:', transactionTrends.length);

    // Process the trends data in JavaScript instead of SQL
    const processedTrends = transactionTrends.reduce((acc: Array<{month: string, type: string, count: number, total_amount: string}>, transaction) => {
      const month = transaction.createdAt.toISOString().substring(0, 7); // YYYY-MM format
      const existing = acc.find(item => item.month === month && item.type === transaction.type);
      
      if (existing) {
        existing.count += 1;
        existing.total_amount = (parseFloat(existing.total_amount) + parseFloat(transaction.amount.toString())).toString();
      } else {
        acc.push({
          month,
          type: transaction.type,
          count: 1,
          total_amount: transaction.amount.toString()
        });
      }
      
      return acc;
    }, []);

    // Get customer insights
    const topDepositors = await prisma.account.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        transactions: {
          where: {
            type: 'DEPOSIT'
          },
          select: {
            amount: true
          }
        }
      }
    }).catch((error) => {
      console.error('Error fetching top depositors:', error);
      return [];
    });

    console.log('Dashboard API: Top depositors data fetched:', topDepositors.length);

    // Calculate top depositors
    const depositorsWithTotals = topDepositors.map(account => {
      const totalDeposits = account.transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
      return {
        accountId: account.id,
        accountNumber: account.accountNumber,
        customerName: `${account.user.firstName} ${account.user.lastName}`,
        customerEmail: account.user.email,
        totalDeposits,
        transactionCount: account.transactions.length,
        currentBalance: Number(account.balance)
      };
    }).sort((a, b) => b.totalDeposits - a.totalDeposits).slice(0, 5);

    // Get most active customers (by transaction count)
    const mostActiveCustomers = await prisma.account.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        _count: {
          select: {
            transactions: true
          }
        }
      },
      orderBy: {
        transactions: {
          _count: 'desc'
        }
      },
      take: 5
    }).catch((error) => {
      console.error('Error fetching most active customers:', error);
      return [];
    });

    console.log('Dashboard API: Most active customers fetched:', mostActiveCustomers.length);

    console.log('Dashboard API: Skipping alerts generation (removed from dashboard)');

    // Format response data
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

    const formattedRecentTransactions = recentTransactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount.toString(),
      balanceAfter: tx.balanceAfter.toString(),
      description: tx.description,
      status: tx.status,
      createdAt: tx.createdAt.toISOString(),
      account: {
        accountNumber: tx.account.accountNumber,
        accountType: tx.account.accountType,
      },
      customer: {
        name: `${tx.account.user.firstName} ${tx.account.user.lastName}`,
        email: tx.account.user.email,
      }
    }));

    const formattedMostActiveCustomers = mostActiveCustomers.map(account => ({
      accountId: account.id,
      accountNumber: account.accountNumber,
      customerName: `${account.user.firstName} ${account.user.lastName}`,
      customerEmail: account.user.email,
      transactionCount: account._count.transactions,
      currentBalance: Number(account.balance)
    }));

    console.log('Dashboard API: Preparing response data...');

    const responseData = {
      accounts: formattedAccounts || [],
      recentTransactions: formattedRecentTransactions || [],
      statistics: {
        totalAccounts: totalAccounts || 0,
        activeAccounts: activeAccounts || 0,
        totalBalance: (totalBalance || 0).toString(),
        totalTransactions: totalTransactions || 0,
      },
      analytics: {
        monthlyTransactions: monthlyTransactions || [],
        transactionTrends: processedTrends || []
      },
      customerInsights: {
        topDepositors: depositorsWithTotals || [],
        mostActiveCustomers: formattedMostActiveCustomers || []
      }
    };

    console.log('Dashboard API: Response prepared successfully');
    
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Banker dashboard fetch error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
