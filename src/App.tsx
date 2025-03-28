import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Settings as SettingsIcon, User, Menu, Home, Building2, Users, FileText, Moon, Sun, CreditCard, Wallet as WalletIcon, ArrowUpDown, DollarSign, Bot, Wrench, BookOpen } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import PaymentForm from './components/PaymentForm';
import AIAgent from './components/AIAgent';
import PaymentAgent from './components/PaymentAgent';
import PropertyManagementAgent from './components/PropertyManagementAgent';
import PropertyList from './components/PropertyList';
import TenantList from './components/TenantList';
import MaintenanceList from './components/MaintenanceList';
import TransactionList from './components/TransactionList';
import AddTenantForm from './components/forms/AddTenantForm';
import Documentation from './components/Documentation';
import SettingsPage from './components/Settings';
import Profile from './components/Profile';
import Revenue from './components/Revenue';
import Wallet from './components/Wallet';
import { useTheme } from './context/ThemeContext';
import Analytics from './components/Analytics';
import { properties, tenants } from './services/mockData';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

interface Payment {
  id: string;
  tenantId: string;
  tenantName?: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'failed' | 'overdue';
  method: 'creditCard' | 'bankTransfer' | 'check' | 'cash';
  description: string;
}

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const location = useLocation();

  // Track initial app load
  useEffect(() => {
    Analytics.trackPageView('app_loaded');
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const showToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setPayments(prev => [...prev, { id, type, message, status: 'pending', method: 'creditCard', description: '', amount: 0, tenantId: '', date: '' }]);
    
    // Auto remove toast after 5 seconds
    const timeoutId = setTimeout(() => {
      setPayments(prev => prev.filter(toast => toast.id !== id));
    }, 5000);

    return () => clearTimeout(timeoutId); // Cleanup timeout on unmount
  }, []);

  const handlePaymentSubmit = (paymentData: Omit<Payment, 'id' | 'status'>) => {
    // In a real app, this would make an API call
    const newPayment: Payment = {
      ...paymentData,
      id: `pay${Date.now()}`,
      status: 'pending',
    };
    
    setPayments(prev => [newPayment, ...prev]);
    
    // Track the event
    Analytics.trackEvent('payment_created', {
      amount: paymentData.amount,
      method: paymentData.method
    });
    
    return newPayment;
  };

  const handleAgentResponse = (response: unknown) => {
    console.log('AI Agent response:', response);
    
    // Track AI agent interaction
    Analytics.trackEvent('ai_agent_interaction', {
      responseType: typeof response === 'object' && response !== null && 'type' in response 
        ? (response as { type: string }).type 
        : 'unknown'
    });
  };

  const handleAddTenant = (tenantData: unknown) => {
    console.log('New tenant data:', tenantData);
    // In a real app, this would call an API to save the tenant data
    showToast('success', 'New tenant added successfully');
    
    // Track tenant addition
    Analytics.trackEvent('tenant_added', {
      tenantAdded: true
    });
  };

  // Add tenant name to payments for display purposes
  const paymentsWithNames = payments.map(payment => {
    const tenant = tenants.find(t => t.id === payment.tenantId);
    return {
      ...payment,
      tenantName: tenant ? tenant.name : 'Unknown Tenant'
    };
  });

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
    { id: 'properties', label: 'Properties', icon: Building2, path: '/properties' },
    { id: 'tenants', label: 'Tenants', icon: Users, path: '/tenants' },
    { id: 'payments', label: 'Payments', icon: CreditCard, path: '/payments' },
    { id: 'wallet', label: 'Wallet', icon: WalletIcon, path: '/wallet' },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, path: '/maintenance' },
    { id: 'transactions', label: 'Transactions', icon: ArrowUpDown, path: '/transactions' },
    { id: 'revenue', label: 'Revenue', icon: DollarSign, path: '/revenue' },
    { id: 'ai-assistants', label: 'AI Assistants', icon: Bot, path: '/ai-assistants' },
    { id: 'documentation', label: 'Documentation', icon: BookOpen, path: '/documentation' },
  ];

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-auto lg:w-64 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}
      >
        <div className="h-full flex flex-col">
          <div className={`px-4 py-6 ${isDark ? 'border-gray-700' : 'border-gray-200'} border-b`}>
            <Link to="/" className="flex items-center">
              <WalletIcon className={`h-8 w-8 ${isDark ? 'text-blue-400' : 'text-blue-600'} mr-2`} />
              <span className="text-xl font-bold">Paymann</span>
            </Link>
            <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Property Management</p>
          </div>
          
          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <Link 
                      to={item.path}
                      className={`flex items-center px-4 py-2 rounded-md ${
                        location.pathname === item.path ? (isDark ? 'bg-gray-700' : 'bg-blue-50') : ''
                      } ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      onClick={() => {
                        Analytics.trackEvent('navigation', { destination: item.id });
                        setIsSidebarOpen(false);
                      }}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            
            <div className={`mt-8 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={toggleTheme}
                    className={`w-full flex items-center px-4 py-2 rounded-md ${
                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    {isDark ? <Sun className="h-5 w-5 mr-3" /> : <Moon className="h-5 w-5 mr-3" />}
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                  </button>
                </li>
                <li>
                  <Link 
                    to="/settings" 
                    className={`flex items-center px-4 py-2 rounded-md ${
                      location.pathname === '/settings' ? (isDark ? 'bg-gray-700' : 'bg-blue-50') : ''
                    } ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <SettingsIcon className="h-5 w-5 mr-3" />
                    Settings
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/profile" 
                    className={`flex items-center px-4 py-2 rounded-md ${
                      location.pathname === '/profile' ? (isDark ? 'bg-gray-700' : 'bg-blue-50') : ''
                    } ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <User className="h-5 w-5 mr-3" />
                    Profile
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard payments={paymentsWithNames} />} />
          <Route path="/properties" element={<PropertyList />} />
          <Route path="/tenants" element={<TenantList />} />
          <Route path="/payments" element={<PaymentForm onSubmit={handlePaymentSubmit} />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/maintenance" element={<MaintenanceList />} />
          <Route path="/transactions" element={<TransactionList payments={paymentsWithNames} />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/ai-assistants" element={<AIAgent apiKey="demo-key" onResponse={handleAgentResponse} />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;