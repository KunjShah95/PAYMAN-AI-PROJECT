import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { DollarSign, TrendingUp, Calendar, Building2, ArrowUp, ArrowDown, Plus, CreditCard, History, ArrowDownLeft, ArrowUpRight, Search, Filter, PiggyBank, Target, AlertCircle } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import Notification, { NotificationType } from './Notification';
import { CardDetails, CardType, formatCardNumber, formatExpiryDate, validateCardNumber, validateExpiryDate, validateCVV, detectCardType, getCardIcon } from '../utils/cardUtils';
import { 
  Budget, 
  SavingsGoal, 
  TransactionNote,
  calculateBudgetProgress,
  shouldAlertBudget,
  calculateSavingsProgress,
  getDaysUntilDeadline,
  formatBudgetPeriod,
  getBudgetStatus,
  getSavingsStatus
} from '../utils/budgetUtils';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  date: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  category?: string;
}

interface RecurringTransaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  description: string;
  status: 'active' | 'completed' | 'cancelled';
}

interface WalletState {
  balance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  transactions: Transaction[];
  recurringTransactions: RecurringTransaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  transactionNotes: TransactionNote[];
}

const Wallet: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('creditCard');
  const [selectedWithdrawMethod, setSelectedWithdrawMethod] = useState('bankAccount');
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: '',
  });
  const [cardErrors, setCardErrors] = useState<Partial<CardDetails>>({});
  const [cardType, setCardType] = useState<CardType>('unknown');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [notification, setNotification] = useState<{
    type: NotificationType;
    message: string;
  } | null>(null);
  const [showBudgets, setShowBudgets] = useState(false);
  const [showSavingsGoals, setShowSavingsGoals] = useState(false);
  const [showTransactionNotes, setShowTransactionNotes] = useState(false);
  const [selectedTransactionForNote, setSelectedTransactionForNote] = useState<string | null>(null);
  const [newBudget, setNewBudget] = useState<Partial<Budget>>({
    category: '',
    amount: 0,
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    alerts: {
      threshold: 80,
      enabled: true,
    },
  });
  const [newSavingsGoal, setNewSavingsGoal] = useState<Partial<SavingsGoal>>({
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    deadline: '',
    category: '',
  });
  const [newNote, setNewNote] = useState('');

  // Initialize wallet state
  const [walletState, setWalletState] = useState<WalletState>({
    balance: 25000,
    totalDeposits: 35000,
    totalWithdrawals: 10000,
    transactions: [
      {
        id: '1',
        type: 'deposit',
        amount: 5000,
        date: '2024-03-15',
        description: 'Monthly rent collection',
        status: 'completed',
      },
      {
        id: '2',
        type: 'withdrawal',
        amount: 2000,
        date: '2024-03-14',
        description: 'Maintenance payment',
        status: 'completed',
      },
      {
        id: '3',
        type: 'transfer',
        amount: 1500,
        date: '2024-03-13',
        description: 'Transfer to savings',
        status: 'completed',
      },
    ],
    recurringTransactions: [],
    budgets: [
      {
        id: 'budget1',
        category: 'rent',
        amount: 5000,
        period: 'monthly',
        startDate: '2024-01-01',
        spent: 4500,
        alerts: {
          threshold: 80,
          enabled: true,
        },
      },
    ],
    savingsGoals: [
      {
        id: 'goal1',
        name: 'Emergency Fund',
        targetAmount: 10000,
        currentAmount: 7500,
        deadline: '2024-12-31',
        category: 'savings',
        transactions: [],
      },
    ],
    transactionNotes: [],
  });

  // Mock data for the chart
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [100000, 115000, 125000, 120000, 130000, 125000],
        borderColor: isDark ? '#60A5FA' : '#2563EB',
        backgroundColor: isDark ? 'rgba(96, 165, 250, 0.1)' : 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        titleColor: isDark ? '#FFFFFF' : '#000000',
        bodyColor: isDark ? '#FFFFFF' : '#000000',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDark ? '#9CA3AF' : '#6B7280',
        },
      },
      x: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDark ? '#9CA3AF' : '#6B7280',
        },
      },
    },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-5 h-5 text-red-500" />;
      case 'transfer':
        return <ArrowUpRight className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const handleAddFunds = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(addFundsAmount);
    if (amount > 0) {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'deposit',
        amount,
        date: new Date().toISOString(),
        description: `Deposit via ${selectedPaymentMethod}`,
        status: 'completed',
      };

      setWalletState(prev => ({
        ...prev,
        balance: prev.balance + amount,
        totalDeposits: prev.totalDeposits + amount,
        transactions: [newTransaction, ...prev.transactions],
      }));

      setAddFundsAmount('');
      setShowAddFunds(false);
    }
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (amount > 0 && amount <= walletState.balance) {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'withdrawal',
        amount,
        date: new Date().toISOString(),
        description: `Withdrawal via ${selectedWithdrawMethod}`,
        status: 'completed',
      };

      setWalletState(prev => ({
        ...prev,
        balance: prev.balance - amount,
        totalWithdrawals: prev.totalWithdrawals + amount,
        transactions: [newTransaction, ...prev.transactions],
      }));

      setWithdrawAmount('');
      setShowWithdraw(false);
    }
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(transferAmount);
    if (amount > 0 && amount <= walletState.balance) {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'transfer',
        amount,
        date: new Date().toISOString(),
        description: 'Transfer to savings account',
        status: 'completed',
      };

      setWalletState(prev => ({
        ...prev,
        balance: prev.balance - amount,
        transactions: [newTransaction, ...prev.transactions],
      }));

      setTransferAmount('');
      setShowTransfer(false);
    }
  };

  const handleCardInputChange = (field: keyof CardDetails, value: string) => {
    let formattedValue = value;
    
    switch (field) {
      case 'cardNumber':
        formattedValue = formatCardNumber(value);
        setCardType(detectCardType(value));
        break;
      case 'expiryDate':
        formattedValue = formatExpiryDate(value);
        break;
      case 'cvv':
        formattedValue = value.replace(/[^0-9]/g, '');
        break;
    }

    setCardDetails(prev => ({ ...prev, [field]: formattedValue }));
    validateCardField(field, formattedValue);
  };

  const validateCardField = (field: keyof CardDetails, value: string) => {
    let error = '';
    
    switch (field) {
      case 'cardNumber':
        if (!validateCardNumber(value)) {
          error = 'Invalid card number';
        }
        break;
      case 'expiryDate':
        if (!validateExpiryDate(value)) {
          error = 'Invalid expiry date';
        }
        break;
      case 'cvv':
        if (!validateCVV(value)) {
          error = 'Invalid CVV';
        }
        break;
      case 'cardHolderName':
        if (!value.trim()) {
          error = 'Card holder name is required';
        }
        break;
    }

    setCardErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const isCardNumberValid = validateCardField('cardNumber', cardDetails.cardNumber);
    const isExpiryValid = validateCardField('expiryDate', cardDetails.expiryDate);
    const isCVVValid = validateCardField('cvv', cardDetails.cvv);
    const isNameValid = validateCardField('cardHolderName', cardDetails.cardHolderName);

    if (isCardNumberValid && isExpiryValid && isCVVValid && isNameValid) {
      // Here you would typically make an API call to save the card details
      console.log('Card details:', cardDetails);
      setShowAddCard(false);
      setCardDetails({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardHolderName: '',
      });
      setCardType('unknown');
      setNotification({
        type: 'success',
        message: 'Card added successfully!',
      });
    } else {
      setNotification({
        type: 'error',
        message: 'Please fix the errors before submitting.',
      });
    }
  };

  const filteredTransactions = useMemo(() => {
    return walletState.transactions.filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [walletState.transactions, searchQuery, selectedCategory]);

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudget.category || !newBudget.amount) return;

    const budget: Budget = {
      id: `budget${Date.now()}`,
      category: newBudget.category,
      amount: newBudget.amount,
      period: newBudget.period as Budget['period'],
      startDate: newBudget.startDate || new Date().toISOString().split('T')[0],
      endDate: newBudget.endDate,
      spent: 0,
      alerts: newBudget.alerts || {
        threshold: 80,
        enabled: true,
      },
    };

    setWalletState(prev => ({
      ...prev,
      budgets: [...prev.budgets, budget],
    }));

    setNewBudget({
      category: '',
      amount: 0,
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      alerts: {
        threshold: 80,
        enabled: true,
      },
    });
    setShowBudgets(false);
    setNotification({
      type: 'success',
      message: 'Budget added successfully!',
    });
  };

  const handleAddSavingsGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSavingsGoal.name || !newSavingsGoal.targetAmount || !newSavingsGoal.deadline) return;

    const goal: SavingsGoal = {
      id: `goal${Date.now()}`,
      name: newSavingsGoal.name,
      targetAmount: newSavingsGoal.targetAmount,
      currentAmount: newSavingsGoal.currentAmount || 0,
      deadline: newSavingsGoal.deadline,
      category: newSavingsGoal.category,
      transactions: [],
    };

    setWalletState(prev => ({
      ...prev,
      savingsGoals: [...prev.savingsGoals, goal],
    }));

    setNewSavingsGoal({
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      deadline: '',
      category: '',
    });
    setShowSavingsGoals(false);
    setNotification({
      type: 'success',
      message: 'Savings goal added successfully!',
    });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedTransactionForNote) return;

    const note: TransactionNote = {
      id: `note${Date.now()}`,
      transactionId: selectedTransactionForNote,
      content: newNote,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setWalletState(prev => ({
      ...prev,
      transactionNotes: [...prev.transactionNotes, note],
    }));

    setNewNote('');
    setSelectedTransactionForNote(null);
    setShowTransactionNotes(false);
    setNotification({
      type: 'success',
      message: 'Note added successfully!',
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Wallet
          </h1>
          <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your funds and view transaction history
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowAddFunds(true)}
            className={`px-4 py-2 rounded-md flex items-center ${
              isDark
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Funds
          </button>
          <button
            onClick={() => setShowWithdraw(true)}
            className={`px-4 py-2 rounded-md flex items-center ${
              isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-white hover:bg-gray-50 text-gray-700'
            }`}
          >
            <ArrowUpRight className="w-5 h-5 mr-2" />
            Withdraw
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Available Balance</p>
            <h2 className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(walletState.balance)}
            </h2>
          </div>
          <div className={`p-3 rounded-full ${isDark ? 'bg-blue-900 bg-opacity-50' : 'bg-blue-100'}`}>
            <DollarSign className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Deposits</p>
            <p className={`text-lg font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(walletState.totalDeposits)}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Withdrawals</p>
            <p className={`text-lg font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(walletState.totalWithdrawals)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => setShowAddCard(true)}
            className={`p-4 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <CreditCard className={`w-6 h-6 mr-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Add Card</span>
          </button>
          <button 
            onClick={() => setShowTransactionHistory(true)}
            className={`p-4 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <History className={`w-6 h-6 mr-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Transaction History</span>
          </button>
          <button 
            onClick={() => setShowTransfer(true)}
            className={`p-4 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <ArrowUpRight className={`w-6 h-6 mr-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Transfer Funds</span>
          </button>
          <button 
            onClick={() => setShowBudgets(true)}
            className={`p-4 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <Target className={`w-6 h-6 mr-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Budgets</span>
          </button>
          <button 
            onClick={() => setShowSavingsGoals(true)}
            className={`p-4 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <PiggyBank className={`w-6 h-6 mr-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Savings</span>
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Recent Transactions
        </h2>
        <div className="space-y-4">
          {walletState.transactions.map((transaction) => (
            <div
              key={transaction.id}
              className={`flex items-center justify-between p-4 rounded-lg ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                {getTransactionIcon(transaction.type)}
                <div className="ml-4">
                  <p className={isDark ? 'text-white' : 'text-gray-900'}>
                    {transaction.description}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {formatDate(transaction.date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'deposit' ? 'text-green-500' :
                  transaction.type === 'withdrawal' ? 'text-red-500' :
                  'text-blue-500'
                }`}>
                  {transaction.type === 'deposit' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
                <p className={`text-sm ${
                  transaction.status === 'completed' ? 'text-green-500' :
                  transaction.status === 'pending' ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Funds Modal */}
      {showAddFunds && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} w-full max-w-md`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Add Funds
            </h2>
            <form onSubmit={handleAddFunds} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Amount
                </label>
                <input
                  type="number"
                  value={addFundsAmount}
                  onChange={(e) => setAddFundsAmount(e.target.value)}
                  className={`mt-1 block w-full rounded-md ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } border focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Payment Method
                </label>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className={`mt-1 block w-full rounded-md ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } border focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="creditCard">Credit Card</option>
                  <option value="bankTransfer">Bank Transfer</option>
                  <option value="check">Check</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddFunds(false)}
                  className={`px-4 py-2 rounded-md ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} w-full max-w-md`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Withdraw Funds
            </h2>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Amount
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className={`mt-1 block w-full rounded-md ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } border focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Withdrawal Method
                </label>
                <select
                  value={selectedWithdrawMethod}
                  onChange={(e) => setSelectedWithdrawMethod(e.target.value)}
                  className={`mt-1 block w-full rounded-md ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } border focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="bankAccount">Bank Account</option>
                  <option value="check">Check</option>
                  <option value="wireTransfer">Wire Transfer</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowWithdraw(false)}
                  className={`px-4 py-2 rounded-md ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Withdraw
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} w-full max-w-md`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Transfer Funds
            </h2>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Amount
                </label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className={`mt-1 block w-full rounded-md ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } border focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Transfer To
                </label>
                <select
                  className={`mt-1 block w-full rounded-md ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } border focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option>Savings Account</option>
                  <option>Investment Account</option>
                  <option>Business Account</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowTransfer(false)}
                  className={`px-4 py-2 rounded-md ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Card Modal */}
      {showAddCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} w-full max-w-md`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Add New Card
            </h2>
            <form onSubmit={handleAddCard} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Card Number
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    value={cardDetails.cardNumber}
                    onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                    className={`block w-full rounded-md ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } border focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl">
                    {getCardIcon(cardType)}
                  </span>
                </div>
                {cardErrors.cardNumber && (
                  <p className="mt-1 text-sm text-red-500">{cardErrors.cardNumber}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={cardDetails.expiryDate}
                    onChange={(e) => handleCardInputChange('expiryDate', e.target.value)}
                    className={`mt-1 block w-full rounded-md ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } border focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="MM/YY"
                    required
                  />
                  {cardErrors.expiryDate && (
                    <p className="mt-1 text-sm text-red-500">{cardErrors.expiryDate}</p>
                  )}
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cvv}
                    onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                    className={`mt-1 block w-full rounded-md ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } border focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="123"
                    required
                  />
                  {cardErrors.cvv && (
                    <p className="mt-1 text-sm text-red-500">{cardErrors.cvv}</p>
                  )}
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Card Holder Name
                </label>
                <input
                  type="text"
                  value={cardDetails.cardHolderName}
                  onChange={(e) => handleCardInputChange('cardHolderName', e.target.value)}
                  className={`mt-1 block w-full rounded-md ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } border focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="John Doe"
                  required
                />
                {cardErrors.cardHolderName && (
                  <p className="mt-1 text-sm text-red-500">{cardErrors.cardHolderName}</p>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddCard(false)}
                  className={`px-4 py-2 rounded-md ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {showTransactionHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} w-full max-w-2xl max-h-[80vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Transaction History
              </h2>
              <button
                onClick={() => setShowTransactionHistory(false)}
                className={`p-2 rounded-full ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Search and Filter */}
            <div className="mb-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-md ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } border focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Search transactions..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="text-gray-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`rounded-md ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } border focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="all">All Categories</option>
                  <option value="rent">Rent</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="utilities">Utilities</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    {getTransactionIcon(transaction.type)}
                    <div className="ml-4">
                      <p className={isDark ? 'text-white' : 'text-gray-900'}>
                        {transaction.description}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'deposit' ? 'text-green-500' :
                      transaction.type === 'withdrawal' ? 'text-red-500' :
                      'text-blue-500'
                    }`}>
                      {transaction.type === 'deposit' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className={`text-sm ${
                      transaction.status === 'completed' ? 'text-green-500' :
                      transaction.status === 'pending' ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Budgets Modal */}
      {showBudgets && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} w-full max-w-2xl max-h-[80vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Budgets
              </h2>
              <button
                onClick={() => setShowBudgets(false)}
                className={`p-2 rounded-full ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Add New Budget Form */}
            <form onSubmit={handleAddBudget} className="mb-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Category
                  </label>
                  <select
                    value={newBudget.category}
                    onChange={(e) => setNewBudget(prev => ({ ...prev, category: e.target.value }))}
                    className={`mt-1 block w-full rounded-md ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } border focus:ring-blue-500 focus:border-blue-500`}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="rent">Rent</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="utilities">Utilities</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Amount
                  </label>
                  <input
                    type="number"
                    value={newBudget.amount}
                    onChange={(e) => setNewBudget(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                    className={`mt-1 block w-full rounded-md ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } border focus:ring-blue-500 focus:border-blue-500`}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Period
                  </label>
                  <select
                    value={newBudget.period}
                    onChange={(e) => setNewBudget(prev => ({ ...prev, period: e.target.value as Budget['period'] }))}
                    className={`mt-1 block w-full rounded-md ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } border focus:ring-blue-500 focus:border-blue-500`}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newBudget.startDate}
                    onChange={(e) => setNewBudget(prev => ({ ...prev, startDate: e.target.value }))}
                    className={`mt-1 block w-full rounded-md ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } border focus:ring-blue-500 focus:border-blue-500`}
                    required
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Alert Threshold (%)
                </label>
                <input
                  type="number"
                  value={newBudget.alerts?.threshold}
                  onChange={(e) => setNewBudget(prev => ({
                    ...prev,
                    alerts: { ...prev.alerts!, threshold: parseFloat(e.target.value) }
                  }))}
                  className={`mt-1 block w-full rounded-md ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } border focus:ring-blue-500 focus:border-blue-500`}
                  min="0"
                  max="100"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newBudget.alerts?.enabled}
                  onChange={(e) => setNewBudget(prev => ({
                    ...prev,
                    alerts: { ...prev.alerts!, enabled: e.target.checked }
                  }))}
                  className={`rounded ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
                <label className={`ml-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Enable alerts
                </label>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add Budget
                </button>
              </div>
            </form>

            {/* Budgets List */}
            <div className="space-y-4">
              {walletState.budgets.map((budget) => {
                const progress = calculateBudgetProgress(budget, walletState.transactions);
                const status = getBudgetStatus(progress);
                const shouldAlert = shouldAlertBudget(budget, progress);

                return (
                  <div
                    key={budget.id}
                    className={`p-4 rounded-lg ${
                      isDark ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {budget.category.charAt(0).toUpperCase() + budget.category.slice(1)}
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatBudgetPeriod(budget.period)} • {formatCurrency(budget.amount)}
                        </p>
                      </div>
                      {shouldAlert && (
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="mt-4">
                      <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                        <div
                          className={`h-full rounded-full ${
                            status === 'good' ? 'bg-green-500' :
                            status === 'warning' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <p className={`mt-1 text-sm ${
                        status === 'good' ? 'text-green-500' :
                        status === 'warning' ? 'text-yellow-500' :
                        'text-red-500'
                      }`}>
                        {progress.toFixed(1)}% spent
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Savings Goals Modal */}
      {showSavingsGoals && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} w-full max-w-2xl max-h-[80vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Savings Goals
              </h2>
              <button
                onClick={() => setShowSavingsGoals(false)}
                className={`p-2 rounded-full ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Add New Savings Goal Form */}
            <form onSubmit={handleAddSavingsGoal} className="mb-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Goal Name
                </label>
                <input
                  type="text"
                  value={newSavingsGoal.name}
                  onChange={(e) => setNewSavingsGoal(prev => ({ ...prev, name: e.target.value }))}
                  className={`mt-1 block w-full rounded-md ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } border focus:ring-blue-500 focus:border-blue-500`}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Target Amount
                  </label>
                  <input
                    type="number"
                    value={newSavingsGoal.targetAmount}
                    onChange={(e) => setNewSavingsGoal(prev => ({ ...prev, targetAmount: parseFloat(e.target.value) }))}
                    className={`mt-1 block w-full rounded-md ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } border focus:ring-blue-500 focus:border-blue-500`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Current Amount
                  </label>
                  <input
                    type="number"
                    value={newSavingsGoal.currentAmount}
                    onChange={(e) => setNewSavingsGoal(prev => ({ ...prev, currentAmount: parseFloat(e.target.value) }))}
                    className={`mt-1 block w-full rounded-md ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } border focus:ring-blue-500 focus:border-blue-500`}
                    required
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Deadline
                </label>
                <input
                  type="date"
                  value={newSavingsGoal.deadline}
                  onChange={(e) => setNewSavingsGoal(prev => ({ ...prev, deadline: e.target.value }))}
                  className={`mt-1 block w-full rounded-md ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } border focus:ring-blue-500 focus:border-blue-500`}
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add Savings Goal
                </button>
              </div>
            </form>

            {/* Savings Goals List */}
            <div className="space-y-4">
              {walletState.savingsGoals.map((goal) => {
                const progress = calculateSavingsProgress(goal);
                const daysUntilDeadline = getDaysUntilDeadline(goal.deadline);
                const status = getSavingsStatus(progress, daysUntilDeadline);

                return (
                  <div
                    key={goal.id}
                    className={`p-4 rounded-lg ${
                      isDark ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {goal.name}
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatCurrency(goal.targetAmount)} • {daysUntilDeadline} days left
                        </p>
                      </div>
                      {status === 'warning' && (
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                      )}
                      {status === 'danger' && (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="mt-4">
                      <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                        <div
                          className={`h-full rounded-full ${
                            status === 'good' ? 'bg-green-500' :
                            status === 'warning' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <p className={`mt-1 text-sm ${
                        status === 'good' ? 'text-green-500' :
                        status === 'warning' ? 'text-yellow-500' :
                        'text-red-500'
                      }`}>
                        {progress.toFixed(1)}% saved
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Transaction Notes Modal */}
      {showTransactionNotes && selectedTransactionForNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} w-full max-w-md`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Add Note
              </h2>
              <button
                onClick={() => {
                  setShowTransactionNotes(false);
                  setSelectedTransactionForNote(null);
                }}
                className={`p-2 rounded-full ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddNote} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Note
                </label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className={`mt-1 block w-full rounded-md ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } border focus:ring-blue-500 focus:border-blue-500`}
                  rows={4}
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowTransactionNotes(false);
                    setSelectedTransactionForNote(null);
                  }}
                  className={`px-4 py-2 rounded-md ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default Wallet; 