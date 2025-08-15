'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
// Modal import available for future use
import { exportAccountsToCSV, exportAccountsToPDF, exportTransactionsToCSV } from '../../lib/export-utils';

interface FilterOptions {
  search: string;
  status: 'all' | 'active' | 'inactive';
  accountType: 'all' | 'SAVINGS' | 'CHECKING' | 'BUSINESS';
  balanceRange: 'all' | 'low' | 'medium' | 'high';
}

interface Account {
  id: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  _count?: {
    transactions: number;
  };
  latestTransaction?: {
    type: string;
    amount: number;
    createdAt: string;
  };
}

interface BankerTransaction {
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

interface AccountsManagementWidgetProps {
  accounts: Account[];
  recentTransactions: BankerTransaction[];
  onFilterChange: (filters: FilterOptions) => void;
  filteredAccounts: Account[];
  onViewTransactionHistory: (accountId: string) => void;
  loading?: boolean;
}

export function AccountsManagementWidget({ 
  accounts, 
  recentTransactions,
  onFilterChange, 
  filteredAccounts,
  onViewTransactionHistory,
  loading 
}: AccountsManagementWidgetProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'all',
    accountType: 'all',
    balanceRange: 'all'
  });

  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      status: 'all' as const,
      accountType: 'all' as const,
      balanceRange: 'all' as const
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = filters.search || 
    filters.status !== 'all' || 
    filters.accountType !== 'all' || 
    filters.balanceRange !== 'all';

  const handleExport = (format: 'csv' | 'pdf', type: 'accounts' | 'transactions') => {
    if (type === 'accounts') {
      if (format === 'csv') {
        exportAccountsToCSV(filteredAccounts);
      } else {
        exportAccountsToPDF(filteredAccounts);
      }
    } else {
      if (format === 'csv') {
        exportTransactionsToCSV(recentTransactions);
      }
    }
    setShowExportMenu(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Date formatting utility available for future use

  if (loading) {
    return (
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl lg:text-2xl">Account Management & Customer Accounts</CardTitle>
          <CardDescription className="text-sm sm:text-base">Loading account data...</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
            <CardTitle className="text-lg sm:text-xl lg:text-2xl">Account Management & Customer Accounts</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Filter, search, and manage all customer bank accounts
              {filteredAccounts.length !== accounts.length && ` (${filteredAccounts.length} filtered)`}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {filteredAccounts.length} filtered
              </span>
            )}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-4-4m4 4l4-4m-6 2h.01M21 21H3a2 2 0 01-2-2V5a2 2 0 012-2h18a2 2 0 012 2v14a2 2 0 01-2 2z" />
                </svg>
                <span>Export</span>
              </Button>
              
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="py-2">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Accounts
                    </div>
                    <button
                      onClick={() => handleExport('csv', 'accounts')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Export as CSV</span>
                    </button>
                    <button
                      onClick={() => handleExport('pdf', 'accounts')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span>Export as PDF</span>
                    </button>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Transactions
                    </div>
                    <button
                      onClick={() => handleExport('csv', 'transactions')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Export Transactions CSV</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 sm:px-6">
        <div className="space-y-4 sm:space-y-6">
          {/* Search Bar */}
          <div>
            <Input
              label=""
              placeholder="Search by customer name, email, or account number..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account Status
              </label>
              <select
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* Account Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account Type
              </label>
              <select
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={filters.accountType}
                onChange={(e) => handleFilterChange('accountType', e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="SAVINGS">Savings</option>
                <option value="CHECKING">Checking</option>
                <option value="BUSINESS">Business</option>
              </select>
            </div>

            {/* Balance Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Balance Range
              </label>
              <select
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={filters.balanceRange}
                onChange={(e) => handleFilterChange('balanceRange', e.target.value)}
              >
                <option value="all">All Balances</option>
                <option value="low">Under $1,000</option>
                <option value="medium">$1,000 - $10,000</option>
                <option value="high">Over $10,000</option>
              </select>
            </div>
          </div>

          {/* Filter Summary and Clear Button */}
          {hasActiveFilters && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Showing {filteredAccounts.length} of {accounts.length} accounts
                </span>
                {filters.search && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Search: &quot;{filters.search}&quot;
                  </span>
                )}
                {filters.status !== 'all' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Status: {filters.status}
                  </span>
                )}
                {filters.accountType !== 'all' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Type: {filters.accountType}
                  </span>
                )}
                {filters.balanceRange !== 'all' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Balance: {filters.balanceRange}
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40"
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* Customer Accounts Section */}
          <div className="mt-6 sm:mt-8">
            {filteredAccounts.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No accounts found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  No customer accounts match your current filter criteria.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <div className="min-w-full inline-block align-middle">
                    <table className="w-full min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                          Customer
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                          Account Details
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                          Balance
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                          Transactions
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAccounts.map((account) => (
                        <tr key={account.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {account.user.firstName} {account.user.lastName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {account.user.email}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {account.accountNumber}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {account.accountType}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              {formatCurrency(account.balance)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              account.isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {account.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {account._count?.transactions || 0} transactions
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onViewTransactionHistory(account.id)}
                              className="text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                            >
                              View History
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>

                {/* Mobile & Tablet Card View */}
                <div className="lg:hidden space-y-3 sm:space-y-4">
                  {filteredAccounts.map((account) => (
                    <div key={account.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 sm:p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                              {account.user.firstName} {account.user.lastName}
                            </h4>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              account.isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {account.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            {account.user.email}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                              Account Number
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                              {account.accountNumber}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                              Account Type
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                              {account.accountType}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                              Current Balance
                            </p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                              {formatCurrency(account.balance)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                              Transactions
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                              {account._count?.transactions || 0} total
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewTransactionHistory(account.id)}
                            className="w-full text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                          >
                            View Transaction History
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
