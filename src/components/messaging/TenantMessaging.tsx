import React, { useState } from 'react';
import { X, Send, Paperclip, MailWarning, Save } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Analytics from '../Analytics';

// Tenant interface
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

interface TenantMessagingProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  onSendMessage: (message: string, attachments: File[], tenant: Tenant) => void;
}

const TenantMessaging: React.FC<TenantMessagingProps> = ({
  isOpen,
  onClose,
  tenant,
  onSendMessage
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [message, setMessage] = useState<string>('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);

  // Predefined message templates
  const templates = [
    {
      title: "Rent Reminder",
      content: `Dear ${tenant.name},\n\nThis is a friendly reminder that your rent payment of $${tenant.rentAmount} is due on the 1st of next month.\n\nThank you for your prompt attention to this matter.\n\nBest regards,\nProperty Management`
    },
    {
      title: "Maintenance Notification",
      content: `Dear ${tenant.name},\n\nWe would like to inform you that our maintenance team will be performing routine inspections in your building on [DATE]. They may need access to your unit, and we appreciate your cooperation.\n\nThank you,\nProperty Management`
    },
    {
      title: "Late Payment Notice",
      content: `Dear ${tenant.name},\n\nOur records indicate that we have not yet received your rent payment of $${tenant.rentAmount} that was due on [DATE]. If you have already made the payment, please disregard this notice.\n\nPlease remit payment at your earliest convenience to avoid late fees.\n\nRegards,\nProperty Management`
    },
    {
      title: "Lease Renewal",
      content: `Dear ${tenant.name},\n\nYour current lease agreement will expire on ${tenant.leaseEnd}. We would like to offer you the opportunity to renew your lease.\n\nPlease contact our office at your earliest convenience to discuss renewal options.\n\nBest regards,\nProperty Management`
    }
  ];

  const handleClose = () => {
    setMessage('');
    setAttachments([]);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Add new files to existing attachments
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
      
      // Track the event
      Analytics.trackEvent('tenant_message_file_attached', {
        tenantId: tenant.id,
        fileCount: newFiles.length
      });
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleApplyTemplate = (templateContent: string) => {
    setMessage(templateContent);
  };

  const handleSubmit = () => {
    if (!message.trim() && attachments.length === 0) return;
    
    setIsSending(true);
    
    // In a real application, you would send this to an API
    setTimeout(() => {
      onSendMessage(message, attachments, tenant);
      
      // Track the event
      Analytics.trackEvent('tenant_message_sent', {
        tenantId: tenant.id,
        hasAttachments: attachments.length > 0
      });
      
      setIsSending(false);
      handleClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto`}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className={`absolute inset-0 ${isDark ? 'bg-gray-900' : 'bg-gray-500'} opacity-75`}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div 
          className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${
            isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}
        >
          <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium">
                    Message to {tenant.name}
                  </h3>
                  <button
                    type="button"
                    className={`rounded-md p-1 inline-flex items-center justify-center ${
                      isDark 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                    } focus:outline-none`}
                    onClick={handleClose}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mb-4">
                  <div className={`p-3 rounded-md ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className="text-sm"><strong>Unit:</strong> {tenant.unit}</p>
                    <p className="text-sm"><strong>Email:</strong> {tenant.email}</p>
                    <p className="text-sm"><strong>Phone:</strong> {tenant.phone}</p>
                  </div>
                </div>
                
                <div className={`p-3 mb-4 rounded-md border ${
                  isDark ? 'border-yellow-600 bg-yellow-900/30 text-yellow-200' : 'border-yellow-200 bg-yellow-50 text-yellow-800'
                }`}>
                  <div className="flex items-start">
                    <MailWarning className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">
                      <strong>Important:</strong> All messages sent will be logged and added to the tenant's communication history.
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Message Templates
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {templates.map((template, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleApplyTemplate(template.content)}
                        className={`px-3 py-1 text-xs rounded-full ${
                          isDark
                            ? 'bg-blue-900 text-blue-200 hover:bg-blue-800'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        {template.title}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('')}
                      className={`px-3 py-1 text-xs rounded-full ${
                        isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="message" className="block text-sm font-medium mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    className={`shadow-sm block w-full sm:text-sm border rounded-md p-2 ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Attachments
                  </label>
                  <div className="flex flex-col space-y-2">
                    {attachments.length > 0 && (
                      <div className={`p-3 rounded-md mb-2 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <p className="text-sm font-medium mb-2">Attached Files:</p>
                        <ul className="space-y-1">
                          {attachments.map((file, index) => (
                            <li key={index} className="flex justify-between items-center">
                              <span className="text-sm truncate">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveAttachment(index)}
                                className={`ml-2 ${
                                  isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'
                                }`}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <label
                      htmlFor="file-upload"
                      className={`cursor-pointer inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500'
                      }`}
                    >
                      <Paperclip className="h-4 w-4 mr-2" />
                      Attach Files
                    </label>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${isDark ? 'border-t border-gray-700' : 'bg-gray-50'}`}>
            <button
              type="button"
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium sm:ml-3 sm:w-auto sm:text-sm ${
                message.trim() || attachments.length > 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : isDark
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={handleSubmit}
              disabled={(!message.trim() && attachments.length === 0) || isSending}
            >
              {isSending ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </button>
            <button
              type="button"
              className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                isDark
                  ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => {
                // Optional: Save as draft functionality could be implemented here
                Analytics.trackEvent('tenant_message_saved_draft', {
                  tenantId: tenant.id
                });
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </button>
            <button
              type="button"
              className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium sm:mt-0 sm:w-auto sm:text-sm ${
                isDark
                  ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={handleClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantMessaging; 