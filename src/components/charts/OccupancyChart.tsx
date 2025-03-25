import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, PieLabelRenderProps } from 'recharts';
import { properties } from '../../services/mockData';
import { useTheme } from '../../context/ThemeContext';

interface ChartDataItem {
  name: string;
  value: number;
}

// Prepare the data from properties
const prepareData = (): ChartDataItem[] => {
  const occupied = properties.reduce((total, property) => {
    return total + Math.floor(property.units * property.occupancy);
  }, 0);
  
  const vacant = properties.reduce((total, property) => {
    return total + Math.floor(property.units * (1 - property.occupancy));
  }, 0);
  
  return [
    { name: 'Occupied', value: occupied },
    { name: 'Vacant', value: vacant },
  ];
};

const COLORS = ['#4ade80', '#f87171'];

interface OccupancyChartProps {
  title?: string;
  height?: number;
}

const OccupancyChart: React.FC<OccupancyChartProps> = ({ 
  title = 'Property Occupancy', 
  height = 300 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const data = prepareData();
  const totalUnits = data.reduce((sum, entry) => sum + entry.value, 0);
  const occupancyRate = totalUnits > 0 ? (data[0].value / totalUnits * 100) : 0;
  
  // Custom label renderer with proper type casting
  const renderCustomizedLabel = (props: PieLabelRenderProps) => {
    const { name, percent } = props;
    return `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`;
  };

  return (
    <div className={`p-4 rounded-lg shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>{title}</h3>
      <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
        {data[0].value} out of {totalUnits} units occupied ({occupancyRate.toFixed(1)}%)
      </p>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            label={renderCustomizedLabel}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value} units`, undefined]} 
            contentStyle={{ 
              backgroundColor: isDark ? '#1f2937' : '#fff',
              borderColor: isDark ? '#4b5563' : '#e5e7eb',
              color: isDark ? '#fff' : '#000'
            }}
          />
          <Legend wrapperStyle={{ color: isDark ? '#d1d5db' : '#4b5563' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OccupancyChart; 