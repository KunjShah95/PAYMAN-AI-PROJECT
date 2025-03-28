export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  date: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  category?: string;
}

export interface WalletState {
  balance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  transactions: Transaction[];
  recurringTransactions: RecurringTransaction[];
}

export interface RecurringTransaction {
  id: string;
  type: Transaction['type'];
  amount: number;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  category?: string;
  lastProcessed?: string;
}

export interface SpendingAnalytics {
  totalSpent: number;
  totalReceived: number;
  categoryBreakdown: {
    [key: string]: number;
  };
  monthlyTrend: {
    [key: string]: {
      spent: number;
      received: number;
    };
  };
} 