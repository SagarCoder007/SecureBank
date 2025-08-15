'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { formatCurrency } from '../../lib/export-utils';

interface CustomerInsight {
  accountId: string;
  accountNumber: string;
  customerName: string;
  customerEmail: string;
  totalDeposits?: number;
  transactionCount: number;
  currentBalance: number;
}

interface CustomerInsightsWidgetProps {
  topDepositors: CustomerInsight[];
  mostActiveCustomers: CustomerInsight[];
  loading?: boolean;
}

export function CustomerInsightsWidget({ 
  topDepositors, 
  mostActiveCustomers, 
  loading 
}: CustomerInsightsWidgetProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer Insights</CardTitle>
          <CardDescription>Top customers and activity patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Loading skeleton */}
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      </div>
                    </div>
                  ))}
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
        <CardTitle className="text-lg sm:text-xl lg:text-2xl">Customer Insights</CardTitle>
        <CardDescription className="text-sm sm:text-base">Key customer metrics and activity patterns</CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Top Depositors */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Top Depositors
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                By total deposits
              </span>
            </div>
            
            {topDepositors.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">No deposit data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topDepositors.map((customer, index) => (
                  <div
                    key={customer.accountId}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {/* Rank Badge */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      index === 1 ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                      index === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {index + 1}
                    </div>

                    {/* Customer Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {customer.customerName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {customer.accountNumber}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {customer.transactionCount} deposits
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(customer.totalDeposits || 0)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Balance: {formatCurrency(customer.currentBalance)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Most Active Customers */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Most Active Customers
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                By transaction count
              </span>
            </div>

            {mostActiveCustomers.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">No transaction data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mostActiveCustomers.map((customer) => (
                  <div
                    key={customer.accountId}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {/* Activity Level Icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      customer.transactionCount >= 20 ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' :
                      customer.transactionCount >= 10 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400' :
                      'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>

                    {/* Customer Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {customer.customerName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {customer.accountNumber}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        Balance: {formatCurrency(customer.currentBalance)}
                      </p>
                    </div>

                    {/* Transaction Count */}
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {customer.transactionCount}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        transactions
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {topDepositors.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Top Depositors</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {mostActiveCustomers.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Active Customers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(topDepositors.reduce((sum, c) => sum + (c.totalDeposits || 0), 0))}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Deposits</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {mostActiveCustomers.reduce((sum, c) => sum + c.transactionCount, 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Transactions</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
