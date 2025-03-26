import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { DollarSign, Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

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

interface DashboardProps {
  payments: Payment[];
}

function Dashboard({ payments }: DashboardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [currentChart, setCurrentChart] = React.useState(0);

  // Calculate totals from payments
  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const overduePayments = payments.filter(p => p.status === 'overdue').length;

  const charts = [
    {
      title: 'Revenue Overview',
      component: (
        <div className="h-full flex items-center justify-center">
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Revenue chart will be displayed here
          </p>
        </div>
      )
    },
    {
      title: 'Payment Methods',
      component: (
        <div className="h-full flex items-center justify-center">
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Payment methods chart will be displayed here
          </p>
        </div>
      )
    }
  ];

  const nextChart = () => {
    setCurrentChart((prev) => (prev + 1) % charts.length);
  };

  const prevChart = () => {
    setCurrentChart((prev) => (prev - 1 + charts.length) % charts.length);
  };

  return (
    <div className="space-y-6">
      <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-6 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Total Revenue</h3>
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${totalRevenue.toFixed(2)}</p>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>This month</p>
        </div>

        <div className={`p-6 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Pending Payments</h3>
            <Clock className={`w-6 h-6 ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`} />
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{pendingPayments}</p>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>payments pending</p>
        </div>

        <div className={`p-6 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Overdue Payments</h3>
            <AlertCircle className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{overduePayments}</p>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>payments overdue</p>
        </div>
      </div>
      
      {/* Chart Navigator */}
      <div className={`rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'} p-4`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {charts[currentChart].title}
          </h2>
          <div className="flex space-x-2">
            <button 
              onClick={prevChart}
              className={`p-2 rounded-full ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <ChevronLeft className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-700'}`} />
            </button>
            <button 
              onClick={nextChart}
              className={`p-2 rounded-full ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <ChevronRight className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-700'}`} />
            </button>
          </div>
        </div>
        <div className="h-[400px]">
          {charts[currentChart].component}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;