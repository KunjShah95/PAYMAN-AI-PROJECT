import { useState, useCallback } from 'react';
import { Building2, CreditCard, Users, ArrowUpDown, DollarSign, Bot, Wrench, BookOpen } from 'lucide-react';
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
import { useTheme } from './context/ThemeContext';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType;
}

interface Payment {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  date: string;
  method: 'creditCard' | 'bankTransfer' | 'check' | 'cash';
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'overdue' | 'paid';
}

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

function App() {
  const { theme } = useTheme();
  const [activeView, setActiveView] = useState('dashboard');
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [isAddingTenant, setIsAddingTenant] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Use environment variable for API key or fallback to a placeholder
  const PAYMAN_API_KEY = import.meta.env.VITE_PAYMAN_API_KEY || 'your_payman_api_key';

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Building2 },
    { id: 'properties', label: 'Properties', icon: Building2 },
    { id: 'tenants', label: 'Tenants', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'transactions', label: 'Transactions', icon: ArrowUpDown },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'ai-assistants', label: 'AI Assistants', icon: Bot },
    { id: 'documentation', label: 'Documentation', icon: BookOpen },
  ];

  const showToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    
    // Auto remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  }, []);

  const handlePaymentSubmit = async (payment: Omit<Payment, 'id' | 'status'>) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPayment: Payment = {
        ...payment,
        id: `pay${Date.now()}`,
        status: 'completed'
      };
      
      setPayments(prev => [newPayment, ...prev]);
      showToast('success', `Payment of $${payment.amount} recorded for ${payment.tenantName}`);
    } catch (error) {
      showToast('error', 'Failed to process payment. Please try again.');
      console.error('Error processing payment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgentResponse = (response: any) => {
    setAiResponse(response);
    console.log('AI Agent response:', response);
  };

  const handleAddTenant = (tenantData: any) => {
    console.log('New tenant data:', tenantData);
    // In a real app, this would call an API to save the tenant data
    setIsAddingTenant(false);
    showToast('success', 'New tenant added successfully');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row gap-6 w-full">
              <div className="flex-grow">
                <Dashboard payments={payments} />
              </div>
              <div className="lg:w-1/3">
                <PaymentForm 
                  onSubmit={handlePaymentSubmit} 
                  isCompact={true} 
                  onViewAllPayments={() => setActiveView('payments')}
                />
              </div>
            </div>
          </div>
        );
      
      case 'properties':
        return <PropertyList />;
      
      case 'tenants':
        if (isAddingTenant) {
          return (
            <div className={`p-6 rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <AddTenantForm 
                onSubmit={handleAddTenant} 
                onCancel={() => setIsAddingTenant(false)} 
              />
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Tenants</h1>
              <button
                onClick={() => setIsAddingTenant(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Tenant
              </button>
            </div>
            <TenantList />
          </div>
        );
      
      case 'maintenance':
        return <MaintenanceList />;
      
      case 'transactions':
        return <TransactionList payments={payments} onNavigateToPayments={() => setActiveView('payments')} />;

      case 'payments':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Payments</h1>
              <button
                onClick={() => setActiveView('dashboard')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Make Payment
              </button>
            </div>
            <TransactionList 
              onNavigateToPayments={() => setActiveView('payments')} 
              payments={payments}
            />
          </div>
        );

      case 'ai-assistants':
        return (
          <div className="flex flex-col gap-6">
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>AI Assistants</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AIAgent 
                apiKey={PAYMAN_API_KEY} 
                onResponse={handleAgentResponse} 
              />
              <PaymentAgent 
                apiKey={PAYMAN_API_KEY} 
                onPaymentAction={handleAgentResponse} 
              />
            </div>
            <div className="mt-6">
              <PropertyManagementAgent
                apiKey={PAYMAN_API_KEY}
                onInsightGenerated={handleAgentResponse}
              />
            </div>
            {aiResponse && (
              <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-50'}`}>
                <h2 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Last AI Action:</h2>
                <pre className={`p-3 rounded overflow-auto ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-800'}`}>
                  {JSON.stringify(aiResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        );

      case 'documentation':
        return <Documentation />;
        
      default:
        return (
          <div className={`p-4 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
            </h2>
            <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              This section is under development.
            </p>
          </div>
        );
    }
  };

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar menuItems={menuItems} activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 overflow-y-auto relative">
        <div className="p-4 lg:p-6">
          {renderContent()}
        </div>

        {/* Toast messages */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          {toasts.map(toast => (
            <div 
              key={toast.id}
              className={`px-4 py-3 rounded-lg shadow-lg max-w-xs flex items-center gap-2 ${
                toast.type === 'success' 
                  ? 'bg-green-600 text-white' 
                  : toast.type === 'error'
                    ? 'bg-red-600 text-white'
                    : 'bg-blue-600 text-white'
              }`}
            >
              {toast.type === 'success' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {toast.type === 'error' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {toast.type === 'info' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>{toast.message}</span>
            </div>
          ))}
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="p-4 rounded-lg bg-white shadow-lg">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-center text-gray-700">Processing...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;