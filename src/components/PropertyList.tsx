import React, { useState, useEffect } from 'react';
import { Search, Plus, Building2, ExternalLink, Home, ArrowDownUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { properties, tenants } from '../services/mockData';
import PropertyAllocationEngine from './allocation/PropertyAllocationEngine';
import Analytics from './Analytics';
import { useSearchParams } from 'react-router-dom';

interface Property {
  id: string;
  name: string;
  address: string;
  type: 'apartment' | 'house' | 'condo' | 'townhouse';
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  rentAmount: number;
  availableFrom: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  features: string[];
  image?: string;
}

// Mapping tenant status from mock data to the format expected by the allocation engine
interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  currentUnit?: string;
  desiredMoveInDate?: string;
  preferredLocation?: string;
  minBedrooms?: number;
  maxRent?: number;
  preferences?: string[];
  status: 'active' | 'inactive' | 'pending';
  matchScore?: number;
}

// Convert existing tenants to the format expected by the allocation engine
const mappedTenants = (): Tenant[] => {
  return tenants.map((tenant: any) => ({
    id: tenant.id,
    name: tenant.name,
    email: tenant.email,
    phone: tenant.phone || '555-555-5555',
    currentUnit: tenant.unit,
    status: tenant.status === 'current' ? 'active' as const : 
            tenant.status === 'notice' ? 'inactive' as const : 'pending' as const,
    minBedrooms: tenant.minBedrooms || 1,
    maxRent: tenant.maxRent || 5000,
    preferences: tenant.preferences || ['parking', 'pets allowed', 'washer/dryer', 'balcony'],
    desiredMoveInDate: tenant.leaseStart || new Date().toISOString().split('T')[0],
    preferredLocation: tenant.property?.address || undefined
  }));
};

// Convert properties to match our interface
const mappedProperties = (): Property[] => {
  return properties.map((prop: any): Property => ({
    id: prop.id,
    name: prop.name,
    address: prop.address,
    type: prop.type as Property['type'],
    bedrooms: prop.units || 1,
    bathrooms: 1, // Default to 1 bathroom since not provided in mock data
    squareFeet: 800, // Default value since not provided in mock data
    rentAmount: prop.monthlyRevenue / (prop.units || 1),
    availableFrom: new Date().toISOString().split('T')[0], // Default to today
    status: prop.occupancy >= 1 ? 'occupied' : 'available',
    features: ['parking', 'pets allowed', 'washer/dryer', 'balcony', 'gym', 'pool'].slice(0, 3) // Default features
  }));
};

