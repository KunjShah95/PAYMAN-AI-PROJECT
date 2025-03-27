import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { User, Mail, Phone, MapPin, Building2, CreditCard, Calendar } from 'lucide-react';
import Analytics from './Analytics';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  role: string;
  joinDate: string;
}

function Profile() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [profile, setProfile] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Ave, Suite 100, San Francisco, CA 94107',
    company: 'Property Management Inc.',
    role: 'Property Manager',
    joinDate: '2023-01-15',
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    Analytics.trackEvent('profile_updated', { fields: Object.keys(profile) });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Profile</h2>
        <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage your personal information and preferences
        </p>
      </div>

      <div className="p-4">
        {/* Profile Header */}
        <div className="flex items-center mb-6">
          <div className={`w-20 h-20 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
            <User className={`w-12 h-12 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
          </div>
          <div className="ml-4">
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`rounded-md border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              ) : (
                profile.name
              )}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{profile.role}</p>
          </div>
        </div>

        {/* Profile Information */}
        <div className="space-y-4">
          <div className="flex items-center">
            <Mail className={`w-5 h-5 mr-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <div className="flex-1">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`mt-1 block w-full rounded-md border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              ) : (
                <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{profile.email}</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <Phone className={`w-5 h-5 mr-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <div className="flex-1">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`mt-1 block w-full rounded-md border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              ) : (
                <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{profile.phone}</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <MapPin className={`w-5 h-5 mr-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <div className="flex-1">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Address
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`mt-1 block w-full rounded-md border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              ) : (
                <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{profile.address}</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <Building2 className={`w-5 h-5 mr-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <div className="flex-1">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Company
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className={`mt-1 block w-full rounded-md border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              ) : (
                <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{profile.company}</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <Calendar className={`w-5 h-5 mr-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <div className="flex-1">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Member Since
              </label>
              <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {formatDate(profile.joinDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className={`px-4 py-2 rounded-md ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile; 