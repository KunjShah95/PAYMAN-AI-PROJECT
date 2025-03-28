import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { DollarSign, TrendingUp, Calendar, Building2, ArrowUp, ArrowDown } from 'lucide-react';
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

interface RevenueData {
  totalRevenue: number;
  monthlyGrowth: number;
  averageRent: number;
  occupancyRate: number;
  pendingPayments: number;
}

const Revenue: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');

  // Mock data - in a real app, this would come from an API
  const revenueData: RevenueData = {
    totalRevenue: 125000,
    monthlyGrowth: 8.5,
    averageRent: 2500,
    occupancyRate: 95,
    pendingPayments: 15000,
  };

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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const handleTimeRangeChange = (range: 'month' | 'quarter' | 'year') => {
    setTimeRange(range);
    // In a real app, this would fetch new data based on the selected time range
  };

  const handlePropertyChange = (property: string) => {
    setSelectedProperty(property);
    // In a real app, this would fetch new data based on the selected property
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Revenue Dashboard
          </h1>
          <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Overview of your property revenue and financial metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => handleTimeRangeChange('month')}
              className={`px-4 py-2 rounded-l-md ${
                timeRange === 'month'
                  ? isDark
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600 text-white'
                  : isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-white hover:bg-gray-50 text-gray-700'
              }`}
            >
              <Calendar className="w-5 h-5 inline-block mr-2" />
              Month
            </button>
            <button
              onClick={() => handleTimeRangeChange('quarter')}
              className={`px-4 py-2 ${
                timeRange === 'quarter'
                  ? isDark
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600 text-white'
                  : isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-white hover:bg-gray-50 text-gray-700'
              }`}
            >
              Quarter
            </button>
            <button
              onClick={() => handleTimeRangeChange('year')}
              className={`px-4 py-2 rounded-r-md ${
                timeRange === 'year'
                  ? isDark
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600 text-white'
                  : isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-white hover:bg-gray-50 text-gray-700'
              }`}
            >
              Year
            </button>
          </div>
          <select
            value={selectedProperty}
            onChange={(e) => handlePropertyChange(e.target.value)}
            className={`px-4 py-2 rounded-md ${
              isDark
                ? 'bg-gray-700 text-white border-gray-600'
                : 'bg-white text-gray-700 border-gray-300'
            } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="all">All Properties</option>
            <option value="sunset">Sunset Apartments</option>
            <option value="mountain">Mountain View Complex</option>
            <option value="riverside">Riverside Properties</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Revenue</p>
              <h3 className={`text-xl font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(revenueData.totalRevenue)}
              </h3>
            </div>
            <div className={`p-2 rounded-full ${isDark ? 'bg-blue-900 bg-opacity-50' : 'bg-blue-100'}`}>
              <DollarSign className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <TrendingUp className={`w-4 h-4 ${revenueData.monthlyGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`ml-1 text-sm ${revenueData.monthlyGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {revenueData.monthlyGrowth >= 0 ? '+' : ''}{revenueData.monthlyGrowth}% from last month
            </span>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Average Rent</p>
              <h3 className={`text-xl font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(revenueData.averageRent)}
              </h3>
            </div>
            <div className={`p-2 rounded-full ${isDark ? 'bg-green-900 bg-opacity-50' : 'bg-green-100'}`}>
              <Building2 className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <ArrowUp className="w-4 h-4 text-green-500" />
            <span className="ml-1 text-sm text-green-500">+2.5% from last month</span>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Occupancy Rate</p>
              <h3 className={`text-xl font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatPercentage(revenueData.occupancyRate)}
              </h3>
            </div>
            <div className={`p-2 rounded-full ${isDark ? 'bg-yellow-900 bg-opacity-50' : 'bg-yellow-100'}`}>
              <TrendingUp className={`w-6 h-6 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <ArrowUp className="w-4 h-4 text-green-500" />
            <span className="ml-1 text-sm text-green-500">+1.2% from last month</span>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pending Payments</p>
              <h3 className={`text-xl font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(revenueData.pendingPayments)}
              </h3>
            </div>
            <div className={`p-2 rounded-full ${isDark ? 'bg-red-900 bg-opacity-50' : 'bg-red-100'}`}>
              <DollarSign className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <ArrowDown className="w-4 h-4 text-red-500" />
            <span className="ml-1 text-sm text-red-500">-3.1% from last month</span>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Revenue Overview
        </h2>
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Property Performance */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Property Performance
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`px-4 py-2 text-left text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Property
                </th>
                <th className={`px-4 py-2 text-left text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Revenue
                </th>
                <th className={`px-4 py-2 text-left text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Occupancy
                </th>
                <th className={`px-4 py-2 text-left text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Growth
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <td className={`px-4 py-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Sunset Apartments</td>
                <td className={`px-4 py-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(45000)}</td>
                <td className={`px-4 py-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>98%</td>
                <td className="px-4 py-2 text-green-500">+5.2%</td>
              </tr>
              <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <td className={`px-4 py-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Mountain View Complex</td>
                <td className={`px-4 py-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(38000)}</td>
                <td className={`px-4 py-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>95%</td>
                <td className="px-4 py-2 text-green-500">+3.8%</td>
              </tr>
              <tr>
                <td className={`px-4 py-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Riverside Properties</td>
                <td className={`px-4 py-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(42000)}</td>
                <td className={`px-4 py-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>92%</td>
                <td className="px-4 py-2 text-red-500">-1.2%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Revenue; 