function PropertyList() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [propertyList, setPropertyList] = useState<Property[]>(mappedProperties());
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'allocation'>(() => {
    const mode = searchParams.get('view');
    return mode === 'allocation' ? 'allocation' : mode === 'list' ? 'list' : 'grid';
  });
  const [tenantList, setTenantList] = useState<Tenant[]>(mappedTenants());

  // Track component mount
  useEffect(() => {
    Analytics.trackPageView('property_list_view');
  }, []);

  const filteredProperties = propertyList.filter(property => {
    const matchesSearch = 
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'available':
        return isDark 
          ? 'bg-green-900 text-green-100 border-green-700'
          : 'bg-green-100 text-green-800 border-green-300';
      case 'occupied':
        return isDark
          ? 'bg-blue-900 text-blue-100 border-blue-700'
          : 'bg-blue-100 text-blue-800 border-blue-300';
      case 'maintenance':
        return isDark
          ? 'bg-yellow-900 text-yellow-100 border-yellow-700'
          : 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'reserved':
        return isDark
          ? 'bg-purple-900 text-purple-100 border-purple-700'
          : 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return isDark
          ? 'bg-gray-800 text-gray-200 border-gray-600'
          : 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handlePropertyAllocation = (allocation: { propertyId: string; tenantId: string; score: number }) => {
    // In a real app, this would make an API call to update the property and tenant records
    console.log('Property allocated:', allocation);
    
    // Update the local state to mark the property as occupied
    setPropertyList(prev => 
      prev.map(property => 
        property.id === allocation.propertyId 
          ? { ...property, status: 'occupied' } 
          : property
      )
    );
    
    // Show a success notification in a real app
    alert(`Property allocated to tenant with ${allocation.score}% match score`);
    
    // Track the event
    Analytics.trackEvent('property_allocated', {
      propertyId: allocation.propertyId,
      tenantId: allocation.tenantId,
      matchScore: allocation.score
    });
  };

  return (
    <div className={`rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Properties</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`inline-flex items-center px-3 py-1.5 rounded-md ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Home className="h-4 w-4 mr-1" />
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center px-3 py-1.5 rounded-md ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ArrowDownUp className="h-4 w-4 mr-1" />
              List
            </button>
            <button
              onClick={() => setViewMode('allocation')}
              className={`inline-flex items-center px-3 py-1.5 rounded-md ${
                viewMode === 'allocation'
                  ? 'bg-blue-600 text-white'
                  : isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Building2 className="h-4 w-4 mr-1" />
              Allocation
            </button>
            <button
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </button>
          </div>
        </div>
        
        {viewMode !== 'allocation' && (
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <input
                type="text"
                className={`block w-full pl-10 pr-3 py-2 border rounded-md ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="sm:w-1/4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full py-2 px-3 border rounded-md ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                <option value="all">All Properties</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Under Maintenance</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProperties.length > 0 ? (
              filteredProperties.map(property => (
                <div 
                  key={property.id} 
                  className={`rounded-lg overflow-hidden shadow ${isDark ? 'bg-gray-700' : 'bg-white'}`}
                >
                  <div 
                    className="h-48 bg-cover bg-center" 
                    style={{ 
                      backgroundImage: property.image 
                        ? `url(${property.image})` 
                        : `url(https://via.placeholder.com/400x200?text=${encodeURIComponent(property.name)})` 
                    }}
                  ></div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {property.name}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${getStatusBadgeClass(property.status)}`}>
                        {property.status}
                      </span>
                    </div>
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {property.address}
                    </p>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {property.bedrooms} bd | {property.bathrooms} ba | {property.squareFeet} sqft
                      </span>
                    </div>
                    <div className={`text-lg font-bold mb-3 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      {formatCurrency(property.rentAmount)}/month
                    </div>
                    {property.status === 'available' && (
                      <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                        Available from: {formatDate(property.availableFrom)}
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {property.features.slice(0, 2).map((feature, index) => (
                          <span 
                            key={index}
                            className={`inline-block px-2 py-1 text-xs rounded-md ${
                              isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {feature}
                          </span>
                        ))}
                        {property.features.length > 2 && (
                          <span className={`inline-block px-2 py-1 text-xs rounded-md ${
                            isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                          }`}>
                            +{property.features.length - 2} more
                          </span>
                        )}
                      </div>
                      <button className={`inline-flex items-center ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No properties found matching your criteria.
                </p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Property
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Details
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Rent
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-right text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDark ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}`}>
                {filteredProperties.length > 0 ? (
                  filteredProperties.map((property) => (
                    <tr key={property.id} className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {property.name}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {property.address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          {property.type} | {property.bedrooms}bd | {property.bathrooms}ba
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {property.squareFeet} sqft
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(property.rentAmount)}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          per month
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${getStatusBadgeClass(property.status)}`}>
                          {property.status}
                        </span>
                        {property.status === 'available' && (
                          <div className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            From: {formatDate(property.availableFrom)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className={`${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'} mr-3`}>
                          View
                        </button>
                        <button className={`${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-900'}`}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className={`px-6 py-4 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      No properties found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'allocation' && (
          <PropertyAllocationEngine 
            properties={propertyList} 
            tenants={tenantList}
            onAllocate={handlePropertyAllocation}
          />
        )}
      </div>
    </div>
  );
}

export default PropertyList; 