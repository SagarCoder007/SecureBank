'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../../components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { performCompleteLogout } from '../../lib/logout-utils';
import { RecentTransactionsWidget } from '../../components/banker/RecentTransactionsWidget';
import { CustomerInsightsWidget } from '../../components/banker/CustomerInsightsWidget';
import { AnalyticsWidget } from '../../components/banker/AnalyticsWidget';
import { AccountsManagementWidget } from '../../components/banker/AccountsManagementWidget';
import { filterAccounts } from '../../lib/export-utils';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
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
    role: string;
    isActive: boolean;
    joinedAt: string;
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

interface Statistics {
  totalAccounts: number;
  activeAccounts: number;
  totalBalance: string;
  totalTransactions: number;
}

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

interface Analytics {
  monthlyTransactions: MonthlyTransaction[];
  transactionTrends: TransactionTrend[];
}

interface CustomerInsight {
  accountId: string;
  accountNumber: string;
  customerName: string;
  customerEmail: string;
  totalDeposits?: number;
  transactionCount: number;
  currentBalance: number;
}

interface CustomerInsights {
  topDepositors: CustomerInsight[];
  mostActiveCustomers: CustomerInsight[];
}

interface DashboardData {
  accounts: Account[];
  recentTransactions: Transaction[];
  statistics: Statistics;
  analytics: Analytics;
  customerInsights: CustomerInsights;
}

interface FilterOptions {
  search: string;
  status: 'all' | 'active' | 'inactive';
  accountType: 'all' | 'SAVINGS' | 'CHECKING' | 'BUSINESS';
  balanceRange: 'all' | 'low' | 'medium' | 'high';
}

export default function BankerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transaction history modal state
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [accountTransactions, setAccountTransactions] = useState<Transaction[]>([]);
  const [transactionLoading, setTransactionLoading] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'all',
    accountType: 'all',
    balanceRange: 'all'
  });
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/banker/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'BANKER' && parsedUser.role !== 'ADMIN') {
        router.push('/banker/login');
        return;
      }
      setUser(parsedUser);
    } catch (err) {
      console.error('Error parsing user data:', err);
      router.push('/banker/login');
      return;
    }

    fetchDashboardData();
  }, [router]);

  useEffect(() => {
    if (dashboardData?.accounts) {
      const filtered = filterAccounts(dashboardData.accounts, filters);
      setFilteredAccounts(filtered);
    }
  }, [dashboardData, filters]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/banker/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to fetch dashboard data: ${errorData.error || response.statusText} ${errorData.details ? `- ${errorData.details}` : ''}`);
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleViewTransactionHistory = async (accountId: string) => {
    try {
      setTransactionLoading(true);
      const account = dashboardData?.accounts.find(acc => acc.id === accountId);
      if (!account) return;

      setSelectedAccount(account);
      setTransactionModalOpen(true);

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/banker/accounts/${accountId}/transactions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const transactions = await response.json();
        setAccountTransactions(Array.isArray(transactions) ? transactions : []);
      }
    } catch (err) {
      console.error('Error fetching transaction history:', err);
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleLogout = async () => {
    await performCompleteLogout();
    router.push('/');
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={user} onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Banking Portal Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Welcome back, {user.firstName}! Here's an overview of your banking operations.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error loading dashboard data
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {error}
                  </p>
                </div>
                <div className="ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchDashboardData}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Dashboard Grid */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Top Row: Statistics Cards */}
          {dashboardData?.statistics && (
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">Total Accounts</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-bold">
                    {dashboardData.statistics.totalAccounts}
                  </div>
                  <p className="text-blue-100 text-sm mt-1">
                    {dashboardData.statistics.activeAccounts} active
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">Total Balance</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-bold">
                    {formatCurrency(dashboardData.statistics.totalBalance)}
                  </div>
                  <p className="text-green-100 text-sm mt-1">
                    Across all accounts
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">Active Accounts</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-bold">
                    {dashboardData.statistics.activeAccounts}
                  </div>
                  <p className="text-purple-100 text-sm mt-1">
                    Currently active
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">Total Transactions</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-bold">
                    {dashboardData.statistics.totalTransactions}
                  </div>
                  <p className="text-orange-100 text-sm mt-1">
                    All time
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Second Row: Analytics Dashboard */}
          <div className="w-full">
            <AnalyticsWidget 
              monthlyTransactions={dashboardData?.analytics.monthlyTransactions || []}
              transactionTrends={dashboardData?.analytics.transactionTrends || []}
              loading={loading}
            />
          </div>

          {/* Third Row: Customer Insights */}
          <div className="w-full">
            <CustomerInsightsWidget 
              topDepositors={dashboardData?.customerInsights.topDepositors || []}
              mostActiveCustomers={dashboardData?.customerInsights.mostActiveCustomers || []}
              loading={loading}
            />
          </div>

          {/* Fourth Row: Integrated Account Management & Customer Accounts */}
          <div className="w-full">
            <AccountsManagementWidget
              accounts={dashboardData?.accounts || []}
              recentTransactions={dashboardData?.recentTransactions || [] as any}
              onFilterChange={handleFilterChange}
              filteredAccounts={filteredAccounts}
              onViewTransactionHistory={handleViewTransactionHistory}
              loading={loading}
            />
          </div>
        </div>

        {/* Recent Transactions Section */}
        <div className="mt-4 sm:mt-6 lg:mt-8">
          <RecentTransactionsWidget 
            transactions={dashboardData?.recentTransactions || []} 
            loading={loading} 
          />
        </div>
      </div>

      {/* Transaction History Modal */}
      {selectedAccount && (
        <Modal
          isOpen={transactionModalOpen}
          onClose={() => {
            setTransactionModalOpen(false);
            setSelectedAccount(null);
            setAccountTransactions([]);
          }}
          title={`Transaction History - ${selectedAccount.user.firstName} ${selectedAccount.user.lastName}`}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Account: {selectedAccount.accountNumber}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current Balance: {formatCurrency(selectedAccount.balance)}
                </p>
              </div>
            </div>

            {transactionLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : accountTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No transactions found for this account.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {accountTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === 'DEPOSIT'
                          ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                          : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                      }`}>
                        {transaction.type === 'DEPOSIT' ? '+' : '-'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Balance: {formatCurrency(transaction.balanceAfter)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}