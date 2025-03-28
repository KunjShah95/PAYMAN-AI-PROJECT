import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { DollarSign, TrendingUp, Calendar, Building2, ArrowUp, ArrowDown, Plus, CreditCard, History, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
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
}

interface WalletState {
  balance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  transactions: Transaction[];
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
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: '',
  });

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

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to save the card details
    console.log('Card details:', cardDetails);
    setShowAddCard(false);
    setCardDetails({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardHolderName: '',
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <input
                  type="text"
                  value={cardDetails.cardNumber}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                  className={`mt-1 block w-full rounded-md ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } border focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={cardDetails.expiryDate}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: e.target.value })}
                    className={`mt-1 block w-full rounded-md ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } border focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                    className={`mt-1 block w-full rounded-md ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } border focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="123"
                    required
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Card Holder Name
                </label>
                <input
                  type="text"
                  value={cardDetails.cardHolderName}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardHolderName: e.target.value })}
                  className={`mt-1 block w-full rounded-md ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } border focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="John Doe"
                  required
                />
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
        </div>
      )}
    </div>
  );
};

export default Wallet; 