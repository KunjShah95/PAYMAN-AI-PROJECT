import React, { useState } from 'react';
import { Building, Bed, Check, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { properties } from '../services/mockData';
import AddPropertyForm from './forms/AddPropertyForm';

function PropertyList() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isAddingProperty, setIsAddingProperty] = useState(false);

  const handleAddProperty = (propertyData: any) => {
    console.log('New property data:', propertyData);
    // In a real app, this would call an API to save the property data
    setIsAddingProperty(false);
  };

  if (isAddingProperty) {
    return (
      <div className={`p-6 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <AddPropertyForm 
          onSubmit={handleAddProperty} 
          onCancel={() => setIsAddingProperty(false)} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Properties</h1>
        <button
          onClick={() => setIsAddingProperty(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Property
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map((property) => (
          <div key={property.id} className={`p-4 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <Building className={`w-6 h-6 mr-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{property.name}</h3>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                property.occupancy >= 0.9 
                  ? isDark ? 'bg-green-900 bg-opacity-30 text-green-400' : 'bg-green-100 text-green-800'
                  : property.occupancy >= 0.7
                    ? isDark ? 'bg-yellow-900 bg-opacity-30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                    : isDark ? 'bg-red-900 bg-opacity-30 text-red-400' : 'bg-red-100 text-red-800'
              }`}>
                {Math.round(property.occupancy * 100)}% Occupied
              </span>
            </div>
            
            <div className={`mt-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <p>{property.address}</p>
              <div className="flex items-center mt-2">
                <Bed className="w-4 h-4 mr-1" />
                <span>{property.units} Units</span>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between">
              <div className={`${isDark ? 'text-white' : 'text-gray-800'}`}>
                <div className="text-lg font-semibold">${property.monthlyRevenue.toLocaleString()}</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Monthly Revenue</div>
              </div>
              <button className={`text-sm font-medium ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PropertyList; 