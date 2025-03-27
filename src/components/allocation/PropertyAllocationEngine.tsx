import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Building2, Users, Filter, Check, X, MoveRight, AlertCircle } from 'lucide-react';
import Analytics from '../Analytics';

interface Property {
  id: string;
  name: string;
  address: string;
  type: 'apartment' | 'house' | 'condo' | 'townhouse';
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  rentAmount: number;
  availableFrom: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  features: string[];
  image?: string;
}

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  currentUnit?: string;
  desiredMoveInDate?: string;
  preferredLocation?: string;
  minBedrooms?: number;
  maxRent?: number;
  preferences?: string[];
  status: 'active' | 'inactive' | 'pending';
  matchScore?: number;
}

interface PropertyAllocationEngineProps {
  properties: Property[];
  tenants: Tenant[];
  onAllocate: (allocation: { propertyId: string; tenantId: string; score: number }) => void;
}

const PropertyAllocationEngine: React.FC<PropertyAllocationEngineProps> = ({ 
  properties, 
  tenants,
  onAllocate 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [propertyFilters, setPropertyFilters] = useState({
    status: 'available',
    minBedrooms: 0,
    maxRent: 10000,
  });
  const [tenantFilters, setTenantFilters] = useState({
    status: 'active',
    needsHousing: false,
  });
  const [matches, setMatches] = useState<{property: Property; tenants: (Tenant & {matchScore: number})[]}[]>([]);
  const [showMatchingResults, setShowMatchingResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Track component mount
  useEffect(() => {
    Analytics.trackPageView('property_allocation_engine');
  }, []);

  // Filter properties based on filters
  useEffect(() => {
    const filtered = properties.filter(property => {
      const matchesStatus = propertyFilters.status === 'all' || property.status === propertyFilters.status;
      const matchesBedrooms = property.bedrooms >= propertyFilters.minBedrooms;
      const matchesRent = property.rentAmount <= propertyFilters.maxRent;
      
      return matchesStatus && matchesBedrooms && matchesRent;
    });
    setFilteredProperties(filtered);
  }, [properties, propertyFilters]);

  // Filter tenants based on filters
  useEffect(() => {
    const filtered = tenants.filter(tenant => {
      const matchesStatus = tenantFilters.status === 'all' || tenant.status === tenantFilters.status;
      const matchesHousing = !tenantFilters.needsHousing || !tenant.currentUnit;
      
      return matchesStatus && matchesHousing;
    });
    setFilteredTenants(filtered);
  }, [tenants, tenantFilters]);

  // Calculate match score between a property and tenant
  const calculateMatchScore = (property: Property | null, tenant: Tenant | null): number => {
    if (!property || !tenant) return 0;
    
    let score = 0;
    const maxScore = 100;
    
    // Basic compatibility checks (these are deal breakers)
    if (tenant.maxRent && property.rentAmount > tenant.maxRent) {
      return 0; // Tenant can't afford this property
    }
    
    if (tenant.minBedrooms && property.bedrooms < tenant.minBedrooms) {
      return 0; // Not enough bedrooms
    }
    
    // Location preference (30% weight)
    if (tenant.preferredLocation && property.address.toLowerCase().includes(tenant.preferredLocation.toLowerCase())) {
      score += 30;
    }
    
    // Budget match (25% weight)
    if (tenant.maxRent) {
      const budgetRatio = 1 - (property.rentAmount / tenant.maxRent);
      score += Math.round(Math.min(budgetRatio * 25, 25));
    } else {
      score += 15; // Mid-range score if no budget specified
    }
    
    // Size match based on bedrooms (20% weight)
    if (tenant.minBedrooms) {
      const extraBedrooms = property.bedrooms - tenant.minBedrooms;
      if (extraBedrooms === 0) score += 20;
      else if (extraBedrooms === 1) score += 15;
      else if (extraBedrooms >= 2) score += 10;
    } else {
      score += 10;
    }
    
    // Feature matches (25% weight)
    if (tenant.preferences && tenant.preferences.length > 0 && property.features.length > 0) {
      const matchingFeatures = property.features.filter(feature => 
        tenant.preferences!.includes(feature)
      );
      
      score += Math.round((matchingFeatures.length / tenant.preferences.length) * 25);
    } else {
      score += 15; // Mid-range score if no preferences specified
    }
    
    return Math.min(score, maxScore);
  };

  // Run automatic matching
  const runAutoMatch = () => {
    setIsLoading(true);
    
    // Log the event
    Analytics.trackEvent('run_auto_match', {
      propertiesCount: filteredProperties.length,
      tenantsCount: filteredTenants.length
    });
    
    // Simulate a processing delay for UX
    setTimeout(() => {
      const propertyMatches = filteredProperties.map(property => {
        const matchedTenants = filteredTenants
          .map(tenant => {
            const matchScore = calculateMatchScore(property, tenant);
            return { ...tenant, matchScore };
          })
          .filter(tenant => tenant.matchScore > 40) // Only include reasonable matches
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 5); // Show top 5 matches per property
        
        return {
          property,
          tenants: matchedTenants
        };
      }).filter(match => match.tenants.length > 0);
      
      setMatches(propertyMatches);
      setShowMatchingResults(true);
      setIsLoading(false);
    }, 1500);
  };

  // Handle manual allocation
  const handleAllocate = () => {
    if (!selectedProperty || !selectedTenant) return;
    
    const matchScore = calculateMatchScore(selectedProperty, selectedTenant);
    
    onAllocate({
      propertyId: selectedProperty.id,
      tenantId: selectedTenant.id,
      score: matchScore
    });
    
    // Log the event
    Analytics.trackEvent('manual_property_allocation', {
      propertyId: selectedProperty.id,
      tenantId: selectedTenant.id,
      matchScore
    });
    
    // Reset selection
    setSelectedProperty(null);
    setSelectedTenant(null);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className={`rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'} overflow-hidden`}>
      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Property Allocation Engine</h2>
        <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Match tenants with properties based on preferences and requirements
        </p>
      </div>

      <div className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Manual matching panel */}
          <div className="flex-1">
            <div className="flex items-center mb-4">
              <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Manual Matching</h3>
            </div>

            <div className="mb-6">
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Select Property
              </label>
              <select
                className={`w-full py-2 px-3 rounded-md border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                value={selectedProperty?.id || ''}
                onChange={(e) => {
                  const property = filteredProperties.find(p => p.id === e.target.value);
                  setSelectedProperty(property || null);
                }}
              >
                <option value="">Select a property...</option>
                {filteredProperties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.name} - {property.bedrooms}BR - {formatCurrency(property.rentAmount)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Select Tenant
              </label>
              <select
                className={`w-full py-2 px-3 rounded-md border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                value={selectedTenant?.id || ''}
                onChange={(e) => {
                  const tenant = filteredTenants.find(t => t.id === e.target.value);
                  setSelectedTenant(tenant || null);
                }}
              >
                <option value="">Select a tenant...</option>
                {filteredTenants.map(tenant => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} {tenant.minBedrooms ? `- ${tenant.minBedrooms}+ BR` : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedProperty && selectedTenant && (
              <div className={`p-4 rounded-md mb-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <h4 className={`text-md font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Match Score</h4>
                
                <div className="flex items-center mb-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${calculateMatchScore(selectedProperty, selectedTenant)}%` }}
                    ></div>
                  </div>
                  <span className={`ml-2 text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {calculateMatchScore(selectedProperty, selectedTenant)}%
                  </span>
                </div>
                
                <div className="flex items-center">
                  {calculateMatchScore(selectedProperty, selectedTenant) > 80 ? (
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                  ) : calculateMatchScore(selectedProperty, selectedTenant) > 40 ? (
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                  ) : (
                    <X className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {calculateMatchScore(selectedProperty, selectedTenant) > 80
                      ? 'Excellent match! This property meets all the tenant\'s criteria.'
                      : calculateMatchScore(selectedProperty, selectedTenant) > 40
                      ? 'Average match. Some preferences may not be met.'
                      : 'Poor match. Consider finding another property.'}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleAllocate}
              disabled={!selectedProperty || !selectedTenant}
              className={`w-full py-2 px-4 rounded-md ${
                !selectedProperty || !selectedTenant
                  ? `${isDark ? 'bg-gray-600' : 'bg-gray-300'} cursor-not-allowed`
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Allocate Property
            </button>
          </div>

          {/* Auto-matching panel */}
          <div className="flex-1">
            <div className="flex items-center mb-4">
              <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Auto Matching</h3>
            </div>

            <div className="mb-4">
              <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800' : 'bg-blue-50'}`}>
                <div className="flex">
                  <Filter className={`h-5 w-5 mr-2 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                  <div>
                    <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'} mb-1`}>
                      Current Filters
                    </h4>
                    <ul className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <li>Properties: {propertyFilters.status} with {propertyFilters.minBedrooms}+ bedrooms, max ${propertyFilters.maxRent}</li>
                      <li>Tenants: {tenantFilters.status}{tenantFilters.needsHousing ? ', needs housing' : ''}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center">
                <Building2 className={`h-5 w-5 mr-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {filteredProperties.length} Properties
                </span>
              </div>
              <div className={`text-center sm:mx-2 sm:px-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>•</div>
              <div className="flex items-center">
                <Users className={`h-5 w-5 mr-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {filteredTenants.length} Tenants
                </span>
              </div>
            </div>

            <button
              onClick={runAutoMatch}
              disabled={isLoading || filteredProperties.length === 0 || filteredTenants.length === 0}
              className={`w-full py-2 px-4 rounded-md ${
                isLoading || filteredProperties.length === 0 || filteredTenants.length === 0
                  ? `${isDark ? 'bg-gray-600' : 'bg-gray-300'} cursor-not-allowed`
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isLoading ? 'Processing...' : 'Run Auto Matching'}
            </button>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setPropertyFilters({
                    status: 'available',
                    minBedrooms: 0,
                    maxRent: 10000,
                  });
                  setTenantFilters({
                    status: 'active',
                    needsHousing: false,
                  });
                }}
                className={`text-sm ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Matching results */}
        {showMatchingResults && !isLoading && (
          <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Matching Results
            </h3>
            
            {matches.length > 0 ? (
              <div className="space-y-4">
                {matches.map((match, index) => (
                  <div key={index} className={`p-4 rounded-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {match.property.name}
                      </h4>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {match.property.bedrooms} BR | {formatCurrency(match.property.rentAmount)}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {match.tenants.map((tenant, tIndex) => (
                        <div 
                          key={tIndex} 
                          className={`flex items-center justify-between px-3 py-2 rounded ${
                            isDark 
                              ? tIndex === 0 ? 'bg-blue-900' : 'bg-gray-700'
                              : tIndex === 0 ? 'bg-blue-50' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center">
                            {tIndex === 0 && (
                              <div className={`mr-2 px-1.5 py-0.5 rounded text-xs font-medium ${
                                isDark ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800'
                              }`}>
                                Best Match
                              </div>
                            )}
                            <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {tenant.name}
                            </span>
                          </div>
                          
                          <div className="flex items-center">
                            <span className={`text-sm font-medium ${
                              tenant.matchScore > 80
                                ? isDark ? 'text-green-400' : 'text-green-600'
                                : tenant.matchScore > 40
                                  ? isDark ? 'text-yellow-400' : 'text-yellow-600'
                                  : isDark ? 'text-red-400' : 'text-red-600'
                            }`}>
                              {tenant.matchScore}%
                            </span>
                            <button 
                              onClick={() => {
                                onAllocate({
                                  propertyId: match.property.id,
                                  tenantId: tenant.id,
                                  score: tenant.matchScore
                                });
                                
                                Analytics.trackEvent('auto_match_allocation', {
                                  propertyId: match.property.id,
                                  tenantId: tenant.id,
                                  matchScore: tenant.matchScore
                                });
                              }}
                              className={`ml-3 p-1 rounded-full ${
                                isDark 
                                  ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                              title="Allocate"
                            >
                              <MoveRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No matching results found. Try adjusting your filters.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyAllocationEngine; 