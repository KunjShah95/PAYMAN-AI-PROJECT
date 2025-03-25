import React, { useState } from 'react';
import { DollarSign, AlertCircle, CheckCircle2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import IncomeExpensesChart from './charts/IncomeExpensesChart';
import OccupancyChart from './charts/OccupancyChart';
import RevenueTrendChart from './charts/RevenueTrendChart';
import { useTheme } from '../context/ThemeContext';

interface PaymentStatus {
  id: string;
  tenant: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'overdue' | 'pending';
}

function Dashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [currentChart, setCurrentChart] = useState(0);
  
  const charts = [
    { component: <IncomeExpensesChart height={400} />, title: "Income vs. Expenses" },
    { component: <OccupancyChart height={400} />, title: "Property Occupancy" },
    { component: <RevenueTrendChart height={400} />, title: "Revenue Trend" }
  ];
  
  const nextChart = () => {
    setCurrentChart((prev) => (prev + 1) % charts.length);
  };
  
  const prevChart = () => {
    setCurrentChart((prev) => (prev - 1 + charts.length) % charts.length);
  };

  const recentPayments: PaymentStatus[] = [
    { id: '1', tenant: 'John Doe', amount: 1200, dueDate: '2024-03-15', status: 'paid' },
    { id: '2', tenant: 'Jane Smith', amount: 1500, dueDate: '2024-03-20', status: 'overdue' },
    { id: '3', tenant: 'Mike Johnson', amount: 950, dueDate: '2024-03-25', status: 'pending' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return isDark ? 'text-green-400 bg-green-900 bg-opacity-30' : 'text-green-600 bg-green-50';
      case 'overdue':
        return isDark ? 'text-red-400 bg-red-900 bg-opacity-30' : 'text-red-600 bg-red-50';
      case 'pending':
        return isDark ? 'text-yellow-300 bg-yellow-900 bg-opacity-30' : 'text-yellow-600 bg-yellow-50';
      default:
        return isDark ? 'text-gray-300 bg-gray-700' : 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />;
      case 'overdue':
        return <AlertCircle className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />;
      case 'pending':
        return <Clock className={`w-5 h-5 ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`} />;
      default:
        return null;
    }
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
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>$3,650</p>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>This month</p>
        </div>

        <div className={`p-6 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Pending Payments</h3>
            <Clock className={`w-6 h-6 ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`} />
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>$950</p>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>1 payment pending</p>
        </div>

        <div className={`p-6 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Overdue Payments</h3>
            <AlertCircle className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>$1,500</p>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>1 payment overdue</p>
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
        <div className="flex justify-center mt-4">
          {charts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentChart(index)}
              className={`mx-1 w-3 h-3 rounded-full ${
                index === currentChart 
                  ? (isDark ? 'bg-blue-500' : 'bg-blue-600') 
                  : (isDark ? 'bg-gray-600' : 'bg-gray-300')
              }`}
            />
          ))}
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className={`rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Recent Payments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Tenant</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Amount</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Due Date</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Status</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
              {recentPayments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{payment.tenant}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>${payment.amount.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(payment.dueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      <span className="ml-2 capitalize">{payment.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className={`font-medium ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-y-6 gap-x-4">
          <div>
            <h3 className={`font-semibold text-lg mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>About</h3>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Payman AI helps property managers automate rent collection and manage tenants efficiently.
            </p>
          </div>
          
          <div>
            <h3 className={`font-semibold text-lg mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Resources</h3>
            <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li><a href="#" className="hover:underline">Documentation</a></li>
              <li><a href="#" className="hover:underline">API Reference</a></li>
              <li><a href="#" className="hover:underline">Help Center</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className={`font-semibold text-lg mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Legal</h3>
            <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li><a href="#" className="hover:underline">Privacy Policy</a></li>
              <li><a href="#" className="hover:underline">Terms of Service</a></li>
              <li><a href="#" className="hover:underline">Cookie Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className={`font-semibold text-lg mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className={`${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className={`${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className={`${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className={`${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className={`mt-8 pt-8 border-t ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">© 2024 Payman AI. Made with ❤️ by Kunj Shah. All rights reserved.</p>
            <p className="text-sm mt-2 md:mt-0">Empowering property managers everywhere</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;