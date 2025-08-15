'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { exportAccountsToCSV, exportAccountsToPDF, exportTransactionsToCSV } from '../../lib/export-utils';

interface FilterOptions {
  search: string;
  status: 'all' | 'active' | 'inactive';
  accountType: 'all' | 'SAVINGS' | 'CHECKING' | 'BUSINESS';
  balanceRange: 'all' | 'low' | 'medium' | 'high';
}

interface AccountFiltersWidgetProps {
  accounts: any[];
  recentTransactions: any[];
  onFilterChange: (filters: FilterOptions) => void;
  filteredAccounts: any[];
  loading?: boolean;
}

export function AccountFiltersWidget({ 
  accounts, 
  recentTransactions,
  onFilterChange, 
  filteredAccounts,
  loading 
}: AccountFiltersWidgetProps) {
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Account Management</CardTitle>
            <CardDescription>Filter, search, and export account data</CardDescription>
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
      <CardContent>
        <div className="space-y-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Showing {filteredAccounts.length} of {accounts.length} accounts
                </span>
                {filters.search && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Search: "{filters.search}"
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
        </div>
      </CardContent>
    </Card>
  );
}
