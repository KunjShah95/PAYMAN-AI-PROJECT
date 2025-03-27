import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { DollarSign, Clock, AlertCircle, ChevronLeft, ChevronRight, Users, Building2, X } from 'lucide-react';
import HealthScoreModule from './HealthScoreModule';
import ReconciliationEngine from './ReconciliationEngine';
import NotificationSystem from './NotificationSystem';
import Analytics from './Analytics';
import { useNavigate } from 'react-router-dom';

// Local interfaces
interface DashboardPayment {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  date: string;
  method: 'creditCard' | 'bankTransfer' | 'check' | 'cash';
  description: string;
  status: 'pending' | 'failed' | 'overdue' | 'paid';
}

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

interface Property {
  id: string;
  name: string;
  address: string;
  units: number;
  maintenanceRequests?: any[];
}

interface DashboardProps {
  payments: DashboardPayment[];
}

function Dashboard({ payments }: DashboardProps) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [currentChart, setCurrentChart] = useState(0);
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  
  // Mock tenant data for HealthScoreModule and ReconciliationEngine
  const mockTenant: Tenant = {
    id: 'tenant1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    unit: '101',
    property: 'Sunrise Apartments',
    status: 'current',
    leaseStart: '2023-01-01',
    leaseEnd: '2024-01-01',
    rentAmount: 1200
  };
  
  const [mockPayments, setMockPayments] = useState<DashboardPayment[]>([
    {
      id: 'pay1',
      tenantId: 'tenant1',
      tenantName: 'John Smith',
      amount: 1200,
      date: '2023-08-02',
      status: 'paid',
      method: 'bankTransfer',
      description: 'August 2023 Rent'
    },
    {
      id: 'pay2',
      tenantId: 'tenant1',
      tenantName: 'John Smith',
      amount: 1200,
      date: '2023-09-01',
      status: 'paid',
      method: 'creditCard',
      description: 'September 2023 Rent'
    },
    {
      id: 'pay3',
      tenantId: 'tenant1',
      tenantName: 'John Smith',
      amount: 1200,
      date: '2023-10-01',
      status: 'paid',
      method: 'creditCard',
      description: 'October 2023 Rent'
    },
    {
      id: 'pay4',
      tenantId: 'tenant1',
      tenantName: 'John Smith',
      amount: 1200,
      date: '2023-11-01',
      status: 'paid',
      method: 'creditCard',
      description: 'November 2023 Rent'
    },
    {
      id: 'pay5',
      tenantId: 'tenant1',
      tenantName: 'John Smith',
      amount: 1200,
      date: '2023-12-01',
      status: 'paid',
      method: 'creditCard',
      description: 'December 2023 Rent'
    },
    {
      id: 'pay6',
      tenantId: 'tenant1',
      tenantName: 'John Smith',
      amount: 1200,
      date: '2024-01-01',
      status: 'paid',
      method: 'bankTransfer',
      description: 'January 2024 Rent'
    },
    {
      id: 'pay7',
      tenantId: 'tenant1',
      tenantName: 'John Smith',
      amount: 1200,
      date: '2024-02-01',
      status: 'paid',
      method: 'bankTransfer',
      description: 'February 2024 Rent'
    },
    {
      id: 'pay8',
      tenantId: 'tenant1',
      tenantName: 'John Smith',
      amount: 1200,
      date: '2024-03-01',
      status: 'paid',
      method: 'bankTransfer',
      description: 'March 2024 Rent'
    }
  ]);
  
  const [mockUnprocessedPayments, setMockUnprocessedPayments] = useState<any[]>([
    {
      id: 'unrec1',
      reference: 'RT-1200-JS',
      amount: 1200,
      date: '2024-03-31',
      method: 'bankTransfer',
      description: 'Bank transfer ref: RT-1200-JS',
      status: 'unmatched',
      rawData: 'RT-1200-JS / $1,200.00 / 03-31-2024 / SMITH J'
    },
    {
      id: 'unrec2',
      reference: 'APT101/1200',
      amount: 1200,
      date: '2024-03-29',
      method: 'check',
      description: 'Check #1055 - APT101/1200',
      status: 'unmatched',
      rawData: 'Check #1055 / APT101/1200 / $1,200.00 / SUNRISE APT'
    },
    {
      id: 'unrec3',
      reference: 'ZellePayment-Alice',
      amount: 950,
      date: '2024-03-30',
      method: 'bankTransfer',
      description: 'Zelle Transfer - Alice Wong',
      status: 'unmatched',
      rawData: 'Zelle Transfer - Alice Wong / $950.00 / 03-30-2024'
    }
  ]);
  
  const [notifications, setNotifications] = useState<any[]>([
    {
      id: 'notification1',
      title: 'Lease Expiring Soon: Alice Wong',
      message: 'Lease for Alice Wong expires in 30 days on April 30, 2024. Action required.',
      type: 'lease',
      priority: 'medium',
      date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      read: false,
      actions: [
        { label: 'Contact Tenant', action: 'contact_tenant' },
        { label: 'Prepare Renewal', action: 'prepare_renewal' }
      ]
    },
    {
      id: 'notification2',
      title: 'Late Payment: Michael Brown',
      message: 'Payment of $1,500 from Michael Brown is overdue since March 5, 2024.',
      type: 'payment',
      priority: 'high',
      date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false,
      actions: [
        { label: 'Send Reminder', action: 'send_reminder' },
        { label: 'Call Tenant', action: 'call_tenant' }
      ]
    },
    {
      id: 'notification3',
      title: 'Maintenance Request: Sunset Apartments',
      message: 'New maintenance request for Sunset Apartments: "Leaking kitchen faucet". Priority: urgent.',
      type: 'maintenance',
      priority: 'medium',
      date: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      read: true,
      actions: [
        { label: 'Assign Vendor', action: 'assign_vendor' },
        { label: 'View Details', action: 'view_details' }
      ]
    }
  ]);

  // Track dashboard view
  useEffect(() => {
    Analytics.trackPageView('dashboard_view');
  }, []);

  // Calculate totals from payments
  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const overduePayments = payments.filter(p => p.status === 'overdue').length;

  const charts = [
    {
      title: 'Revenue Overview',
      component: (
        <div className="h-full flex items-center justify-center">
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Revenue chart will be displayed here
          </p>
        </div>
      )
    },
    {
      title: 'Payment Methods',
      component: (
        <div className="h-full flex items-center justify-center">
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Payment methods chart will be displayed here
          </p>
        </div>
      )
    }
  ];

  const nextChart = () => {
    setCurrentChart((prev) => (prev + 1) % charts.length);
  };

  const prevChart = () => {
    setCurrentChart((prev) => (prev - 1 + charts.length) % charts.length);
  };
  
  const handleAIFeatureClick = (feature: string) => {
    if (feature === 'allocation') {
      navigate('/properties?view=allocation');
    } else {
      setActiveComponent(feature);
    }
    
    // Track feature click
    Analytics.trackEvent('dashboard_ai_feature_clicked', {
      feature
    });
  };
  
  const handleCloseAIComponent = () => {
    setActiveComponent(null);
  };
  
  const handleRecommendationClick = (action: string, tenant: Tenant) => {
    console.log(`Recommendation clicked: ${action} for tenant ${tenant.name}`);
    // Here you would implement the action
    
    // Track the recommendation click
    Analytics.trackEvent('health_score_recommendation_clicked', {
      action,
      tenantId: tenant.id
    });
  };
  
  const handleNotificationAction = (id: string, action: string) => {
    console.log(`Notification action: ${action} for notification ${id}`);
    // Here you would implement the action
    
    // Track the notification action
    Analytics.trackEvent('notification_action_clicked', {
      notificationId: id,
      action
    });
  };

  return (
    <div className="space-y-6">
      <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Dashboard</h1>
      
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50">
        <NotificationSystem 
          notifications={notifications}
          onNotificationRead={(id) => {
            setNotifications(prev => 
              prev.map(notification => 
                notification.id === id 
                  ? { ...notification, read: true } 
                  : notification
              )
            );
          }}
          onNotificationAction={handleNotificationAction}
          onNotificationsClear={() => {
            setNotifications([]);
          }}
          onNotificationDismiss={(id) => {
            setNotifications(prev => 
              prev.filter(notification => notification.id !== id)
            );
          }}
        />
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-6 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Total Revenue</h3>
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${totalRevenue.toFixed(2)}</p>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>This month</p>
        </div>

        <div className={`p-6 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Pending Payments</h3>
            <Clock className={`w-6 h-6 ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`} />
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{pendingPayments}</p>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>payments pending</p>
        </div>

        <div className={`p-6 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Overdue Payments</h3>
            <AlertCircle className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{overduePayments}</p>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>payments overdue</p>
        </div>
      </div>
      
      {/* AI Features Section */}
      <div className={`rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'} p-4 mb-6`}>
        <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          AI-Powered Tools
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            onClick={() => handleAIFeatureClick('healthScore')}
            className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 hover:bg-gray-650' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'} cursor-pointer transition-colors duration-200`}
          >
            <div className="flex items-center mb-2">
              <Users className={`w-5 h-5 mr-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Tenant Health Score</h3>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Analyze tenant payment reliability and financial health scores
            </p>
          </div>
          
          <div 
            onClick={() => handleAIFeatureClick('reconciliation')}
            className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 hover:bg-gray-650' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'} cursor-pointer transition-colors duration-200`}
          >
            <div className="flex items-center mb-2">
              <DollarSign className={`w-5 h-5 mr-2 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Auto-Reconciliation</h3>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Match incoming payments to tenants using AI pattern recognition
            </p>
          </div>
          
          <div 
            onClick={() => handleAIFeatureClick('allocation')}
            className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 hover:bg-gray-650' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'} cursor-pointer transition-colors duration-200`}
          >
            <div className="flex items-center mb-2">
              <Building2 className={`w-5 h-5 mr-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Property Allocation</h3>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Match tenants to properties based on preferences and requirements
            </p>
          </div>
        </div>
      </div>
      
      {/* Active AI Component */}
      {activeComponent && (
        <div className={`rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'} p-4 mb-6`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {activeComponent === 'healthScore' && 'Tenant Health Score'}
              {activeComponent === 'reconciliation' && 'Payment Auto-Reconciliation'}
              {activeComponent === 'allocation' && 'Property Allocation Engine'}
            </h2>
            <button 
              onClick={handleCloseAIComponent}
              className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {activeComponent === 'healthScore' && (
            <HealthScoreModule 
              tenant={mockTenant}
              payments={mockPayments}
              onRecommendationClick={handleRecommendationClick}
            />
          )}
          
          {activeComponent === 'reconciliation' && (
            <ReconciliationEngine 
              unprocessedPayments={mockUnprocessedPayments}
              tenants={[mockTenant]}
              onPaymentReconciled={(payment: any, tenantId: string) => {
                console.log(`Payment ${payment.id} reconciled to tenant ${tenantId}`);
                setMockUnprocessedPayments(prev => 
                  prev.filter(p => p.id !== payment.id)
                );
                
                // Track the event
                Analytics.trackEvent('payment_reconciled', {
                  paymentId: payment.id,
                  tenantId: tenantId
                });
              }}
              onPaymentFlagged={(payment: any, reason: string) => {
                console.log(`Payment ${payment.id} flagged: ${reason}`);
                
                // Track the event
                Analytics.trackEvent('payment_flagged', {
                  paymentId: payment.id,
                  reason: reason
                });
              }}
            />
          )}
          
          {activeComponent === 'allocation' && (
            <div className="p-6 text-center">
              <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Property Allocation Engine
              </p>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Please navigate to the Properties section to use the allocation engine
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Chart Navigator */}
      <div className={`rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'} p-4`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {charts[currentChart].title}
          </h2>
          <div className="flex space-x-2">
            <button 
              onClick={prevChart}
              className={`p-2 rounded-full ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <ChevronLeft className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-700'}`} />
            </button>
            <button 
              onClick={nextChart}
              className={`p-2 rounded-full ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <ChevronRight className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-700'}`} />
            </button>
          </div>
        </div>
        <div className="h-[400px]">
          {charts[currentChart].component}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;