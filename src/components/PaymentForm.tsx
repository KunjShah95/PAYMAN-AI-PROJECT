import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { CreditCard, Building2, FileText, Wallet } from 'lucide-react';

interface Payment {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  date: string;
  method: 'creditCard' | 'bankTransfer' | 'check' | 'cash';
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'overdue' | 'paid';
}

interface PaymentFormProps {
  onSubmit: (payment: Omit<Payment, 'id' | 'status'>) => void;
  isCompact?: boolean;
  onViewAllPayments?: () => void;
}

function PaymentForm({ onSubmit, isCompact = false, onViewAllPayments }: PaymentFormProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [tenantId, setTenantId] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [method, setMethod] = useState<Payment['method']>('creditCard');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!tenantId || !tenantName || !amount || !date) {
        setError('Please fill in all required fields');
        return;
      }

      const paymentAmount = parseFloat(amount);
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      await onSubmit({
        tenantId,
        tenantName,
        amount: paymentAmount,
        date,
        method,
        description: description || `Payment for ${tenantName}`
      });

      // Reset form
      setTenantId('');
      setTenantName('');
      setAmount('');
      setDate('');
      setMethod('creditCard');
      setDescription('');
    } catch (err) {
      setError('Failed to submit payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMethodIcon = (method: Payment['method']) => {
    switch (method) {
      case 'creditCard':
        return <CreditCard className="w-5 h-5" />;
      case 'bankTransfer':
        return <Building2 className="w-5 h-5" />;
      case 'check':
        return <FileText className="w-5 h-5" />;
      case 'cash':
        return <Wallet className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  return (
    <div className={`p-6 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {isCompact ? 'Quick Payment' : 'Make a Payment'}
        </h2>
        {isCompact && onViewAllPayments && (
          <button
            onClick={onViewAllPayments}
            className={`text-sm font-medium ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
          >
            View All Payments
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Tenant ID
          </label>
          <input
            type="text"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            className={`w-full px-3 py-2 rounded-md border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Tenant Name
          </label>
          <input
            type="text"
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
            className={`w-full px-3 py-2 rounded-md border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`w-full px-3 py-2 rounded-md border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            min="0"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`w-full px-3 py-2 rounded-md border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['creditCard', 'bankTransfer', 'check', 'cash'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border ${
                  method === m
                    ? isDark
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-blue-50 border-blue-500 text-blue-700'
                    : isDark
                      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {getMethodIcon(m)}
                <span className="capitalize">{m.replace(/([A-Z])/g, ' $1').trim()}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Description (Optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full px-3 py-2 rounded-md border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            placeholder="Enter payment description"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            isSubmitting
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Processing...' : 'Submit Payment'}
        </button>
      </form>
    </div>
  );
}

export default PaymentForm;