'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { formatCurrency } from '../../lib/export-utils';

interface MonthlyTransaction {
  type: string;
  _sum: {
    amount: string | null;
  };
  _count: {
    id: number;
  };
}

interface TransactionTrend {
  month: string;
  type: string;
  count: number;
  total_amount: string;
}

interface AnalyticsWidgetProps {
  monthlyTransactions: MonthlyTransaction[];
  transactionTrends: TransactionTrend[];
  loading?: boolean;
}

export function AnalyticsWidget({ 
  monthlyTransactions, 
  transactionTrends, 
  loading 
}: AnalyticsWidgetProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends'>('overview');

  // Process monthly data for visualization
  const processMonthlyData = () => {
    const deposits = monthlyTransactions
      .filter(tx => tx.type === 'DEPOSIT')
      .reduce((sum, tx) => sum + parseFloat(tx._sum.amount || '0'), 0);
    
    const withdrawals = monthlyTransactions
      .filter(tx => tx.type === 'WITHDRAWAL')
      .reduce((sum, tx) => sum + parseFloat(tx._sum.amount || '0'), 0);

    const depositCount = monthlyTransactions
      .filter(tx => tx.type === 'DEPOSIT')
      .reduce((sum, tx) => sum + tx._count.id, 0);

    const withdrawalCount = monthlyTransactions
      .filter(tx => tx.type === 'WITHDRAWAL')
      .reduce((sum, tx) => sum + tx._count.id, 0);

    return {
      deposits,
      withdrawals,
      depositCount,
      withdrawalCount,
      netFlow: deposits - withdrawals
    };
  };

  // Process trend data for the last 6 months
  const processTrendData = () => {
    const months = [...new Set(transactionTrends.map(t => t.month))].sort().slice(-6);
    
    return months.map(month => {
      const monthData = transactionTrends.filter(t => t.month === month);
      const deposits = monthData.filter(t => t.type === 'DEPOSIT');
      const withdrawals = monthData.filter(t => t.type === 'WITHDRAWAL');
      
      const depositAmount = deposits.reduce((sum, t) => sum + parseFloat(t.total_amount), 0);
      const withdrawalAmount = withdrawals.reduce((sum, t) => sum + parseFloat(t.total_amount), 0);
      
      return {
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        deposits: depositAmount,
        withdrawals: withdrawalAmount,
        depositCount: deposits.reduce((sum, t) => sum + t.count, 0),
        withdrawalCount: withdrawals.reduce((sum, t) => sum + t.count, 0)
      };
    });
  };

  const monthlyData = processMonthlyData();
  const trendData = processTrendData();
  const maxAmount = Math.max(...trendData.map(d => Math.max(d.deposits, d.withdrawals)));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Analytics Dashboard</CardTitle>
          <CardDescription>Transaction trends and patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Loading skeleton */}
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                </div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
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
            <CardTitle className="text-lg sm:text-xl lg:text-2xl">Analytics Dashboard</CardTitle>
            <CardDescription className="text-sm sm:text-base">Transaction trends and financial insights</CardDescription>
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'trends'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Trends
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        {activeTab === 'overview' ? (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">Total Deposits</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(monthlyData.deposits)}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      {monthlyData.depositCount} transactions
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">Total Withdrawals</p>
                    <p className="text-xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(monthlyData.withdrawals)}
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300">
                      {monthlyData.withdrawalCount} transactions
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Net Flow</p>
                    <p className={`text-xl font-bold ${
                      monthlyData.netFlow >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {monthlyData.netFlow >= 0 ? '+' : ''}{formatCurrency(monthlyData.netFlow)}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      {monthlyData.netFlow >= 0 ? 'Positive' : 'Negative'} flow
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Ratio */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Transaction Distribution</h4>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-600 dark:text-green-400">Deposits</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {((monthlyData.depositCount / (monthlyData.depositCount + monthlyData.withdrawalCount)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(monthlyData.depositCount / (monthlyData.depositCount + monthlyData.withdrawalCount)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-red-600 dark:text-red-400">Withdrawals</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {((monthlyData.withdrawalCount / (monthlyData.depositCount + monthlyData.withdrawalCount)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(monthlyData.withdrawalCount / (monthlyData.depositCount + monthlyData.withdrawalCount)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Trend Chart */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
                6-Month Transaction Trends
              </h4>
              <div className="relative h-64 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div className="flex items-end justify-between h-full space-x-2">
                  {trendData.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="flex items-end space-x-1 h-40 mb-2">
                        {/* Deposits Bar */}
                        <div 
                          className="bg-green-500 rounded-t w-4"
                          style={{ 
                            height: `${(data.deposits / maxAmount) * 100}%`,
                            minHeight: data.deposits > 0 ? '4px' : '0'
                          }}
                          title={`Deposits: ${formatCurrency(data.deposits)}`}
                        ></div>
                        {/* Withdrawals Bar */}
                        <div 
                          className="bg-red-500 rounded-t w-4"
                          style={{ 
                            height: `${(data.withdrawals / maxAmount) * 100}%`,
                            minHeight: data.withdrawals > 0 ? '4px' : '0'
                          }}
                          title={`Withdrawals: ${formatCurrency(data.withdrawals)}`}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
                        {data.month}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Legend */}
                <div className="flex justify-center space-x-4 mt-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Deposits</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Withdrawals</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendData.slice(-3).map((data, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">{data.month}</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-600 dark:text-green-400">Deposits</span>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(data.deposits)}</p>
                        <p className="text-xs text-gray-500">{data.depositCount} txns</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-red-600 dark:text-red-400">Withdrawals</span>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(data.withdrawals)}</p>
                        <p className="text-xs text-gray-500">{data.withdrawalCount} txns</p>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Net</span>
                        <p className={`text-sm font-bold ${
                          (data.deposits - data.withdrawals) >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {(data.deposits - data.withdrawals) >= 0 ? '+' : ''}
                          {formatCurrency(data.deposits - data.withdrawals)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
