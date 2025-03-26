import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
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

interface AddTransactionFormProps {
  onSubmit: (data: Omit<Payment, 'id' | 'status'>) => void;
  onCancel: () => void;
}

function AddTransactionForm({ onSubmit, onCancel }: AddTransactionFormProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [tenantId, setTenantId] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [method, setMethod] = useState<Payment['method']>('creditCard');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tenantId || !tenantName || !amount || !date) {
      setError('Please fill in all required fields');
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    onSubmit({
      tenantId,
      tenantName,
      amount: paymentAmount,
      date,
      method,
      description: description || `Transaction for ${tenantName}`
    });
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Add Transaction</h2>
        <button
          type="button"
          onClick={onCancel}
          className={`px-3 py-1 rounded ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Cancel
        </button>
      </div>

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
          placeholder="Enter transaction description"
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Add Transaction
      </button>
    </form>
  );
}

export default AddTransactionForm; 