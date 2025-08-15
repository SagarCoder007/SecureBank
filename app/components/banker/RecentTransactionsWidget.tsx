'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { formatCurrency, formatDate } from '../../lib/export-utils';

interface Transaction {
  id: string;
  type: string;
  amount: string;
  balanceAfter: string;
  description: string;
  status: string;
  createdAt: string;
  account: {
    accountNumber: string;
    accountType: string;
  };
  customer: {
    name: string;
    email: string;
  };
}

interface RecentTransactionsWidgetProps {
  transactions: Transaction[];
  loading?: boolean;
}

export function RecentTransactionsWidget({ transactions, loading }: RecentTransactionsWidgetProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
          <CardDescription>Latest banking activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-lg sm:text-xl lg:text-2xl">Recent Transactions</CardTitle>
            <CardDescription className="text-sm sm:text-base">Latest banking activity across all accounts</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Last 10 transactions
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">No recent transactions</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-start space-x-3 sm:space-x-4 p-2 sm:p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                {/* Transaction Type Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.type === 'DEPOSIT'
                    ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                    : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                }`}>
                  {transaction.type === 'DEPOSIT' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                    </svg>
                  )}
                </div>

                {/* Transaction Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {transaction.customer.name}
                    </p>
                    <p className={`text-sm font-semibold ${
                      transaction.type === 'DEPOSIT'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{transaction.account.accountNumber} • {transaction.account.accountType}</span>
                    <span>{formatDate(transaction.createdAt)}</span>
                  </div>
                  
                  {transaction.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 truncate">
                      {transaction.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : transaction.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {transaction.status}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Balance: {formatCurrency(transaction.balanceAfter)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
