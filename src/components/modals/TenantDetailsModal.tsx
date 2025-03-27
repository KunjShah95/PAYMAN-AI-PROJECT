import React, { useState } from 'react';
import { X, Download, Calendar, DollarSign, Home, FileText, PieChart, History } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Analytics from '../Analytics';

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
  paymentHistory?: {
    onTime: number;
    late: number;
    missed: number;
  };
  documents?: string[];
  notes?: string;
}

interface TenantDetailsModalProps {
  isOpen: boolean;
  tenant: Tenant;
  onClose: () => void;
}

const TenantDetailsModal: React.FC<TenantDetailsModalProps> = ({ isOpen, tenant, onClose }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('overview');
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  const calculateLeaseRemaining = () => {
    const today = new Date();
    const leaseEnd = new Date(tenant.leaseEnd);
    const diffTime = leaseEnd.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    Analytics.trackEvent('tenant_details_tab_change', { tab });
  };

  if (!isOpen) return null;

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className={`p-4 rounded-md ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Email</p>
                  <p className={`${isDark ? 'text-white' : 'text-gray-800'}`}>{tenant.email}</p>
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Phone</p>
                  <p className={`${isDark ? 'text-white' : 'text-gray-800'}`}>{tenant.phone}</p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-md ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Lease Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Unit</p>
                  <p className={`${isDark ? 'text-white' : 'text-gray-800'}`}>{tenant.unit}</p>
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${tenant.status === 'current' 
                      ? isDark ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-800'
                      : tenant.status === 'late' 
                        ? isDark ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'
                        : isDark ? 'bg-yellow-900 text-yellow-100' : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {tenant.status}
                  </span>
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Lease Start Date</p>
                  <p className={`${isDark ? 'text-white' : 'text-gray-800'}`}>{formatDate(tenant.leaseStart)}</p>
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Lease End Date</p>
                  <p className={`${isDark ? 'text-white' : 'text-gray-800'}`}>{formatDate(tenant.leaseEnd)}</p>
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Monthly Rent</p>
                  <p className={`${isDark ? 'text-white' : 'text-gray-800'}`}>{formatCurrency(tenant.rentAmount)}</p>
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Days Remaining</p>
                  <p className={`${isDark ? 'text-white' : 'text-gray-800'}`}>{calculateLeaseRemaining()} days</p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-md ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Payment Summary</h3>
              {tenant.paymentHistory ? (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>On-Time</p>
                    <p className={`text-xl font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      {tenant.paymentHistory.onTime}
                    </p>
                  </div>
                  <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Late</p>
                    <p className={`text-xl font-semibold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      {tenant.paymentHistory.late}
                    </p>
                  </div>
                  <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Missed</p>
                    <p className={`text-xl font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                      {tenant.paymentHistory.missed}
                    </p>
                  </div>
                </div>
              ) : (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No payment history available.
                </p>
              )}
            </div>
            
            {tenant.notes && (
              <div className={`p-4 rounded-md ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Notes</h3>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{tenant.notes}</p>
              </div>
            )}
          </div>
        );
      
      case 'documents':
        return (
          <div>
            <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Documents</h3>
            
            {tenant.documents && tenant.documents.length > 0 ? (
              <ul className={`divide-y rounded-md overflow-hidden ${isDark ? 'divide-gray-700 bg-gray-700' : 'divide-gray-200 bg-gray-100'}`}>
                {tenant.documents.map((doc, index) => (
                  <li key={index} className={`flex items-center justify-between py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-3" />
                      <span>{doc}</span>
                    </div>
                    <button className={`inline-flex items-center ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
                      <Download className="h-4 w-4 mr-1" />
                      <span>Download</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={`p-6 text-center rounded-md ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No documents available.</p>
              </div>
            )}
            
            <div className="mt-6">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Upload Document
              </button>
            </div>
          </div>
        );
      
      case 'history':
        return (
          <div>
            <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Payment History</h3>
            
            <div className={`p-4 mb-6 rounded-md ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h4 className={`text-md font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Payment Summary</h4>
              
              {tenant.paymentHistory ? (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{
                        width: `${(tenant.paymentHistory.onTime / (tenant.paymentHistory.onTime + tenant.paymentHistory.late + tenant.paymentHistory.missed)) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      {Math.round((tenant.paymentHistory.onTime / (tenant.paymentHistory.onTime + tenant.paymentHistory.late + tenant.paymentHistory.missed)) * 100)}% on-time payments
                    </span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      Total Payments: {tenant.paymentHistory.onTime + tenant.paymentHistory.late + tenant.paymentHistory.missed}
                    </span>
                  </div>
                </div>
              ) : (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No payment history available.
                </p>
              )}
            </div>
            
            <h4 className={`text-md font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Recent Transactions</h4>
            
            {/* This would be populated with actual transaction data in a real app */}
            <div className={`rounded-md overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={isDark ? 'bg-gray-800' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Date</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Amount</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Status</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Method</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  <tr>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Oct 1, 2023</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(tenant.rentAmount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Paid
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Credit Card</td>
                  </tr>
                  <tr>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Sep 1, 2023</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(tenant.rentAmount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Paid
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Bank Transfer</td>
                  </tr>
                  <tr>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Aug 1, 2023</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(tenant.rentAmount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Late
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Credit Card</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className={`relative w-full max-w-4xl rounded-lg shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center mb-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${isDark ? 'bg-blue-600' : 'bg-blue-100'}`}>
            <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-blue-700'}`}>
              {tenant.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {tenant.name}
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Tenant ID: {tenant.id}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex space-x-1 border-b">
            <button
              className={`py-2 px-4 ${
                activeTab === 'overview'
                  ? isDark
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-blue-600 border-b-2 border-blue-500'
                  : isDark
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabChange('overview')}
            >
              <div className="flex items-center">
                <Home className="h-4 w-4 mr-2" />
                <span>Overview</span>
              </div>
            </button>
            <button
              className={`py-2 px-4 ${
                activeTab === 'documents'
                  ? isDark
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-blue-600 border-b-2 border-blue-500'
                  : isDark
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabChange('documents')}
            >
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                <span>Documents</span>
              </div>
            </button>
            <button
              className={`py-2 px-4 ${
                activeTab === 'history'
                  ? isDark
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-blue-600 border-b-2 border-blue-500'
                  : isDark
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabChange('history')}
            >
              <div className="flex items-center">
                <History className="h-4 w-4 mr-2" />
                <span>Payment History</span>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-4">
          {renderTab()}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 border rounded-md ${
              isDark
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenantDetailsModal; 