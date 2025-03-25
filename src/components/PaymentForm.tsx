import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, User, CreditCard } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { tenants } from '../services/mockData';

interface PaymentFormProps {
  onSubmit: (payment: {
    tenantId: string;
    tenantName: string;
    amount: number;
    date: string;
    method: 'creditCard' | 'bankTransfer' | 'check' | 'cash';
    description: string;
  }) => void;
  isCompact?: boolean;
  onViewAllPayments?: () => void;
}

function PaymentForm({ onSubmit, isCompact = false, onViewAllPayments }: PaymentFormProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [tenantId, setTenantId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [method, setMethod] = useState<'creditCard' | 'bankTransfer' | 'check' | 'cash'>('creditCard');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize date to today when component mounts
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setDate(`${year}-${month}-${day}`);
  }, []);

  const selectedTenant = tenants.find(tenant => tenant.id === tenantId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tenantId || !amount || !date) {
      return; // Don't submit if required fields are missing
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        tenantId,
        tenantName: selectedTenant?.name || "",
        amount: parseFloat(amount),
        date,
        method,
        description: description || `Rent payment for ${selectedTenant?.name || "tenant"}`
      });
      
      // Reset form
      setTenantId('');
      setAmount('');
      // Keep the current date
      setMethod('creditCard');
      setDescription('');
    } catch (error) {
      console.error('Error submitting payment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formTitle = isCompact ? "Quick Payment" : "Record Payment";

  return (
    <div className={`p-6 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{formTitle}</h2>
        {isCompact && onViewAllPayments && (
          <button 
            type="button"
            onClick={onViewAllPayments}
            className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <CreditCard className="h-4 w-4 mr-1" />
            View Payments
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="tenantId" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Tenant
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="tenantId"
                value={tenantId}
                onChange={(e) => {
                  setTenantId(e.target.value);
                  const tenant = tenants.find(t => t.id === e.target.value);
                  if (tenant) {
                    setAmount(tenant.rentAmount.toString());
                  }
                }}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'border-gray-300 text-gray-900'
                }`}
                required
              >
                <option value="">Select a tenant</option>
                {tenants.map(tenant => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} - Unit {tenant.unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="amount" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border-gray-300 text-gray-900'
                }`}
                placeholder="Enter amount"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="date" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Payment Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'border-gray-300 text-gray-900'
                }`}
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="method" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Payment Method
            </label>
            <select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value as 'creditCard' | 'bankTransfer' | 'check' | 'cash')}
              className={`block w-full py-2 px-3 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'border-gray-300 text-gray-900'
              }`}
              required
            >
              <option value="creditCard">Credit Card</option>
              <option value="bankTransfer">Bank Transfer</option>
              <option value="check">Check</option>
              <option value="cash">Cash</option>
            </select>
          </div>
          
          {!isCompact && (
            <div>
              <label htmlFor="description" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`block w-full py-2 px-3 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border-gray-300 text-gray-900'
                }`}
                placeholder="e.g. June 2024 Rent"
                rows={3}
              ></textarea>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !tenantId || !amount || !date}
            className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isSubmitting || !tenantId || !amount || !date
                ? `${isDark ? 'bg-gray-600' : 'bg-gray-300'} text-gray-400 cursor-not-allowed`
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Processing...' : 'Record Payment'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PaymentForm;