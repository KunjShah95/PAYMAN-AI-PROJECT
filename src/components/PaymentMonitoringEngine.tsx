import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { AlertTriangle, Bell, CheckCircle, Clock, DollarSign, Mail, MessageSquare } from 'lucide-react';
import { Tenant } from '../services/mockData';

interface PaymentMonitoringEngineProps {
  tenants: Tenant[];
  onActionRequired: (action: {
    type: 'late_payment' | 'upcoming_payment' | 'reconciliation_needed' | 'payment_received';
    tenantId: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }) => void;
}

const PaymentMonitoringEngine: React.FC<PaymentMonitoringEngineProps> = ({
  tenants,
  onActionRequired
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [monitoringStatus, setMonitoringStatus] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    const checkPayments = () => {
      const today = new Date();
      const currentDay = today.getDate();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      tenants.forEach(tenant => {
        // Check for late payments
        const lastPaymentDate = new Date(tenant.paymentHistory.lastPaymentDate);
        const daysSinceLastPayment = Math.floor((today.getTime() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastPayment > 5 && tenant.status === 'current') {
          onActionRequired({
            type: 'late_payment',
            tenantId: tenant.id,
            message: `${tenant.name} is ${daysSinceLastPayment} days late on rent payment`,
            severity: daysSinceLastPayment > 15 ? 'high' : 'medium'
          });
        }

        // Check for upcoming payments
        const nextPaymentDue = new Date(currentYear, currentMonth + 1, 1);
        const daysUntilPayment = Math.floor((nextPaymentDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilPayment <= 5 && daysUntilPayment > 0) {
          onActionRequired({
            type: 'upcoming_payment',
            tenantId: tenant.id,
            message: `${tenant.name} has rent payment due in ${daysUntilPayment} days`,
            severity: 'low'
          });
        }

        // Check for reconciliation issues
        if (tenant.wallet.pendingTransactions.length > 0) {
          const unreconciledAmount = tenant.wallet.pendingTransactions.reduce((sum, t) => sum + t.amount, 0);
          if (Math.abs(unreconciledAmount - tenant.rentAmount) > 0.01) {
            onActionRequired({
              type: 'reconciliation_needed',
              tenantId: tenant.id,
              message: `Reconciliation needed for ${tenant.name}: Expected ${tenant.rentAmount}, got ${unreconciledAmount}`,
              severity: 'medium'
            });
          }
        }

        // Check for successful payments
        if (tenant.wallet.balance >= tenant.rentAmount && tenant.status === 'late') {
          onActionRequired({
            type: 'payment_received',
            tenantId: tenant.id,
            message: `${tenant.name} has made a payment of ${tenant.rentAmount}`,
            severity: 'low'
          });
        }
      });
    };

    const interval = setInterval(checkPayments, 1000 * 60 * 60); // Check every hour
    return () => clearInterval(interval);
  }, [tenants, onActionRequired]);

  return (
    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Payment Monitoring
        </h2>
        <div className="flex items-center space-x-2">
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Status: {monitoringStatus}
          </span>
          <div className={`w-2 h-2 rounded-full ${monitoringStatus === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Late Payments</h3>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {tenants.filter(t => t.status === 'late').length} tenants
          </p>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Upcoming Payments</h3>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {tenants.filter(t => {
              const nextPaymentDue = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
              const daysUntilPayment = Math.floor((nextPaymentDue.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return daysUntilPayment <= 5 && daysUntilPayment > 0;
            }).length} tenants
          </p>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>On Time Payments</h3>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {tenants.filter(t => t.status === 'current').length} tenants
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentMonitoringEngine; 