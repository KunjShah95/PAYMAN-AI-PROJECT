import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Building2, Users, DollarSign, FileText, Bell, Settings, BarChart3 } from 'lucide-react';
import { Tenant } from '../services/mockData';

interface PropertyManagerDashboardProps {
  tenants: Tenant[];
  onActionClick: (action: string, data?: any) => void;
}

const PropertyManagerDashboard: React.FC<PropertyManagerDashboardProps> = ({
  tenants,
  onActionClick
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Calculate property manager metrics
  const totalProperties = new Set(tenants.map(t => t.propertyDetails.propertyId)).size;
  const totalTenants = tenants.length;
  const occupancyRate = totalTenants / (totalProperties * 4); // Assuming 4 units per property
  const latePayments = tenants.filter(t => t.status === 'late').length;
  const upcomingLeases = tenants.filter(t => {
    const leaseEnd = new Date(t.leaseEnd);
    const today = new Date();
    const daysUntilExpiry = Math.floor((leaseEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Property Manager Dashboard
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your properties and tenants efficiently
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Total Properties
              </h3>
              <Building2 className="w-6 h-6 text-blue-500" />
            </div>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {totalProperties}
            </p>
            <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Active properties
            </p>
          </div>

          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Total Tenants
              </h3>
              <Users className="w-6 h-6 text-green-500" />
            </div>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {totalTenants}
            </p>
            <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Current tenants
            </p>
          </div>

          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Occupancy Rate
              </h3>
              <BarChart3 className="w-6 h-6 text-purple-500" />
            </div>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {(occupancyRate * 100).toFixed(1)}%
            </p>
            <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Property utilization
            </p>
          </div>

          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Late Payments
              </h3>
              <DollarSign className="w-6 h-6 text-red-500" />
            </div>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {latePayments}
            </p>
            <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Require attention
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={() => onActionClick('manage_tenants')}
            className={`p-6 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow-md transition-colors duration-200`}
          >
            <div className="flex items-center space-x-4">
              <Users className="w-8 h-8 text-blue-500" />
              <div className="text-left">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Manage Tenants
                </h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  View and manage all tenants
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onActionClick('lease_renewals')}
            className={`p-6 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow-md transition-colors duration-200`}
          >
            <div className="flex items-center space-x-4">
              <FileText className="w-8 h-8 text-green-500" />
              <div className="text-left">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Lease Renewals
                </h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {upcomingLeases} leases expiring soon
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onActionClick('maintenance')}
            className={`p-6 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow-md transition-colors duration-200`}
          >
            <div className="flex items-center space-x-4">
              <Building2 className="w-8 h-8 text-purple-500" />
              <div className="text-left">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Maintenance
                </h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Track and manage maintenance requests
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onActionClick('notifications')}
            className={`p-6 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow-md transition-colors duration-200`}
          >
            <div className="flex items-center space-x-4">
              <Bell className="w-8 h-8 text-yellow-500" />
              <div className="text-left">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Notifications
                </h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  View and manage notifications
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onActionClick('reports')}
            className={`p-6 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow-md transition-colors duration-200`}
          >
            <div className="flex items-center space-x-4">
              <BarChart3 className="w-8 h-8 text-indigo-500" />
              <div className="text-left">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Reports
                </h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Generate and view reports
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onActionClick('settings')}
            className={`p-6 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow-md transition-colors duration-200`}
          >
            <div className="flex items-center space-x-4">
              <Settings className="w-8 h-8 text-gray-500" />
              <div className="text-left">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Settings
                </h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage account and preferences
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyManagerDashboard; 