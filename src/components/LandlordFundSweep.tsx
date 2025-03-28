import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Building2, ArrowRight, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { Tenant } from '../services/mockData';

interface LandlordFundSweepProps {
  tenants: Tenant[];
  onSweepComplete: (sweepDetails: {
    totalAmount: number;
    tenantCount: number;
    timestamp: string;
  }) => void;
}

const LandlordFundSweep: React.FC<LandlordFundSweepProps> = ({
  tenants,
  onSweepComplete
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepDate, setSweepDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSweep = async () => {
    setIsSweeping(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const sweepDetails = {
        totalAmount: tenants.reduce((sum, tenant) => sum + tenant.wallet.balance, 0),
        tenantCount: tenants.length,
        timestamp: new Date().toISOString()
      };

      // In a real implementation, this would:
      // 1. Transfer funds from tenant wallets to landlord account
      // 2. Update tenant wallet balances
      // 3. Record the sweep transaction
      // 4. Send notifications to tenants
      
      onSweepComplete(sweepDetails);
    } catch (error) {
      console.error('Error during fund sweep:', error);
    } finally {
      setIsSweeping(false);
    }
  };

  const getNextSweepDate = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return nextMonth.toISOString().split('T')[0];
  };

  return (
    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Landlord Fund Sweep
        </h2>
        <div className="flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-blue-500" />
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Next sweep: {getNextSweepDate()}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Total Available Funds
              </h3>
            </div>
            <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${tenants.reduce((sum, tenant) => sum + tenant.wallet.balance, 0).toFixed(2)}
            </span>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            From {tenants.length} tenant wallets
          </p>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Sweep Schedule
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={sweepDate}
              onChange={(e) => setSweepDate(e.target.value)}
              className={`p-2 rounded-md border ${
                isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <button
              onClick={handleSweep}
              disabled={isSweeping}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
                isSweeping
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isSweeping ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sweeping...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>Initiate Sweep</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Important Notes
            </h3>
          </div>
          <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            <li>• Funds will be transferred to the landlord's bank account</li>
            <li>• Tenants will receive email notifications</li>
            <li>• Transaction history will be updated</li>
            <li>• This action cannot be undone</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LandlordFundSweep; 