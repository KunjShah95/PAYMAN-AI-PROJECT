import React, { useState } from 'react';
import AddTransactionForm from './forms/AddTransactionForm';
import DataExport from './utils/DataExport';
import { useTheme } from '../context/ThemeContext';
import { Plus, FileText, CreditCard, ArrowLeft, Wallet, Building2 } from 'lucide-react';
import PaymentForm from './PaymentForm';
import { createRoot } from 'react-dom/client';

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

interface TransactionListProps {
  payments: Payment[];
  onNavigateToPayments?: () => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ payments, onNavigateToPayments }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [localPayments, setLocalPayments] = useState<Payment[]>(payments);

  // Filter payments based on search and status filter
  const filteredPayments = localPayments.filter(payment => {
    const matchesSearch = 
      payment.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.date.includes(searchTerm) ||
      payment.amount.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge style
  const getStatusBadgeClass = (status: Payment['status']) => {
    switch(status) {
      case 'paid':
        return isDark 
          ? 'bg-green-900 text-green-100 border-green-700'
          : 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return isDark
          ? 'bg-yellow-900 text-yellow-100 border-yellow-700'
          : 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'failed':
        return isDark
          ? 'bg-red-900 text-red-100 border-red-700'
          : 'bg-red-100 text-red-800 border-red-300';
      case 'overdue':
        return isDark
          ? 'bg-orange-900 text-orange-100 border-orange-700'
          : 'bg-orange-100 text-orange-800 border-orange-300';
      case 'completed':
        return isDark
          ? 'bg-blue-900 text-blue-100 border-blue-700'
          : 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return isDark
          ? 'bg-gray-800 text-gray-200 border-gray-600'
          : 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Handle adding a new transaction
  const handleAddTransaction = (data: Omit<Payment, 'id' | 'status'>) => {
    try {
      if (!data.tenantId || !data.amount || !data.date || !data.method) {
        console.error('Missing required fields for transaction');
        return;
      }
      
      const newTransaction: Payment = {
        id: `pay${Date.now()}`,
        tenantId: data.tenantId,
        tenantName: data.tenantName,
        amount: data.amount,
        date: data.date,
        status: 'pending',
        method: data.method,
        description: data.description || 'Transaction'
      };
      
      setLocalPayments(prev => [newTransaction, ...prev]);
      setIsAddingTransaction(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  // Handle payment submission
  const handlePaymentSubmit = (payment: Omit<Payment, 'id' | 'status'>) => {
    try {
      if (!payment.tenantId || !payment.amount || !payment.date) {
        console.error('Missing required fields for payment');
        return;
      }
      
      const newPayment: Payment = {
        id: `pay${Date.now()}`,
        tenantId: payment.tenantId,
        tenantName: payment.tenantName,
        amount: payment.amount,
        date: payment.date,
        status: 'completed',
        method: payment.method,
        description: payment.description || `Payment for ${payment.tenantName}`
      };
      
      setLocalPayments(prev => [newPayment, ...prev]);
      setIsAddingPayment(false);
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };

  // Prepare data for export
  const exportData = filteredPayments.map(payment => ({
    Tenant: payment.tenantName,
    Amount: payment.amount,
    Date: formatDate(payment.date),
    Status: payment.status,
    Method: payment.method.replace(/([A-Z])/g, ' $1').trim(),
    Description: payment.description
  }));

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

  if (isAddingPayment) {
    return (
      <div className={`p-6 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Record Payment</h2>
            <button 
              onClick={() => setIsAddingPayment(false)}
              className={`px-3 py-1 rounded ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Cancel
            </button>
          </div>
          <PaymentForm onSubmit={handlePaymentSubmit} />
        </div>
      </div>
    );
  }

  if (isAddingTransaction) {
    return (
      <div className={`p-6 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <AddTransactionForm
          onSubmit={handleAddTransaction}
          onCancel={() => setIsAddingTransaction(false)}
        />
      </div>
    );
  }

  return (
    <div className={`rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            {onNavigateToPayments && (
              <button
                onClick={onNavigateToPayments}
                className={`mr-2 inline-flex items-center p-1.5 rounded-full ${
                  isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title="Go to Payments"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Transactions</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsAddingPayment(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Record Payment
            </button>
            <button
              onClick={() => setIsAddingTransaction(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </button>
            {filteredPayments.length > 0 && (
              <button
                onClick={() => {
                  const modal = document.createElement('div');
                  modal.style.position = 'fixed';
                  modal.style.top = '0';
                  modal.style.left = '0';
                  modal.style.width = '100%';
                  modal.style.height = '100%';
                  modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
                  modal.style.display = 'flex';
                  modal.style.justifyContent = 'center';
                  modal.style.alignItems = 'center';
                  modal.style.zIndex = '1000';
                  
                  const modalContent = document.createElement('div');
                  modalContent.style.padding = '20px';
                  modalContent.style.backgroundColor = isDark ? '#1f2937' : 'white';
                  modalContent.style.borderRadius = '8px';
                  modalContent.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                  modalContent.style.maxWidth = '500px';
                  modalContent.style.width = '100%';
                  
                  modal.appendChild(modalContent);
                  document.body.appendChild(modal);
                  
                  modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                      document.body.removeChild(modal);
                    }
                  });
                  
                  const root = createRoot(modalContent);
                  root.render(
                    <div className="p-4">
                      <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Export Transactions</h3>
                      <DataExport data={exportData} filename="transactions" />
                      <div className="mt-4 text-right">
                        <button 
                          onClick={() => {
                            root.unmount();
                            document.body.removeChild(modal);
                          }}
                          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 ml-2"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  );
                }}
                className={`inline-flex items-center px-4 py-2 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-md`}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export
              </button>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search transactions..."
              className={`w-full p-2 border rounded-md ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="sm:w-1/4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full p-2 border rounded-md ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="overdue">Overdue</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
          <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                Tenant
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                Amount
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                Date
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                Status
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                Method
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                Description
              </th>
              <th className={`px-6 py-3 text-right text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`${isDark ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}`}>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <tr key={payment.id} className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {payment.tenantName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(payment.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className={`${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      {formatDate(payment.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(payment.status)} capitalize`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                    <div className={`${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      {payment.method.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      {payment.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className={`${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'} mr-3`}>
                      View
                    </button>
                    <button className={`${isDark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-900'}`}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className={`px-6 py-4 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No transactions found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList; 