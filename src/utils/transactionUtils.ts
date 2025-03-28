import { Transaction } from '../types/wallet';

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

export const calculateSpendingAnalytics = (transactions: Transaction[]): SpendingAnalytics => {
  const analytics: SpendingAnalytics = {
    totalSpent: 0,
    totalReceived: 0,
    categoryBreakdown: {},
    monthlyTrend: {},
  };

  transactions.forEach(transaction => {
    const amount = transaction.amount;
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    // Initialize monthly data if not exists
    if (!analytics.monthlyTrend[monthKey]) {
      analytics.monthlyTrend[monthKey] = { spent: 0, received: 0 };
    }

    // Update totals and monthly trends
    if (transaction.type === 'deposit') {
      analytics.totalReceived += amount;
      analytics.monthlyTrend[monthKey].received += amount;
    } else {
      analytics.totalSpent += amount;
      analytics.monthlyTrend[monthKey].spent += amount;
    }

    // Update category breakdown
    if (transaction.category) {
      analytics.categoryBreakdown[transaction.category] = 
        (analytics.categoryBreakdown[transaction.category] || 0) + amount;
    }
  });

  return analytics;
};

export const exportTransactionsToCSV = (transactions: Transaction[]): string => {
  const headers = ['Date', 'Type', 'Amount', 'Description', 'Status', 'Category'];
  const rows = transactions.map(transaction => [
    new Date(transaction.date).toLocaleDateString(),
    transaction.type,
    transaction.amount.toString(),
    transaction.description,
    transaction.status,
    transaction.category || '',
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');
};

export const shouldProcessRecurringTransaction = (
  recurring: RecurringTransaction,
  currentDate: Date = new Date()
): boolean => {
  const lastProcessed = recurring.lastProcessed ? new Date(recurring.lastProcessed) : null;
  const startDate = new Date(recurring.startDate);
  const endDate = recurring.endDate ? new Date(recurring.endDate) : null;

  // Check if transaction is still active
  if (endDate && currentDate > endDate) return false;
  if (currentDate < startDate) return false;

  // If never processed, process if start date is in the past
  if (!lastProcessed) return currentDate >= startDate;

  // Calculate next processing date based on frequency
  const nextDate = new Date(lastProcessed);
  switch (recurring.frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }

  return currentDate >= nextDate;
};

export const generateRecurringTransaction = (
  recurring: RecurringTransaction,
  currentDate: Date = new Date()
): Transaction => {
  return {
    id: `${recurring.id}-${currentDate.getTime()}`,
    type: recurring.type,
    amount: recurring.amount,
    date: currentDate.toISOString(),
    description: recurring.description,
    status: 'pending',
    category: recurring.category,
  };
}; 