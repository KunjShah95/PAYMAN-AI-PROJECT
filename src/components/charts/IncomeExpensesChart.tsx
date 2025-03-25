import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

interface ChartDataItem {
  month: string;
  income: number;
  expenses: number;
}

// Sample data for income vs expenses
const data: ChartDataItem[] = [
  { month: 'Jan', income: 42000, expenses: 28500 },
  { month: 'Feb', income: 43500, expenses: 29200 },
  { month: 'Mar', income: 44200, expenses: 28900 },
  { month: 'Apr', income: 45000, expenses: 30100 },
  { month: 'May', income: 45500, expenses: 29800 },
  { month: 'Jun', income: 46200, expenses: 31200 },
  { month: 'Jul', income: 45800, expenses: 30500 },
  { month: 'Aug', income: 46500, expenses: 32000 },
  { month: 'Sep', income: 47000, expenses: 31500 },
  { month: 'Oct', income: 48200, expenses: 32800 },
  { month: 'Nov', income: 49000, expenses: 33500 },
  { month: 'Dec', income: 49500, expenses: 34000 },
];

interface IncomeExpensesChartProps {
  title?: string;
  height?: number;
}

const IncomeExpensesChart: React.FC<IncomeExpensesChartProps> = ({ 
  title = 'Monthly Income vs. Expenses', 
  height = 300 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Custom tooltip formatter
  const customFormatter = (value: number | string) => {
    if (typeof value === 'number') {
      return [`$${value.toLocaleString()}`, undefined];
    }
    return [value.toString(), undefined];
  };

  // Custom label formatter
  const labelFormatter = (label: string) => `Month: ${label}`;

  return (
    <div className={`p-4 rounded-lg shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#4b5563' : '#e5e7eb'} />
          <XAxis dataKey="month" tick={{ fill: isDark ? '#d1d5db' : '#4b5563' }} />
          <YAxis tick={{ fill: isDark ? '#d1d5db' : '#4b5563' }} />
          <Tooltip 
            formatter={customFormatter}
            labelFormatter={labelFormatter}
            contentStyle={{ 
              backgroundColor: isDark ? '#1f2937' : '#fff',
              borderColor: isDark ? '#4b5563' : '#e5e7eb',
              color: isDark ? '#fff' : '#000'
            }}
          />
          <Legend wrapperStyle={{ color: isDark ? '#d1d5db' : '#4b5563' }} />
          <Bar dataKey="income" name="Income" fill="#4ade80" />
          <Bar dataKey="expenses" name="Expenses" fill="#f87171" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeExpensesChart; 