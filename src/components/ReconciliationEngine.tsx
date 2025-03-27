import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { BarChart3, AlertTriangle, SearchCheck, CheckCircle, Info, Database, Loader2 } from 'lucide-react';
import Analytics from './Analytics';

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

interface Payment {
  id: string;
  reference: string;
  amount: number;
  date: string;
  method: 'creditCard' | 'bankTransfer' | 'check' | 'cash';
  description?: string;
  status: 'pending' | 'reconciled' | 'flagged';
  matchConfidence?: number;
  matchedTenantId?: string;
  matchReason?: string;
  rawData?: string;
}

interface ReconciliationEngineProps {
  tenants: Tenant[];
  unprocessedPayments: Payment[];
  onPaymentReconciled: (payment: Payment, tenantId: string) => void;
  onPaymentFlagged: (payment: Payment, reason: string) => void;
}

const ReconciliationEngine: React.FC<ReconciliationEngineProps> = ({
  tenants,
  unprocessedPayments,
  onPaymentReconciled,
  onPaymentFlagged
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [processingPayments, setProcessingPayments] = useState<Payment[]>([]);
  const [processedPayments, setProcessedPayments] = useState<Payment[]>([]);
  const [flaggedPayments, setFlaggedPayments] = useState<Payment[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeView, setActiveView] = useState<'unprocessed' | 'processed' | 'flagged'>('unprocessed');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [matchThreshold, setMatchThreshold] = useState(70);

  // Track component mount
  useEffect(() => {
    Analytics.trackPageView('reconciliation_engine_view');
  }, []);

  // Calculate success metrics
  const totalPayments = unprocessedPayments.length + processedPayments.length + flaggedPayments.length;
  const reconciliationRate = totalPayments > 0 
    ? Math.round((processedPayments.length / totalPayments) * 100) 
    : 0;

  const runReconciliation = () => {
    if (isProcessing || unprocessedPayments.length === 0) return;
    
    setIsProcessing(true);
    setProcessingPayments([...unprocessedPayments]);
    
    // Track the event
    Analytics.trackEvent('reconciliation_started', {
      paymentCount: unprocessedPayments.length
    });

    // Simulate AI processing with a delay for each payment
    let processedCount = 0;
    let flaggedCount = 0;
    
    // Process each payment with a delay to simulate AI processing
    unprocessedPayments.forEach((payment, index) => {
      setTimeout(() => {
        const result = matchPaymentToTenant(payment, tenants);
        
        if (result.matchConfidence && result.matchConfidence >= matchThreshold) {
          // Payment successfully matched to a tenant
          const reconciledPayment = {
            ...payment,
            status: 'reconciled' as const,
            matchConfidence: result.matchConfidence,
            matchedTenantId: result.tenantId,
            matchReason: result.reason
          };
          
          setProcessedPayments(prev => [...prev, reconciledPayment]);
          onPaymentReconciled(reconciledPayment, result.tenantId);
          processedCount++;
        } else {
          // Payment couldn't be matched confidently
          const flaggedPayment = {
            ...payment,
            status: 'flagged' as const,
            matchConfidence: result.matchConfidence || 0,
            matchedTenantId: result.tenantId,
            matchReason: result.reason
          };
          
          setFlaggedPayments(prev => [...prev, flaggedPayment]);
          onPaymentFlagged(flaggedPayment, result.reason || 'Unknown reason');
          flaggedCount++;
        }
        
        // When all payments are processed, reset the processing state
        if (index === unprocessedPayments.length - 1) {
          setTimeout(() => {
            setIsProcessing(false);
            setProcessingPayments([]);
            
            // Track the event completion
            Analytics.trackEvent('reconciliation_completed', {
              totalPayments: unprocessedPayments.length,
              processedCount,
              flaggedCount,
              successRate: Math.round((processedCount / unprocessedPayments.length) * 100)
            });
          }, 1000);
        }
      }, index * 800); // stagger the processing to simulate AI working
    });
  };

  // AI matching algorithm simulation
  const matchPaymentToTenant = (payment: Payment, tenants: Tenant[]): {
    tenantId: string;
    matchConfidence: number;
    reason: string;
  } => {
    // This is a simulated AI matching algorithm
    // In a real app, this would use machine learning or sophisticated pattern matching
    
    // Extract key data
    const paymentAmount = payment.amount;
    const paymentRef = payment.reference.toLowerCase();
    const paymentDesc = payment.description?.toLowerCase() || '';
    
    // Try exact name matches in reference or description
    for (const tenant of tenants) {
      const tenantNameLower = tenant.name.toLowerCase();
      const tenantUnitLower = tenant.unit.toLowerCase();
      
      // Strong exact match: name in reference and amount matches rent
      if ((paymentRef.includes(tenantNameLower) || paymentDesc.includes(tenantNameLower)) && 
          Math.abs(paymentAmount - tenant.rentAmount) < 1) {
        return {
          tenantId: tenant.id,
          matchConfidence: 95,
          reason: `Strong match: tenant name found in payment reference and amount matches rent exactly`
        };
      }
      
      // Name in reference but amount different
      if (paymentRef.includes(tenantNameLower) || paymentDesc.includes(tenantNameLower)) {
        return {
          tenantId: tenant.id,
          matchConfidence: 85,
          reason: `Medium match: tenant name found in payment reference but amount differs from rent`
        };
      }

      // Unit number in reference and amount matches
      if ((paymentRef.includes(`unit ${tenantUnitLower}`) || paymentRef.includes(`unit${tenantUnitLower}`)) && 
          Math.abs(paymentAmount - tenant.rentAmount) < 1) {
        return {
          tenantId: tenant.id,
          matchConfidence: 90,
          reason: `Strong match: unit number found in payment reference and amount matches rent`
        };
      }
      
      // Amount matches exactly
      if (Math.abs(paymentAmount - tenant.rentAmount) < 1) {
        return {
          tenantId: tenant.id,
          matchConfidence: 75,
          reason: `Potential match: payment amount matches tenant's rent exactly`
        };
      }
    }
    
    // If we get here, no confident matches were found
    // Find the closest match based on amount as a fallback
    let closestMatch = { 
      tenantId: '', 
      amountDiff: Number.MAX_VALUE,
      matchConfidence: 0,
      reason: ''
    };
    
    for (const tenant of tenants) {
      const amountDiff = Math.abs(paymentAmount - tenant.rentAmount);
      if (amountDiff < closestMatch.amountDiff) {
        closestMatch = {
          tenantId: tenant.id,
          amountDiff,
          matchConfidence: 60 - Math.min(amountDiff / tenant.rentAmount * 100, 40), // Lower confidence as difference increases
          reason: `Low confidence match: closest tenant by payment amount (${amountDiff.toFixed(2)} difference)`
        };
      }
    }
    
    if (closestMatch.tenantId) {
      return {
        tenantId: closestMatch.tenantId,
        matchConfidence: closestMatch.matchConfidence,
        reason: closestMatch.reason
      };
    }
    
    // No match found at all
    return {
      tenantId: '',
      matchConfidence: 0,
      reason: 'No matching tenant found'
    };
  };

  const manuallyAssignPayment = (payment: Payment, tenantId: string) => {
    const targetTenant = tenants.find(t => t.id === tenantId);
    if (!targetTenant) return;
    
    // Update the payment
    const updatedPayment = {
      ...payment,
      status: 'reconciled' as const,
      matchConfidence: 100, // Manual assignment is 100% confidence
      matchedTenantId: tenantId,
      matchReason: 'Manually assigned by administrator'
    };
    
    // Remove from flagged list
    setFlaggedPayments(prev => prev.filter(p => p.id !== payment.id));
    
    // Add to processed list
    setProcessedPayments(prev => [...prev, updatedPayment]);
    
    // Call the parent handler
    onPaymentReconciled(updatedPayment, tenantId);
    
    // Track the event
    Analytics.trackEvent('payment_manually_reconciled', {
      paymentId: payment.id,
      tenantId
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get tenant name from ID
  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant ? tenant.name : 'Unknown Tenant';
  };

  // Get confidence level class
  const getConfidenceClass = (confidence: number) => {
    if (confidence >= 90) {
      return isDark ? 'text-green-400' : 'text-green-600';
    } else if (confidence >= 70) {
      return isDark ? 'text-blue-400' : 'text-blue-600';
    } else if (confidence >= 40) {
      return isDark ? 'text-yellow-400' : 'text-yellow-600';
    } else {
      return isDark ? 'text-red-400' : 'text-red-600';
    }
  };

  // Render a payment card
  const renderPaymentCard = (payment: Payment) => {
    const isDetailed = showDetails === payment.id;

    return (
      <div 
        key={payment.id}
        className={`p-4 mb-4 rounded-lg border ${
          isDark 
          ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
          : 'bg-white border-gray-200 hover:border-gray-300'
        } transition-colors`}
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="text-lg font-medium mb-1">
              {formatCurrency(payment.amount)}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {payment.reference} • {formatDate(payment.date)}
            </div>
          </div>
          <div className="flex items-center">
            {payment.status === 'reconciled' && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800`}>
                <CheckCircle className="h-3 w-3 mr-1" />
                Reconciled
              </span>
            )}
            {payment.status === 'flagged' && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800`}>
                <AlertTriangle className="h-3 w-3 mr-1" />
                Flagged
              </span>
            )}
            {payment.status === 'pending' && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
                <Info className="h-3 w-3 mr-1" />
                Pending
              </span>
            )}
            <button
              onClick={() => setShowDetails(isDetailed ? null : payment.id)}
              className={`ml-2 p-1 rounded-full ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {payment.status !== 'pending' && payment.matchConfidence !== undefined && (
          <div className="mt-2">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                Match confidence: 
                <span className={`ml-1 font-medium ${getConfidenceClass(payment.matchConfidence)}`}>
                  {payment.matchConfidence}%
                </span>
              </div>
              {payment.matchedTenantId && (
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tenant: {getTenantName(payment.matchedTenantId)}
                </div>
              )}
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div 
                className={`h-1.5 rounded-full ${
                  payment.matchConfidence >= 90 ? 'bg-green-500' :
                  payment.matchConfidence >= 70 ? 'bg-blue-500' :
                  payment.matchConfidence >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${payment.matchConfidence}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {isDetailed && (
          <div className={`mt-4 p-3 rounded-md text-sm ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className="mb-2 font-medium">Payment Details</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>Method:</div>
              <div className="capitalize">{payment.method.replace(/([A-Z])/g, ' $1')}</div>
              
              <div>Description:</div>
              <div>{payment.description || '—'}</div>
              
              {payment.matchReason && (
                <>
                  <div>Match reason:</div>
                  <div>{payment.matchReason}</div>
                </>
              )}
            </div>
            
            {payment.status === 'flagged' && (
              <div className="mt-4">
                <div className="mb-2 font-medium">Manually assign to tenant:</div>
                <div className="flex flex-wrap gap-2">
                  {tenants.map(tenant => (
                    <button
                      key={tenant.id}
                      onClick={() => manuallyAssignPayment(payment, tenant.id)}
                      className={`px-3 py-1 text-xs rounded-md ${
                        isDark
                          ? 'bg-blue-600 hover:bg-blue-500 text-white'
                          : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                      }`}
                    >
                      {tenant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`p-4 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Payment Reconciliation Engine
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Automatically match incoming payments to tenants using AI
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center">
          <button
            onClick={runReconciliation}
            disabled={isProcessing || unprocessedPayments.length === 0}
            className={`inline-flex items-center px-4 py-2 rounded-md mr-2 ${
              isProcessing || unprocessedPayments.length === 0
                ? `${isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing
              </>
            ) : (
              <>
                <SearchCheck className="h-4 w-4 mr-2" />
                Process Payments
              </>
            )}
          </button>
          
          <div className="flex items-center">
            <span className={`text-sm mr-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Match Threshold:
            </span>
            <select
              value={matchThreshold}
              onChange={(e) => setMatchThreshold(Number(e.target.value))}
              className={`p-1 rounded-md text-sm ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              <option value={90}>90% (High)</option>
              <option value={70}>70% (Medium)</option>
              <option value={50}>50% (Low)</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
              Unprocessed
            </div>
            <Database className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
          </div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {unprocessedPayments.length}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Payments pending
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
              Reconciled
            </div>
            <CheckCircle className={`h-5 w-5 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
          </div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {processedPayments.length}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Payments matched
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
              Flagged
            </div>
            <AlertTriangle className={`h-5 w-5 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
          </div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {flaggedPayments.length}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Require attention
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
              Success Rate
            </div>
            <BarChart3 className={`h-5 w-5 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} />
          </div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {reconciliationRate}%
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Automatic matches
          </div>
        </div>
      </div>
      
      {/* Tabs for different views */}
      <div className="border-b mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveView('unprocessed')}
            className={`py-2 px-1 border-b-2 text-sm font-medium ${
              activeView === 'unprocessed'
                ? isDark
                  ? 'border-blue-500 text-blue-400'
                  : 'border-blue-500 text-blue-600'
                : isDark
                  ? 'border-transparent text-gray-400 hover:text-gray-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Unprocessed ({unprocessedPayments.length})
          </button>
          <button
            onClick={() => setActiveView('processed')}
            className={`py-2 px-1 border-b-2 text-sm font-medium ${
              activeView === 'processed'
                ? isDark
                  ? 'border-green-500 text-green-400'
                  : 'border-green-500 text-green-600'
                : isDark
                  ? 'border-transparent text-gray-400 hover:text-gray-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Reconciled ({processedPayments.length})
          </button>
          <button
            onClick={() => setActiveView('flagged')}
            className={`py-2 px-1 border-b-2 text-sm font-medium ${
              activeView === 'flagged'
                ? isDark
                  ? 'border-yellow-500 text-yellow-400'
                  : 'border-yellow-500 text-yellow-600'
                : isDark
                  ? 'border-transparent text-gray-400 hover:text-gray-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Flagged ({flaggedPayments.length})
          </button>
        </div>
      </div>
      
      {/* Payment lists */}
      <div className="overflow-y-auto max-h-96 pr-2">
        {activeView === 'unprocessed' && (
          isProcessing ? (
            <>
              {processingPayments.map(payment => renderPaymentCard(payment))}
              <div className={`text-center p-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin" />
                Processing payments...
              </div>
            </>
          ) : unprocessedPayments.length > 0 ? (
            unprocessedPayments.map(payment => renderPaymentCard(payment))
          ) : (
            <div className={`text-center p-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No unprocessed payments.
            </div>
          )
        )}
        
        {activeView === 'processed' && (
          processedPayments.length > 0 ? (
            processedPayments.map(payment => renderPaymentCard(payment))
          ) : (
            <div className={`text-center p-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No reconciled payments.
            </div>
          )
        )}
        
        {activeView === 'flagged' && (
          flaggedPayments.length > 0 ? (
            flaggedPayments.map(payment => renderPaymentCard(payment))
          ) : (
            <div className={`text-center p-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No payments flagged for review.
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ReconciliationEngine; 