import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Bell, Lock, CreditCard, Globe, Shield, User, Mail, Database } from 'lucide-react';
import Analytics from './Analytics';

interface NotificationSettings {
  emailNotifications: boolean;
  paymentReminders: boolean;
  maintenanceUpdates: boolean;
  leaseRenewalReminders: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  loginNotifications: boolean;
  sessionTimeout: number;
}

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    paymentReminders: true,
    maintenanceUpdates: true,
    leaseRenewalReminders: true,
  });
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    loginNotifications: true,
    sessionTimeout: 30,
  });

  const handleNotificationChange = (setting: keyof NotificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    Analytics.trackEvent('settings_updated', { setting: 'notification', value: !notificationSettings[setting] });
  };

  const handleSecurityChange = (setting: keyof SecuritySettings, value: boolean | number) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: value
    }));
    Analytics.trackEvent('settings_updated', { setting: 'security', value });
  };

  return (
    <div className={`rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Settings</h2>
        <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage your account settings and preferences
        </p>
      </div>

      <div className="p-4">
        {/* Notifications Section */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Bell className={`h-5 w-5 mr-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Notifications</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(notificationSettings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
                <button
                  onClick={() => handleNotificationChange(key as keyof NotificationSettings)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    value ? 'bg-blue-600' : isDark ? 'bg-gray-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security Section */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Shield className={`h-5 w-5 mr-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Security</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Two-Factor Authentication</label>
              <button
                onClick={() => handleSecurityChange('twoFactorAuth', !securitySettings.twoFactorAuth)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  securitySettings.twoFactorAuth ? 'bg-blue-600' : isDark ? 'bg-gray-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    securitySettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Login Notifications</label>
              <button
                onClick={() => handleSecurityChange('loginNotifications', !securitySettings.loginNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  securitySettings.loginNotifications ? 'bg-blue-600' : isDark ? 'bg-gray-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    securitySettings.loginNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Session Timeout (minutes)</label>
              <select
                value={securitySettings.sessionTimeout}
                onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                className={`ml-2 rounded-md border ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="60">60</option>
                <option value="120">120</option>
              </select>
            </div>
          </div>
        </div>

        {/* Theme Section */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Globe className={`h-5 w-5 mr-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Appearance</h3>
          </div>
          <div className="flex items-center justify-between">
            <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Dark Mode</label>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                isDark ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  isDark ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            className={`px-4 py-2 rounded-md ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            onClick={() => {
              Analytics.trackEvent('settings_saved', {
                notifications: notificationSettings,
                security: securitySettings,
                theme: isDark ? 'dark' : 'light'
              });
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 