import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { DollarSign, Clock, AlertCircle, ChevronLeft, ChevronRight, Users, Building2, X, Bell, Home, Wallet } from 'lucide-react';
import HealthScoreModule from './HealthScoreModule';
import ReconciliationEngine from './ReconciliationEngine';
import NotificationSystem from './NotificationSystem';
import Analytics from './Analytics';
import { useNavigate } from 'react-router-dom';
import PaymentMonitoringEngine from './PaymentMonitoringEngine';
import LandlordFundSweep from './LandlordFundSweep';
import { tenants } from '../services/mockData';

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

interface Notification {
  id: string;
  type: 'late_payment' | 'upcoming_payment' | 'reconciliation_needed' | 'payment_received' | 'lease' | 'maintenance';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  read?: boolean;
  title?: string;
  actions?: Array<{ label: string; action: string }>;
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
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notification1',
      type: 'lease',
      title: 'Lease Expiring Soon: Alice Wong',
      message: 'Lease for Alice Wong expires in 30 days on April 30, 2024. Action required.',
      severity: 'medium',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      read: false,
      actions: [
        { label: 'Contact Tenant', action: 'contact_tenant' },
        { label: 'Prepare Renewal', action: 'prepare_renewal' }
      ]
    },
    {
      id: 'notification2',
      type: 'late_payment',
      title: 'Late Payment: Michael Brown',
      message: 'Payment of $1,500 from Michael Brown is overdue since March 5, 2024.',
      severity: 'high',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false,
      actions: [
        { label: 'Send Reminder', action: 'send_reminder' },
        { label: 'Call Tenant', action: 'call_tenant' }
      ]
    },
    {
      id: 'notification3',
      type: 'maintenance',
      title: 'Maintenance Request: Sunset Apartments',
      message: 'New maintenance request for Sunset Apartments: "Leaking kitchen faucet". Priority: urgent.',
      severity: 'medium',
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      read: true,
      actions: [
        { label: 'Assign Vendor', action: 'assign_vendor' },
        { label: 'View Details', action: 'view_details' }
      ]
    }
  ]);
  
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

  const handlePaymentAction = (action: {
    type: 'late_payment' | 'upcoming_payment' | 'reconciliation_needed' | 'payment_received';
    tenantId: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }) => {
    setNotifications(prev => [{
      id: Date.now().toString(),
      ...action,
      timestamp: new Date().toISOString(),
      read: false
    }, ...prev]);
  };

  const handleSweepComplete = (sweepDetails: {
    totalAmount: number;
    tenantCount: number;
    timestamp: string;
  }) => {
    setNotifications(prev => [{
      id: Date.now().toString(),
      type: 'payment_received',
      message: `Fund sweep completed: $${sweepDetails.totalAmount.toFixed(2)} from ${sweepDetails.tenantCount} tenants`,
      severity: 'low',
      timestamp: sweepDetails.timestamp,
      read: false
    }, ...prev]);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <PaymentMonitoringEngine
              tenants={tenants}
              onActionRequired={handlePaymentAction}
            />
            
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Recent Activity
              </h2>
              <div className="space-y-4">
                {notifications.slice(0, 5).map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg flex items-start space-x-3 ${
                      isDark ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    <Bell className={`w-5 h-5 ${
                      notification.severity === 'high' ? 'text-red-500' :
                      notification.severity === 'medium' ? 'text-yellow-500' :
                      'text-green-500'
                    }`} />
                    <div>
                      <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {notification.message}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <LandlordFundSweep
              tenants={tenants}
              onSweepComplete={handleSweepComplete}
            />

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/tenants')}
                  className={`p-4 rounded-lg flex flex-col items-center space-y-2 ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-6 h-6 text-blue-500" />
                  <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Manage Tenants
                  </span>
                </button>
                <button
                  onClick={() => navigate('/payments')}
                  className={`p-4 rounded-lg flex flex-col items-center space-y-2 ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <DollarSign className="w-6 h-6 text-green-500" />
                  <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    View Payments
                  </span>
                </button>
                <button
                  onClick={() => navigate('/properties')}
                  className={`p-4 rounded-lg flex flex-col items-center space-y-2 ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Home className="w-6 h-6 text-purple-500" />
                  <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Properties
                  </span>
                </button>
                <button
                  onClick={() => navigate('/wallet')}
                  className={`p-4 rounded-lg flex flex-col items-center space-y-2 ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Wallet className="w-6 h-6 text-orange-500" />
                  <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Wallet
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;