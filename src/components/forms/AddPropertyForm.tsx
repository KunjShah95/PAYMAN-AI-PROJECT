import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface AddPropertyFormProps {
  onSubmit: (data: PropertyFormData) => void;
  onCancel: () => void;
}

export interface PropertyFormData {
  name: string;
  address: string;
  units: number;
  revenue: number;
  occupancy: number;
}

const AddPropertyForm: React.FC<AddPropertyFormProps> = ({ onSubmit, onCancel }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    address: '',
    units: 1,
    revenue: 0,
    occupancy: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'units' || name === 'revenue' ? parseFloat(value) : 
              name === 'occupancy' ? parseFloat(value) / 100 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div>
      <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>Add New Property</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className={`block mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Property Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
            required
          />
        </div>
        
        <div>
          <label htmlFor="address" className={`block mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Address</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="units" className={`block mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Number of Units</label>
            <input
              type="number"
              id="units"
              name="units"
              min="1"
              value={formData.units}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
              required
            />
          </div>
          
          <div>
            <label htmlFor="revenue" className={`block mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Monthly Revenue ($)</label>
            <input
              type="number"
              id="revenue"
              name="revenue"
              min="0"
              step="100"
              value={formData.revenue}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
              required
            />
          </div>
          
          <div>
            <label htmlFor="occupancy" className={`block mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Occupancy (%)</label>
            <input
              type="number"
              id="occupancy"
              name="occupancy"
              min="0"
              max="100"
              value={formData.occupancy * 100}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
              required
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 rounded ${isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Property
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPropertyForm; 