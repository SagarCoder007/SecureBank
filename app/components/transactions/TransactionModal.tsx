'use client';

import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface Account {
  id: string;
  accountNumber: string;
  accountType: string;
  balance: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'deposit' | 'withdraw';
  account: Account;
  onSuccess: () => void;
}

export function TransactionModal({ isOpen, onClose, type, account, onSuccess }: TransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isDeposit = type === 'deposit';
  const title = isDeposit ? 'Make Deposit' : 'Make Withdrawal';
  const actionText = isDeposit ? 'Deposit' : 'Withdraw';
  const color = isDeposit ? 'text-green-600' : 'text-red-600';
  const bgColor = isDeposit ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
      const endpoint = isDeposit ? '/api/transactions/deposit' : '/api/transactions/withdraw';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description: description || (isDeposit ? 'Deposit' : 'Withdrawal'),
          accountId: account.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
        onClose();
        // Reset form
        setAmount('');
        setDescription('');
      } else {
        setError(data.error || `${actionText} failed`);
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setDescription('');
    setError('');
    onClose();
  };

  const incrementAmount = (value: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + value).toString());
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Info */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Account Balance
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {account.accountNumber} • {account.accountType}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            ${parseFloat(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount to {actionText}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-lg">$</span>
            </div>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="block w-full pl-8 pr-12 h-12 border border-gray-300 rounded-xl bg-white text-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500"
            />
          </div>
          
          {/* Quick Amount Buttons */}
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[25, 50, 100, 500].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => incrementAmount(value)}
                className="py-2 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                +${value}
              </button>
            ))}
          </div>
        </div>

        {/* Description Input */}
        <Input
          label={`${actionText} Description (Optional)`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={`Enter description for this ${type}`}
          maxLength={100}
        />

        {/* Insufficient Funds Warning for Withdrawals */}
        {!isDeposit && amount && parseFloat(amount) > parseFloat(account.balance) && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Insufficient Funds
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  You cannot withdraw more than your available balance.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={!amount || parseFloat(amount) <= 0 || (!isDeposit && parseFloat(amount) > parseFloat(account.balance))}
            className={`flex-1 ${bgColor} focus:ring-indigo-500`}
          >
            {loading ? `Processing...` : `${actionText} $${amount || '0.00'}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}


