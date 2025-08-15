'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../../components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { performCompleteLogout } from '../../lib/logout-utils';

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
  balance: string;
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
  transactionCount: number;
  lastTransaction: {
    type: string;
    amount: string;
    createdAt: string;
  } | null;
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
}

export default function BankerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accountTransactions, setAccountTransactions] = useState<Transaction[]>([]);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    
    console.log('Banker Dashboard - Auth Check:', {
      hasStoredUser: !!storedUser,
      hasAccessToken: !!accessToken,
      userEmail: storedUser ? JSON.parse(storedUser).email : 'None',
      userRole: storedUser ? JSON.parse(storedUser).role : 'None'
    });

    if (!storedUser || !accessToken) {
      console.log('Missing user or token, redirecting to banker login');
      router.push('/banker/login');
      return;
    }

    const userData = JSON.parse(storedUser);
    
    // Strict role validation
    if (userData.role !== 'BANKER' && userData.role !== 'ADMIN') {
      console.log('Invalid role for banker dashboard:', userData.role);
      // Clear invalid tokens
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      router.push('/banker/login');
      return;
    }

    console.log('Banker dashboard access granted for:', userData.email, 'Role:', userData.role);
    setUser(userData);
    fetchAccounts();
  }, [router]);

  const fetchAccounts = async () => {
    try {
      setError(null); // Clear any previous errors
      const accessToken = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');
      
      console.log('Fetch accounts debug:', {
        hasAccessToken: !!accessToken,
        accessTokenLength: accessToken?.length,
        hasUser: !!user,
        userRole: user ? JSON.parse(user).role : null
      });

      if (!accessToken) {
        const errorMessage = 'No access token found. Please log in again.';
        console.error(errorMessage);
        setError(errorMessage);
        router.push('/banker/login');
        return;
      }

      const response = await fetch('/api/banker/accounts', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      console.log('API Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Successfully fetched accounts:', data.accounts?.length, 'accounts');
        setAccounts(data.accounts);
        setStatistics(data.statistics);
        setError(null); // Clear error on success
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = `Failed to fetch accounts (${response.status}): ${errorData.error || response.statusText}`;
        console.error('Failed to fetch accounts:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          headers: Object.fromEntries(response.headers.entries())
        });
        setError(errorMessage);
        
        // If unauthorized, redirect to login
        if (response.status === 401) {
          console.log('Unauthorized - redirecting to login');
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          router.push('/banker/login');
        }
      }
    } catch (error) {
      const errorMessage = `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error('Error fetching accounts (network/other):', error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountTransactions = async (accountId: string) => {
    setLoadingTransactions(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        console.error('No access token found');
        router.push('/banker/login');
        return;
      }

      const response = await fetch(`/api/banker/accounts/${accountId}/transactions`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAccountTransactions(data.transactions);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to fetch account transactions:', response.status, errorData);
        
        if (response.status === 401) {
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          router.push('/banker/login');
        }
      }
    } catch (error) {
      console.error('Error fetching account transactions:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleLogout = async () => {
    console.log('Banker logout initiated');
    
    // Use the centralized logout utility
    await performCompleteLogout();
    
    // Redirect to home page
    router.push('/');
  };

  const openTransactionModal = async (account: Account) => {
    setSelectedAccount(account);
    setTransactionModalOpen(true);
    await fetchAccountTransactions(account.id);
  };

  const formatCurrency = (amount: string) => {
    return parseFloat(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header user={user} onLogout={handleLogout} />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={user} onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Banking Portal Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome, {user?.firstName}! Manage customer accounts and monitor banking activity.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-300">
                  Failed to Load Data
                </h4>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  {error}
                </p>
                <button 
                  onClick={fetchAccounts}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader>
                <CardTitle className="text-white">Total Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{statistics.totalAccounts}</div>
                <p className="text-blue-100 text-sm">Active: {statistics.activeAccounts}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardHeader>
                <CardTitle className="text-white">Total Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(statistics.totalBalance)}</div>
                <p className="text-green-100 text-sm">Across all accounts</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="text-white">Total Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{statistics.totalTransactions}</div>
                <p className="text-purple-100 text-sm">All time</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardHeader>
                <CardTitle className="text-white">Average Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency((parseFloat(statistics.totalBalance) / statistics.totalAccounts).toString())}
                </div>
                <p className="text-orange-100 text-sm">Per account</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Accounts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Accounts</CardTitle>
            <CardDescription>
              View and manage all customer bank accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No accounts found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  No customer accounts are available at this time.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                        Customer
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                        Account
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                        Balance
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                        Last Activity
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((account) => (
                      <tr key={account.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
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
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(account.balance)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {account.transactionCount} transactions
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {account.lastTransaction ? (
                            <div>
                              <div className={`text-sm font-medium ${
                                account.lastTransaction.type === 'DEPOSIT' 
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {account.lastTransaction.type} {formatCurrency(account.lastTransaction.amount)}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(account.lastTransaction.createdAt)}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              No transactions
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            account.user.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {account.user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openTransactionModal(account)}
                          >
                            View History
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction History Modal */}
      {selectedAccount && (
        <Modal
          isOpen={transactionModalOpen}
          onClose={() => setTransactionModalOpen(false)}
          title={`Transaction History - ${selectedAccount.user.firstName} ${selectedAccount.user.lastName}`}
          size="xl"
        >
          <div className="space-y-4">
            {/* Account Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Account Details</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedAccount.accountNumber} • {selectedAccount.accountType}
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Current Balance: {formatCurrency(selectedAccount.balance)}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Customer Info</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedAccount.user.email}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Joined: {formatDate(selectedAccount.user.joinedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Transactions */}
            {loadingTransactions ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : accountTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No transactions found for this account.</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white dark:bg-gray-900">
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Date</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Type</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Description</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Amount</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Balance After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accountTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 px-3 text-sm text-gray-900 dark:text-gray-100">
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td className="py-2 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            transaction.type === 'DEPOSIT' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-sm text-gray-900 dark:text-gray-100">
                          {transaction.description}
                        </td>
                        <td className={`py-2 px-3 text-sm text-right font-medium ${
                          transaction.type === 'DEPOSIT' 
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </td>
                        <td className="py-2 px-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(transaction.balanceAfter)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}


