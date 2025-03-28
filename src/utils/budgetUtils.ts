import { Transaction } from '../types/wallet';

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate?: string;
  spent: number;
  alerts: {
    threshold: number; // percentage
    enabled: boolean;
  };
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category?: string;
  transactions: {
    id: string;
    amount: number;
    date: string;
    description: string;
  }[];
}

export interface TransactionNote {
  id: string;
  transactionId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const calculateBudgetProgress = (budget: Budget, transactions: Transaction[]): number => {
  const relevantTransactions = transactions.filter(
    t => t.category === budget.category && new Date(t.date) >= new Date(budget.startDate)
  );
  
  const totalSpent = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
  return (totalSpent / budget.amount) * 100;
};

export const shouldAlertBudget = (budget: Budget, progress: number): boolean => {
  return budget.alerts.enabled && progress >= budget.alerts.threshold;
};

export const calculateSavingsProgress = (goal: SavingsGoal): number => {
  return (goal.currentAmount / goal.targetAmount) * 100;
};

export const getDaysUntilDeadline = (deadline: string): number => {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatBudgetPeriod = (period: Budget['period']): string => {
  switch (period) {
    case 'monthly':
      return 'Monthly';
    case 'quarterly':
      return 'Quarterly';
    case 'yearly':
      return 'Yearly';
    default:
      return period;
  }
};

export const getBudgetStatus = (progress: number): 'good' | 'warning' | 'danger' => {
  if (progress < 80) return 'good';
  if (progress < 100) return 'warning';
  return 'danger';
};

export const getSavingsStatus = (progress: number, daysUntilDeadline: number): 'good' | 'warning' | 'danger' => {
  if (progress >= 100) return 'good';
  if (daysUntilDeadline <= 0) return 'danger';
  if (progress < 50 && daysUntilDeadline < 30) return 'warning';
  return 'good';
}; 