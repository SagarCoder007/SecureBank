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
  const [currentSection, setCurrentSection] = useState<'dashboard' | 'transactions'>('dashboard');

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

  const handleNavigation = (section: string) => {
    if (section === 'dashboard' || section === 'transactions') {
      setCurrentSection(section);
    }
  };

  const formatCurrency = (amount: string) => {
    return parseFloat(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Use consistent formatting to prevent hydration mismatch
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC' // Use UTC to ensure consistent rendering
      });
    } catch (error) {
      return dateString; // Fallback to original string
    }
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
      <Header user={user} onLogout={handleLogout} onNavigate={handleNavigation} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {currentSection === 'dashboard' 
              ? `Welcome back, ${user?.firstName}!` 
              : 'Transaction History'
            }
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            {currentSection === 'dashboard' 
              ? 'Manage your accounts and transactions'
              : 'View all your account transactions and activity'
            }
          </p>
        </div>

        {/* Account Overview Cards - Only show on dashboard */}
        {currentSection === 'dashboard' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Balance */}
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg sm:text-xl">Total Balance</CardTitle>
              <CardDescription className="text-indigo-100 text-sm">
                Across all accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl sm:text-3xl font-bold">
                {formatCurrency(totalBalance.toString())}
              </div>
            </CardContent>
          </Card>

          {/* Primary Account */}
          {primaryAccount && (
            <Card className="sm:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">Primary Account</CardTitle>
                <CardDescription className="text-sm">
                  {primaryAccount.accountNumber} • {primaryAccount.accountType}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(primaryAccount.balance)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="sm:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
              <CardDescription className="text-sm">
                Manage your money
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <Button 
                onClick={() => openModal('deposit')} 
                className="w-full bg-green-600 hover:bg-green-700 text-sm sm:text-base"
                disabled={!primaryAccount}
                size="sm"
              >
                💰 Deposit Money
              </Button>
              <Button 
                onClick={() => openModal('withdraw')} 
                variant="destructive" 
                className="w-full text-sm sm:text-base"
                disabled={!primaryAccount}
                size="sm"
              >
                💳 Withdraw Money
              </Button>
            </CardContent>
          </Card>
          </div>
        )}

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              {currentSection === 'dashboard' ? 'Recent Transactions' : 'All Transactions'}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {currentSection === 'dashboard' 
                ? 'Your latest account activity'
                : 'Complete transaction history for all your accounts'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No transactions yet
                </h3>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4">
                  Start by making your first deposit or withdrawal
                </p>
                <Button onClick={() => openModal('deposit')} disabled={!primaryAccount} size="sm">
                  Make First Deposit
                </Button>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                          Date & Time
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                          Type
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                          Description
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                          Amount
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                          Balance After
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(currentSection === 'dashboard' ? transactions.slice(0, 5) : transactions).map((transaction) => (
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

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {(currentSection === 'dashboard' ? transactions.slice(0, 5) : transactions).map((transaction) => (
                    <div key={transaction.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'DEPOSIT' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {transaction.type === 'DEPOSIT' ? '📈' : '📉'} {transaction.type}
                        </span>
                        <span className={`text-lg font-semibold ${
                          transaction.type === 'DEPOSIT' 
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Description</span>
                          <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                            {transaction.description}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Balance After</span>
                          <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                            {formatCurrency(transaction.balanceAfter)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-gray-100 dark:border-gray-700">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {formatDate(transaction.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {/* Show "View All" button only on dashboard with transactions */}
            {currentSection === 'dashboard' && transactions.length > 5 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setCurrentSection('transactions')}
                  className="inline-flex items-center px-4 py-2 border border-indigo-300 dark:border-indigo-600 text-sm font-medium rounded-lg text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                >
                  View All Transactions
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
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


