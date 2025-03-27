import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { TrendingUp, TrendingDown, AlertTriangle, Check, ChevronUp, ChevronDown, CreditCard, BarChart3, HelpCircle, Calendar } from 'lucide-react';
import Analytics from './Analytics';

interface Payment {
  id: string;
  tenantId: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'failed' | 'overdue';
  method: 'creditCard' | 'bankTransfer' | 'check' | 'cash';
  description: string;
  paymentDate?: string; // When it was actually paid (vs. due date)
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

interface HealthScoreData {
  score: number;
  trend: 'up' | 'down' | 'stable';
  paymentHistory: {
    onTime: number;
    late: number;
    missed: number;
    total: number;
  };
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  recommendations: string[];
  details: {
    consistencyScore: number;
    timelinessScore: number;
    historyLengthScore: number;
    paymentMethodScore: number;
  };
  monthlyScores: { month: string; score: number }[];
}

interface HealthScoreModuleProps {
  tenant: Tenant;
  payments: Payment[];
  onRecommendationClick?: (action: string, tenant: Tenant) => void;
}

const HealthScoreModule: React.FC<HealthScoreModuleProps> = ({
  tenant,
  payments,
  onRecommendationClick
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [healthData, setHealthData] = useState<HealthScoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  // Track component mount
  useEffect(() => {
    Analytics.trackPageView('tenant_health_score_view');
  }, []);
  
  // Calculate health score when tenant or payments change
  useEffect(() => {
    if (!tenant || !payments.length) {
      setHealthData(null);
      setIsLoading(false);
      return;
    }
    
    // Simulate API call delay for calculation
    setIsLoading(true);
    
    setTimeout(() => {
      // Filter payments for this tenant
      const tenantPayments = payments.filter(p => p.tenantId === tenant.id);
      
      if (tenantPayments.length === 0) {
        setHealthData({
          score: 65, // Default neutral score
          trend: 'stable',
          paymentHistory: { onTime: 0, late: 0, missed: 0, total: 0 },
          riskLevel: 'medium',
          riskFactors: ['No payment history available'],
          recommendations: ['Set up automatic payments', 'Request deposit increase'],
          details: {
            consistencyScore: 65,
            timelinessScore: 65,
            historyLengthScore: 0,
            paymentMethodScore: 65
          },
          monthlyScores: []
        });
        setIsLoading(false);
        return;
      }
      
      const calculatedData = calculateHealthScore(tenant, tenantPayments);
      setHealthData(calculatedData);
      setIsLoading(false);
      
      // Track health score calculation
      Analytics.trackEvent('tenant_health_score_calculated', {
        tenantId: tenant.id,
        score: calculatedData.score,
        riskLevel: calculatedData.riskLevel
      });
    }, 1200);
  }, [tenant, payments]);

  // Calculate health score based on payment history
  const calculateHealthScore = (tenant: Tenant, payments: Payment[]): HealthScoreData => {
    // Sort payments by date
    const sortedPayments = [...payments].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Count payment statuses
    const onTimeCount = payments.filter(p => p.status === 'paid').length;
    const lateCount = payments.filter(p => p.status === 'overdue').length;
    const missedCount = payments.filter(p => p.status === 'failed').length;
    const totalPayments = payments.length;
    
    // Generate monthly scores for the chart (last 6 months)
    const monthlyScores: { month: string; score: number }[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      const monthYear = `${monthName} ${month.getFullYear()}`;
      
      // Calculate score for this month based on payments
      const monthPayments = payments.filter(p => {
        const paymentDate = new Date(p.date);
        return paymentDate.getMonth() === month.getMonth() && 
               paymentDate.getFullYear() === month.getFullYear();
      });
      
      let monthScore = 65; // Default
      
      if (monthPayments.length > 0) {
        const monthOnTime = monthPayments.filter(p => p.status === 'paid').length;
        monthScore = Math.min(100, Math.max(0, Math.round(
          (monthOnTime / monthPayments.length) * 100
        )));
        monthlyScores.push({ month: monthName, score: monthScore });
      } else {
        // No payments this month, use default or previous month's score
        const prevScore = monthlyScores.length > 0 
          ? monthlyScores[monthlyScores.length - 1].score 
          : 65;
        monthlyScores.push({ month: monthName, score: prevScore });
      }
    }
    
    // Calculate sub-scores
    const consistencyScore = Math.min(100, Math.max(0, Math.round(
      (onTimeCount / totalPayments) * 100
    )));
    
    // Timeliness score - more weight on recent payments
    const recentPayments = sortedPayments.slice(-3);
    const recentOnTime = recentPayments.filter(p => p.status === 'paid').length;
    const timelinessScore = recentPayments.length > 0
      ? Math.min(100, Math.max(0, Math.round((recentOnTime / recentPayments.length) * 100)))
      : 65;
    
    // History length score
    const monthsOfHistory = Math.min(
      24, // Cap at 24 months for max score
      Math.ceil(
        (new Date().getTime() - new Date(sortedPayments[0]?.date || Date.now()).getTime()) / 
        (30 * 24 * 60 * 60 * 1000)
      )
    );
    const historyLengthScore = Math.min(100, Math.max(0, Math.round((monthsOfHistory / 24) * 100)));
    
    // Payment method score (bank transfers and automatic payments are better)
    const autoPaymentMethods = payments.filter(
      p => p.method === 'bankTransfer' || p.method === 'creditCard'
    ).length;
    const paymentMethodScore = Math.min(100, Math.max(0, Math.round(
      (autoPaymentMethods / totalPayments) * 100
    )));
    
    // Weighted total score
    const totalScore = Math.round(
      (consistencyScore * 0.4) +
      (timelinessScore * 0.3) +
      (historyLengthScore * 0.1) +
      (paymentMethodScore * 0.2)
    );
    
    // Determine trend (compare to previous 3 months)
    const recentScore = monthlyScores.slice(-1)[0]?.score || 65;
    const previousScore = monthlyScores.slice(-4, -3)[0]?.score || 65;
    
    let trend: 'up' | 'down' | 'stable';
    if (recentScore > previousScore + 5) {
      trend = 'up';
    } else if (recentScore < previousScore - 5) {
      trend = 'down';
    } else {
      trend = 'stable';
    }
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (totalScore >= 80) {
      riskLevel = 'low';
    } else if (totalScore >= 60) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'high';
    }
    
    // Generate risk factors based on scores
    const riskFactors: string[] = [];
    if (consistencyScore < 70) riskFactors.push('Inconsistent payment history');
    if (timelinessScore < 60) riskFactors.push('Recent late payments');
    if (historyLengthScore < 50) riskFactors.push('Limited payment history');
    if (paymentMethodScore < 50) riskFactors.push('Uses less reliable payment methods');
    if (lateCount > totalPayments * 0.2) riskFactors.push('High rate of late payments');
    if (missedCount > 0) riskFactors.push('Has missed payments');
    
    // Generate recommendations
    const recommendations: string[] = [];
    if (paymentMethodScore < 70) recommendations.push('Set up automatic payments');
    if (consistencyScore < 60) recommendations.push('Request deposit increase');
    if (timelinessScore < 50) recommendations.push('Issue payment reminder');
    if (totalScore < 40) recommendations.push('Consider non-renewal');
    if (missedCount > 0) recommendations.push('Schedule payment discussion');
    if (riskFactors.length === 0) recommendations.push('Offer renewal incentive');
    
    return {
      score: totalScore,
      trend,
      paymentHistory: {
        onTime: onTimeCount,
        late: lateCount,
        missed: missedCount,
        total: totalPayments
      },
      riskLevel,
      riskFactors: riskFactors.length > 0 ? riskFactors : ['No risk factors identified'],
      recommendations,
      details: {
        consistencyScore,
        timelinessScore,
        historyLengthScore,
        paymentMethodScore
      },
      monthlyScores
    };
  };

  // Handle recommendation click
  const handleRecommendationClick = (action: string) => {
    if (onRecommendationClick) {
      onRecommendationClick(action, tenant);
    }
    
    // Track recommendation click event
    Analytics.trackEvent('tenant_health_recommendation_clicked', {
      tenantId: tenant.id,
      recommendation: action
    });
  };

  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 80) {
      return isDark ? 'text-green-400' : 'text-green-600';
    } else if (score >= 60) {
      return isDark ? 'text-blue-400' : 'text-blue-600';
    } else if (score >= 40) {
      return isDark ? 'text-yellow-400' : 'text-yellow-600';
    } else {
      return isDark ? 'text-red-400' : 'text-red-600';
    }
  };
  
  // Get trend icon based on trend
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') {
      return <TrendingUp className={`h-4 w-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />;
    } else if (trend === 'down') {
      return <TrendingDown className={`h-4 w-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />;
    } else {
      return <div className="h-4 w-4 border-t border-gray-400 mx-auto" />;
    }
  };
  
  // Get risk level color
  const getRiskLevelColor = (risk: 'low' | 'medium' | 'high') => {
    if (risk === 'low') {
      return isDark ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-800';
    } else if (risk === 'medium') {
      return isDark ? 'bg-yellow-900 text-yellow-100' : 'bg-yellow-100 text-yellow-800';
    } else {
      return isDark ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800';
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className={`p-4 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between">
            <div className="h-6 bg-gray-300 rounded w-1/3"></div>
            <div className="h-6 bg-gray-300 rounded w-1/4"></div>
          </div>
          <div className="h-32 bg-gray-300 rounded"></div>
          <div className="h-24 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  // Render no data state
  if (!healthData) {
    return (
      <div className={`p-4 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="text-center py-8">
          <AlertTriangle className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
          <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            No Health Score Available
          </h3>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            There isn't enough payment data to calculate a health score for this tenant.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Tenant Health Score
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Financial reliability assessment for {tenant.name}
          </p>
        </div>
        
        <div className="flex items-center">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(healthData.score)}`}>
              {healthData.score}
            </div>
            <div className="flex items-center justify-center mt-1">
              {getTrendIcon(healthData.trend)}
              <span className={`text-xs ml-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {healthData.trend === 'up' ? 'Improving' : 
                 healthData.trend === 'down' ? 'Declining' : 'Stable'}
              </span>
            </div>
          </div>
          
          <div className="ml-6">
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(healthData.riskLevel)}`}>
              {healthData.riskLevel === 'low' && <Check className="h-3 w-3 inline mr-1" />}
              {healthData.riskLevel === 'medium' && <AlertTriangle className="h-3 w-3 inline mr-1" />}
              {healthData.riskLevel === 'high' && <AlertTriangle className="h-3 w-3 inline mr-1" />}
              {healthData.riskLevel.charAt(0).toUpperCase() + healthData.riskLevel.slice(1)} Risk
            </span>
          </div>
        </div>
      </div>
      
      {/* Payment History Overview */}
      <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Payment History
          </h3>
          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Last {healthData.paymentHistory.total} payments
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-2">
          <div className="text-center">
            <div className={`text-2xl font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              {healthData.paymentHistory.onTime}
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              On Time
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-semibold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
              {healthData.paymentHistory.late}
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Late
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
              {healthData.paymentHistory.missed}
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Missed
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="flex h-2.5">
            <div 
              className="bg-green-500 h-2.5 rounded-l-full"
              style={{ 
                width: `${(healthData.paymentHistory.onTime / healthData.paymentHistory.total) * 100}%`,
                borderRadius: healthData.paymentHistory.late === 0 && healthData.paymentHistory.missed === 0 ? '9999px' : '9999px 0 0 9999px'
              }}
            ></div>
            <div 
              className="bg-yellow-500 h-2.5"
              style={{ 
                width: `${(healthData.paymentHistory.late / healthData.paymentHistory.total) * 100}%`,
                borderRadius: healthData.paymentHistory.onTime === 0 && healthData.paymentHistory.missed === 0 ? '9999px' : '0'
              }}
            ></div>
            <div 
              className="bg-red-500 h-2.5 rounded-r-full"
              style={{ 
                width: `${(healthData.paymentHistory.missed / healthData.paymentHistory.total) * 100}%`,
                borderRadius: healthData.paymentHistory.onTime === 0 && healthData.paymentHistory.late === 0 ? '9999px' : '0 9999px 9999px 0'
              }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Monthly Score Chart */}
      <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Payment Score Trend (6 Months)
          </h3>
          <div className="flex items-center">
            <BarChart3 className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
        </div>
        
        {/* Simple bar chart visualization */}
        <div className="flex items-end h-24 space-x-2">
          {healthData.monthlyScores.map((month, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className={`w-full rounded-t-sm ${
                  month.score >= 80 ? 'bg-green-500' :
                  month.score >= 60 ? 'bg-blue-500' :
                  month.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ height: `${Math.max(5, (month.score / 100) * 100)}%` }}
              ></div>
              <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {month.month}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Risk Factors */}
      <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Risk Factors
        </h3>
        <ul className="space-y-2">
          {healthData.riskFactors.map((factor, index) => (
            <li key={index} className="flex items-start">
              <AlertTriangle className={`h-4 w-4 mt-0.5 mr-2 ${
                healthData.riskFactors[0] === 'No risk factors identified'
                  ? isDark ? 'text-green-400' : 'text-green-600'
                  : isDark ? 'text-yellow-400' : 'text-yellow-600'
              }`} />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {factor}
              </span>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Recommendations */}
      <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Recommendations
        </h3>
        <div className="flex flex-wrap gap-2">
          {healthData.recommendations.map((recommendation, index) => (
            <button
              key={index}
              onClick={() => handleRecommendationClick(recommendation)}
              className={`px-3 py-1 text-xs rounded-full ${
                isDark
                  ? 'bg-blue-900 text-blue-100 hover:bg-blue-800'
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
            >
              {recommendation}
            </button>
          ))}
        </div>
      </div>
      
      {/* Detailed Scores - Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`w-full flex items-center justify-between p-3 rounded-lg ${
          isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
        }`}
      >
        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          View Score Details
        </span>
        {showDetails ? 
          <ChevronUp className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /> : 
          <ChevronDown className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        }
      </button>
      
      {/* Detailed Scores - Content */}
      {showDetails && (
        <div className={`mt-3 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center mb-1">
                <Check className={`h-4 w-4 mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Consistency Score
                </span>
                <HelpCircle className={`h-4 w-4 ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    healthData.details.consistencyScore >= 80 ? 'bg-green-500' :
                    healthData.details.consistencyScore >= 60 ? 'bg-blue-500' :
                    healthData.details.consistencyScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${healthData.details.consistencyScore}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {healthData.details.consistencyScore}/100
                </span>
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Weight: 40%
                </span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center mb-1">
                <Calendar className={`h-4 w-4 mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Timeliness Score
                </span>
                <HelpCircle className={`h-4 w-4 ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    healthData.details.timelinessScore >= 80 ? 'bg-green-500' :
                    healthData.details.timelinessScore >= 60 ? 'bg-blue-500' :
                    healthData.details.timelinessScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${healthData.details.timelinessScore}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {healthData.details.timelinessScore}/100
                </span>
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Weight: 30%
                </span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center mb-1">
                <BarChart3 className={`h-4 w-4 mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  History Length Score
                </span>
                <HelpCircle className={`h-4 w-4 ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    healthData.details.historyLengthScore >= 80 ? 'bg-green-500' :
                    healthData.details.historyLengthScore >= 60 ? 'bg-blue-500' :
                    healthData.details.historyLengthScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${healthData.details.historyLengthScore}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {healthData.details.historyLengthScore}/100
                </span>
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Weight: 10%
                </span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center mb-1">
                <CreditCard className={`h-4 w-4 mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Payment Method Score
                </span>
                <HelpCircle className={`h-4 w-4 ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    healthData.details.paymentMethodScore >= 80 ? 'bg-green-500' :
                    healthData.details.paymentMethodScore >= 60 ? 'bg-blue-500' :
                    healthData.details.paymentMethodScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${healthData.details.paymentMethodScore}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {healthData.details.paymentMethodScore}/100
                </span>
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Weight: 20%
                </span>
              </div>
            </div>
          </div>
          
          <div className={`mt-4 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>Score calculation combines payment consistency, timeliness, history length, and payment methods with different weights. Scores above 80 indicate low risk, 60-80 medium risk, and below 60 high risk.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthScoreModule; 