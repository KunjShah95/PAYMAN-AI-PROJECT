import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Bell, AlertTriangle, Calendar, Check, X, Clock, Info, Home, DollarSign, Wrench, Filter, ChevronDown, Users, Trash2 } from 'lucide-react';
import Analytics from './Analytics';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'payment' | 'maintenance' | 'lease' | 'system';
  priority: 'high' | 'medium' | 'low';
  date: string;
  read: boolean;
  actions?: {
    label: string;
    action: string;
  }[];
  relatedEntityId?: string;
  relatedEntityType?: 'tenant' | 'property' | 'payment';
  metadata?: Record<string, any>;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onNotificationRead?: (id: string) => void;
  onNotificationAction?: (id: string, action: string) => void;
  onNotificationsClear?: () => void;
  onNotificationDismiss?: (id: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onNotificationRead,
  onNotificationAction,
  onNotificationsClear,
  onNotificationDismiss
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>(notifications);
  
  // Track component mount
  useEffect(() => {
    Analytics.trackPageView('notification_system_view');
  }, []);
  
  // Update filtered notifications when notifications change or filter changes
  useEffect(() => {
    if (!activeFilter) {
      setFilteredNotifications(notifications);
      return;
    }
    
    const filtered = notifications.filter(notification => notification.type === activeFilter);
    setFilteredNotifications(filtered);
  }, [notifications, activeFilter]);
  
  // Get unread notifications count
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  // Handle notification bell click
  const handleBellClick = () => {
    setIsOpen(!isOpen);
    
    // Track notification panel toggle
    Analytics.trackEvent('notification_panel_toggled', {
      state: !isOpen ? 'opened' : 'closed',
      unreadCount
    });
  };
  
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (onNotificationRead && !notification.read) {
      onNotificationRead(notification.id);
      
      // Track notification read
      Analytics.trackEvent('notification_read', {
        notificationId: notification.id,
        notificationType: notification.type,
        priority: notification.priority
      });
    }
  };
  
  // Handle notification action
  const handleAction = (notificationId: string, action: string) => {
    if (onNotificationAction) {
      onNotificationAction(notificationId, action);
      
      // Track notification action
      Analytics.trackEvent('notification_action_clicked', {
        notificationId,
        action
      });
    }
  };
  
  // Handle clear all notifications
  const handleClearAll = () => {
    if (onNotificationsClear) {
      onNotificationsClear();
      
      // Track clear all notifications
      Analytics.trackEvent('notifications_cleared', {
        count: notifications.length
      });
    }
  };
  
  // Handle dismiss notification
  const handleDismiss = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    
    if (onNotificationDismiss) {
      onNotificationDismiss(notificationId);
      
      // Track notification dismissed
      Analytics.trackEvent('notification_dismissed', {
        notificationId
      });
    }
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type: string, priority: string) => {
    switch (type) {
      case 'payment':
        return <DollarSign className={`h-5 w-5 ${getIconColor(priority)}`} />;
      case 'maintenance':
        return <Wrench className={`h-5 w-5 ${getIconColor(priority)}`} />;
      case 'lease':
        return <Calendar className={`h-5 w-5 ${getIconColor(priority)}`} />;
      case 'system':
        return <Info className={`h-5 w-5 ${getIconColor(priority)}`} />;
      default:
        return <AlertTriangle className={`h-5 w-5 ${getIconColor(priority)}`} />;
    }
  };
  
  // Get color for priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return isDark ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return isDark ? 'bg-yellow-900 border-yellow-700 text-yellow-200' : 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return isDark ? 'bg-green-900 border-green-700 text-green-200' : 'bg-green-50 border-green-200 text-green-800';
      default:
        return isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-800';
    }
  };
  
  // Get icon color based on priority
  const getIconColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return isDark ? 'text-red-400' : 'text-red-600';
      case 'medium':
        return isDark ? 'text-yellow-400' : 'text-yellow-600';
      case 'low':
        return isDark ? 'text-green-400' : 'text-green-600';
      default:
        return isDark ? 'text-gray-400' : 'text-gray-600';
    }
  };
  
  // Format date to relative time (e.g., "2 hours ago")
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={handleBellClick}
        className={`relative p-2 rounded-full ${
          isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
        }`}
        aria-label="Notifications"
      >
        <Bell className={`h-6 w-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
        
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Notification Panel */}
      {isOpen && (
        <div 
          className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-lg shadow-lg z-50 overflow-hidden ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}
        >
          {/* Notification Header */}
          <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Notifications
              </h3>
              <button 
                onClick={handleClearAll}
                className={`text-xs ${
                  isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Clear all
              </button>
            </div>
            
            {/* Notification Filters */}
            <div className="flex space-x-2 mt-3">
              <button
                onClick={() => setActiveFilter(null)}
                className={`px-2 py-1 text-xs rounded-full ${
                  activeFilter === null
                    ? isDark 
                      ? 'bg-blue-900 text-blue-100' 
                      : 'bg-blue-100 text-blue-800'
                    : isDark 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              
              <button
                onClick={() => setActiveFilter('payment')}
                className={`px-2 py-1 text-xs rounded-full ${
                  activeFilter === 'payment'
                    ? isDark 
                      ? 'bg-blue-900 text-blue-100' 
                      : 'bg-blue-100 text-blue-800'
                    : isDark 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <DollarSign className="h-3 w-3 inline mr-1" />
                Payments
              </button>
              
              <button
                onClick={() => setActiveFilter('maintenance')}
                className={`px-2 py-1 text-xs rounded-full ${
                  activeFilter === 'maintenance'
                    ? isDark 
                      ? 'bg-blue-900 text-blue-100' 
                      : 'bg-blue-100 text-blue-800'
                    : isDark 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Wrench className="h-3 w-3 inline mr-1" />
                Maintenance
              </button>
              
              <button
                onClick={() => setActiveFilter('lease')}
                className={`px-2 py-1 text-xs rounded-full ${
                  activeFilter === 'lease'
                    ? isDark 
                      ? 'bg-blue-900 text-blue-100' 
                      : 'bg-blue-100 text-blue-800'
                    : isDark 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Calendar className="h-3 w-3 inline mr-1" />
                Leases
              </button>
            </div>
          </div>
          
          {/* Notification List */}
          <div 
            className={`max-h-96 overflow-y-auto ${
              isDark ? 'scrollbar-dark' : 'scrollbar-light'
            }`}
          >
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className={`h-12 w-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No notifications to display
                </p>
                {activeFilter && (
                  <button
                    onClick={() => setActiveFilter(null)}
                    className={`mt-2 text-xs ${
                      isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b cursor-pointer hover:opacity-80 ${
                    notification.read 
                      ? isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white' 
                      : isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-blue-50'
                  }`}
                >
                  <div className="flex">
                    <div className="flex-shrink-0 mr-3">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className={`text-sm font-medium mb-1 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h4>
                        
                        <button
                          onClick={(e) => handleDismiss(e, notification.id)}
                          className={`ml-2 p-1 rounded-full hover:bg-gray-200 ${
                            isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                          }`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <p className={`text-xs mb-2 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex space-x-2">
                          {notification.actions && notification.actions.map((action, index) => (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAction(notification.id, action.action);
                              }}
                              className={`px-2 py-1 text-xs rounded ${
                                isDark 
                                  ? 'bg-blue-900 text-blue-100 hover:bg-blue-800' 
                                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              }`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                        
                        <span className={`text-xs flex items-center ${
                          isDark ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          <Clock className="h-3 w-3 mr-1" />
                          {formatRelativeTime(notification.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Notification Footer */}
          <div className={`p-3 text-center border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => setIsOpen(false)}
              className={`text-xs ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Additional component for NotificationGenerator
interface NotificationGeneratorProps {
  tenants: any[];
  properties: any[];
  payments: any[];
  onGenerateNotification: (notification: Notification) => void;
}

export const NotificationGenerator: React.FC<NotificationGeneratorProps> = ({
  tenants,
  properties,
  payments,
  onGenerateNotification
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  useEffect(() => {
    // This would typically be a scheduled job or trigger-based
    // For demo purposes, we're simulating it running on component mount
    generateSystemNotifications();
  }, []);
  
  // Generate automated notifications based on system events and data analysis
  const generateSystemNotifications = () => {
    // Check for upcoming lease expirations (within 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    // This would be handled by a backend service in a real application
    // For demo purposes, we're simulating it here
    
    // Example: Lease expiration notifications
    tenants.forEach(tenant => {
      if (tenant.leaseEnd) {
        const leaseEndDate = new Date(tenant.leaseEnd);
        
        if (leaseEndDate > now && leaseEndDate < thirtyDaysFromNow) {
          const daysUntilExpiration = Math.ceil((leaseEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          const notification: Notification = {
            id: `lease-exp-${tenant.id}-${Date.now()}`,
            title: `Lease Expiring Soon: ${tenant.name}`,
            message: `Lease for ${tenant.name} expires in ${daysUntilExpiration} days on ${leaseEndDate.toLocaleDateString()}. Action required.`,
            type: 'lease',
            priority: daysUntilExpiration <= 7 ? 'high' : 'medium',
            date: new Date().toISOString(),
            read: false,
            actions: [
              { label: 'Contact Tenant', action: 'contact_tenant' },
              { label: 'Prepare Renewal', action: 'prepare_renewal' }
            ],
            relatedEntityId: tenant.id,
            relatedEntityType: 'tenant'
          };
          
          onGenerateNotification(notification);
          
          // Track notification generated
          Analytics.trackEvent('notification_generated', {
            type: 'lease_expiration',
            tenantId: tenant.id,
            daysUntilExpiration
          });
        }
      }
    });
    
    // Example: Late payment notifications
    payments.forEach(payment => {
      if (payment.status === 'overdue' && !payment.notificationSent) {
        const tenant = tenants.find(t => t.id === payment.tenantId);
        
        if (tenant) {
          const notification: Notification = {
            id: `payment-late-${payment.id}-${Date.now()}`,
            title: `Late Payment: ${tenant.name}`,
            message: `Payment of $${payment.amount} from ${tenant.name} is overdue since ${new Date(payment.date).toLocaleDateString()}.`,
            type: 'payment',
            priority: 'high',
            date: new Date().toISOString(),
            read: false,
            actions: [
              { label: 'Send Reminder', action: 'send_reminder' },
              { label: 'Call Tenant', action: 'call_tenant' }
            ],
            relatedEntityId: payment.id,
            relatedEntityType: 'payment',
            metadata: { 
              amount: payment.amount,
              daysLate: Math.ceil((now.getTime() - new Date(payment.date).getTime()) / (1000 * 60 * 60 * 24))
            }
          };
          
          onGenerateNotification(notification);
          
          // Track notification generated
          Analytics.trackEvent('notification_generated', {
            type: 'late_payment',
            paymentId: payment.id,
            tenantId: tenant.id,
            amount: payment.amount
          });
        }
      }
    });
    
    // Example: Maintenance request status updates
    properties.forEach(property => {
      if (property.maintenanceRequests) {
        property.maintenanceRequests.forEach((request: any) => {
          if (request.status === 'pending' && !request.notificationSent) {
            const notification: Notification = {
              id: `maintenance-${request.id}-${Date.now()}`,
              title: `Maintenance Request: ${property.name}`,
              message: `New maintenance request for ${property.name}: "${request.description}". Priority: ${request.priority}.`,
              type: 'maintenance',
              priority: request.priority === 'emergency' ? 'high' : 
                      request.priority === 'urgent' ? 'medium' : 'low',
              date: new Date().toISOString(),
              read: false,
              actions: [
                { label: 'Assign Vendor', action: 'assign_vendor' },
                { label: 'View Details', action: 'view_details' }
              ],
              relatedEntityId: property.id,
              relatedEntityType: 'property',
              metadata: {
                requestId: request.id,
                description: request.description,
                reportedDate: request.createdAt
              }
            };
            
            onGenerateNotification(notification);
            
            // Track notification generated
            Analytics.trackEvent('notification_generated', {
              type: 'maintenance_request',
              propertyId: property.id,
              requestId: request.id,
              priority: request.priority
            });
          }
        });
      }
    });
  };
  
  return null; // This is a utility component that doesn't render anything
};

export default NotificationSystem; 