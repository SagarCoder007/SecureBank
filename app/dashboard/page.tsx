'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { performCompleteLogout } from '../lib/logout-utils';

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
}

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'deposit' | 'withdraw'>('deposit');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(storedUser);
    if (userData.role !== 'CUSTOMER') {
      router.push('/login');
      return;
    }

    setUser(userData);
    fetchTransactions();
  }, [router]);

  const fetchTransactions = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        console.error('No access token found, redirecting to login');
        router.push('/login');
        return;
      }

      const response = await fetch('/api/transactions', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
        setAccounts(data.accounts);
        if (data.accounts.length > 0) {
          setSelectedAccount(data.accounts[0]);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to fetch transactions:', response.status, errorData);
        
        // If unauthorized, redirect to login
        if (response.status === 401) {
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('Customer logout initiated');
    
    // Use the centralized logout utility
    await performCompleteLogout();
    
    // Redirect to home page
    router.push('/');
  };

  const openModal = (type: 'deposit' | 'withdraw') => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleTransactionSuccess = () => {
    fetchTransactions(); // Refresh data
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  const primaryAccount = accounts[0];
  const totalBalance = accounts.reduce((sum, account) => sum + parseFloat(account.balance), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={user} onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your accounts and transactions
          </p>
        </div>

        {/* Account Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Balance */}
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="text-white">Total Balance</CardTitle>
              <CardDescription className="text-indigo-100">
                Across all accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(totalBalance.toString())}
              </div>
            </CardContent>
          </Card>

          {/* Primary Account */}
          {primaryAccount && (
            <Card>
              <CardHeader>
                <CardTitle>Primary Account</CardTitle>
                <CardDescription>
                  {primaryAccount.accountNumber} • {primaryAccount.accountType}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(primaryAccount.balance)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Manage your money
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={() => openModal('deposit')} 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!primaryAccount}
              >
                💰 Deposit Money
              </Button>
              <Button 
                onClick={() => openModal('withdraw')} 
                variant="destructive" 
                className="w-full"
                disabled={!primaryAccount}
              >
                💳 Withdraw Money
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your latest account activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No transactions yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Start by making your first deposit or withdrawal
                </p>
                <Button onClick={() => openModal('deposit')} disabled={!primaryAccount}>
                  Make First Deposit
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                        Date & Time
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                        Description
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                        Amount
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                        Balance After
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-4 px-4 text-sm text-gray-900 dark:text-gray-100">
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.type === 'DEPOSIT' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {transaction.type === 'DEPOSIT' ? '📈' : '📉'} {transaction.type}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900 dark:text-gray-100">
                          {transaction.description}
                        </td>
                        <td className={`py-4 px-4 text-sm text-right font-medium ${
                          transaction.type === 'DEPOSIT' 
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </td>
                        <td className="py-4 px-4 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(transaction.balanceAfter)}
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

      {/* Transaction Modal */}
      {selectedAccount && (
        <TransactionModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          type={modalType}
          account={selectedAccount}
          onSuccess={handleTransactionSuccess}
        />
      )}
    </div>
  );
}


