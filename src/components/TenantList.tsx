import React, { useState, useEffect } from 'react';
import { Search, Plus, Mail, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { tenants } from '../services/mockData';
import TenantDetailsModal from './modals/TenantDetailsModal';
import TenantMessaging from './messaging/TenantMessaging';
import Analytics from './Analytics';
import StatusBadge from './utils/StatusBadge';

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  unit: string;
  property: string;
  status: 'current' | 'late' | 'pending' | 'notice';
  leaseStart: string;
  leaseEnd: string;
  rentAmount: number;
}

const TenantList: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tenantList, setTenantList] = useState<Tenant[]>(tenants);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isMessagingModalOpen, setIsMessagingModalOpen] = useState(false);

  // Track component mount
  useEffect(() => {
    Analytics.trackPageView('tenant_list_view');
  }, []);

  // Filter tenants based on search term and status filter
  const filteredTenants = tenantList.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.unit.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleOpenDetails = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsDetailsModalOpen(true);
    
    // Track event
    Analytics.trackEvent('tenant_details_viewed', {
      tenantId: tenant.id,
      tenantName: tenant.name
    });
  };

  const handleOpenMessaging = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsMessagingModalOpen(true);
    
    // Track event
    Analytics.trackEvent('tenant_messaging_opened', {
      tenantId: tenant.id,
      tenantName: tenant.name
    });
  };

  const handleSendMessage = (message: string, attachments: File[], tenant: Tenant) => {
    console.log('Sending message to tenant:', tenant.name);
    console.log('Message:', message);
    console.log('Attachments:', attachments);
    
    // In a real application, this would be an API call
    // For now, we'll just close the modal
    setIsMessagingModalOpen(false);
    
    // Track event with more details
    Analytics.trackEvent('tenant_message_sent', {
      tenantId: tenant.id,
      messageLength: message.length,
      attachmentsCount: attachments.length
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'current':
        return isDark 
          ? 'bg-green-900 text-green-100 border-green-700'
          : 'bg-green-100 text-green-800 border-green-300';
      case 'late':
        return isDark
          ? 'bg-red-900 text-red-100 border-red-700'
          : 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
        return isDark
          ? 'bg-yellow-900 text-yellow-100 border-yellow-700'
          : 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'notice':
        return isDark
          ? 'bg-blue-900 text-blue-100 border-blue-700'
          : 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return isDark
          ? 'bg-gray-800 text-gray-200 border-gray-600'
          : 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className={`rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Tenants</h2>
          <button
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Tenant
          </button>
        </div>
        
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
              placeholder="Search tenants..."
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
              <option value="all">All Tenants</option>
              <option value="current">Current</option>
              <option value="late">Late Payment</option>
              <option value="pending">Pending</option>
              <option value="notice">Notice Given</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
          <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                Tenant
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                Unit
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                Lease Period
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
            {filteredTenants.length > 0 ? (
              filteredTenants.map((tenant) => (
                <tr key={tenant.id} className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {tenant.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {tenant.name}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {tenant.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Unit {tenant.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      {new Date(tenant.leaseStart).toLocaleDateString()} - {new Date(tenant.leaseEnd).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${getStatusBadgeClass(tenant.status)}`}>
                      {tenant.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleOpenMessaging(tenant)}
                      className={`${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'} mr-3`}
                    >
                      <Mail className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleOpenDetails(tenant)}
                      className={`${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-900'}`}
                    >
                      <ExternalLink className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className={`px-6 py-4 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No tenants found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {selectedTenant && (
        <>
          <TenantDetailsModal 
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            tenant={selectedTenant} // Removed default values for missing properties
          />
          
          <TenantMessaging
            isOpen={isMessagingModalOpen}
            onClose={() => setIsMessagingModalOpen(false)}
            tenant={selectedTenant}
            onSendMessage={handleSendMessage}
          />
        </>
      )}
    </div>
  );
};

export default TenantList; 