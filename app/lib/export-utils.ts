/**
 * Utility functions for exporting data to various formats
 */

// FilterOptions interface for account filtering
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
    role?: string;
    isActive?: boolean;
    joinedAt?: string;
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

// Export data to CSV format
export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv');
}

// Export accounts data to CSV
export function exportAccountsToCSV(accounts: Account[]): void {
  const csvData = accounts.map(account => ({
    'Account Number': account.accountNumber,
    'Customer Name': `${account.user.firstName} ${account.user.lastName}`,
    'Email': account.user.email,
    'Account Type': account.accountType,
    'Balance': `$${Number(account.balance).toFixed(2)}`,
    'Status': account.user.isActive ? 'Active' : 'Inactive',
    'Transaction Count': account._count?.transactions || 0,
    'Created Date': new Date(account.createdAt).toLocaleDateString(),
    'Last Activity': account.latestTransaction 
      ? new Date(account.latestTransaction.createdAt).toLocaleDateString()
      : 'No activity'
  }));

  const timestamp = new Date().toISOString().split('T')[0];
  exportToCSV(csvData, `accounts-export-${timestamp}.csv`);
}

// Export transactions data to CSV
export function exportTransactionsToCSV(transactions: Transaction[]): void {
  const csvData = transactions.map(tx => ({
    'Transaction ID': tx.id,
    'Date': new Date(tx.createdAt).toLocaleDateString(),
    'Time': new Date(tx.createdAt).toLocaleTimeString(),
    'Customer': tx.customer?.name || 'N/A',
    'Account Number': tx.account.accountNumber,
    'Type': tx.type,
    'Amount': `$${Number(tx.amount).toFixed(2)}`,
    'Balance After': `$${Number(tx.balanceAfter).toFixed(2)}`,
    'Description': tx.description || '',
    'Status': tx.status
  }));

  const timestamp = new Date().toISOString().split('T')[0];
  exportToCSV(csvData, `transactions-export-${timestamp}.csv`);
}

// Generate PDF report (basic implementation)
export function exportAccountsToPDF(accounts: Account[]): void {
  const htmlContent = generateAccountsHTML(accounts);
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }
}

// Generate HTML for PDF export
function generateAccountsHTML(accounts: Account[]): string {
  const timestamp = new Date().toLocaleDateString();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>SecureBank - Accounts Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #4f46e5; text-align: center; }
        .header { text-align: center; margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .summary { background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .date { color: #666; font-size: 14px; }
        @media print { 
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>SecureBank - Customer Accounts Report</h1>
        <p class="date">Generated on: ${timestamp}</p>
      </div>
      
      <div class="summary">
        <h3>Summary</h3>
        <p><strong>Total Accounts:</strong> ${accounts.length}</p>
        <p><strong>Active Accounts:</strong> ${accounts.filter(a => a.user.isActive).length}</p>
        <p><strong>Total Balance:</strong> $${accounts.reduce((sum, a) => sum + Number(a.balance), 0).toFixed(2)}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Account Number</th>
            <th>Customer Name</th>
            <th>Email</th>
            <th>Type</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Transactions</th>
          </tr>
        </thead>
        <tbody>
          ${accounts.map(account => `
            <tr>
              <td>${account.accountNumber}</td>
              <td>${account.user.firstName} ${account.user.lastName}</td>
              <td>${account.user.email}</td>
              <td>${account.accountType}</td>
              <td>$${Number(account.balance).toFixed(2)}</td>
              <td>${account.user.isActive ? 'Active' : 'Inactive'}</td>
              <td>${account._count?.transactions || 0}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;
}

// Helper function to trigger file download
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Format currency for display
export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return numAmount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  });
}

// Format date for display
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    });
  } catch {
    return dateString;
  }
}

// Filter accounts by various criteria
export function filterAccounts(accounts: Account[], filters: Partial<FilterOptions>): Account[] {
  return accounts.filter(account => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const customerName = `${account.user.firstName} ${account.user.lastName}`.toLowerCase();
      const email = account.user.email.toLowerCase();
      const accountNumber = account.accountNumber.toLowerCase();
      
      if (!customerName.includes(searchTerm) && 
          !email.includes(searchTerm) && 
          !accountNumber.includes(searchTerm)) {
        return false;
      }
    }

    // Status filter
    if (filters.status === 'active' && !account.user.isActive) return false;
    if (filters.status === 'inactive' && account.user.isActive) return false;

    // Account type filter
    if (filters.accountType !== 'all' && account.accountType !== filters.accountType) return false;

    // Balance range filter
    if (filters.balanceRange && filters.balanceRange !== 'all') {
      const balance = Number(account.balance);
      switch (filters.balanceRange) {
        case 'low':
          if (balance >= 1000) return false;
          break;
        case 'medium':
          if (balance < 1000 || balance >= 10000) return false;
          break;
        case 'high':
          if (balance < 10000) return false;
          break;
      }
    }

    return true;
  });
}
