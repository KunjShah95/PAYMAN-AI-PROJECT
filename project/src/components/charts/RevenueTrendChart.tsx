import React from 'react';
import { 
  LineChart, 
  Line, 
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
  actual: number;
  projected: number;
}

// Sample data for revenue trends
const data: ChartDataItem[] = [
  { month: 'Jan', actual: 42000, projected: 40000 },
  { month: 'Feb', actual: 43500, projected: 41000 },
  { month: 'Mar', actual: 44200, projected: 42000 },
  { month: 'Apr', actual: 45000, projected: 43000 },
  { month: 'May', actual: 45500, projected: 44000 },
  { month: 'Jun', actual: 46200, projected: 45000 },
  { month: 'Jul', actual: 45800, projected: 46000 },
  { month: 'Aug', actual: 46500, projected: 47000 },
  { month: 'Sep', actual: 47000, projected: 48000 },
  { month: 'Oct', actual: 48200, projected: 49000 },
  { month: 'Nov', actual: 49000, projected: 50000 },
  { month: 'Dec', actual: 49500, projected: 51000 },
];

interface RevenueTrendChartProps {
  title?: string;
  height?: number;
}

const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ 
  title = 'Revenue Trend', 
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
        <LineChart
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
          <Line 
            type="monotone" 
            dataKey="actual" 
            name="Actual Revenue" 
            stroke="#3b82f6" 
            activeDot={{ r: 8 }} 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="projected" 
            name="Projected Revenue" 
            stroke={isDark ? '#9ca3af' : '#6b7280'} 
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueTrendChart; 