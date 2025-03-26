import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  id: string;
}

interface Property {
  id: string;
  name: string;
  units: number;
  occupancy: number;
}

interface Tenant {
  id: string;
  name: string;
  unit: string;
  property: string;
  status: string;
  balance: number;
}

interface MoneyTransfer {
  fromTenantId: string;
  toTenantId: string;
  amount: number;
  date: Date;
  description: string;
}

interface InsightData {
  type: string;
  data: Record<string, number> | Array<{
    name: string;
    occupancy: number;
    vacantUnits: number;
  }>;
}

interface PropertyManagementAgentProps {
  apiKey: string;
  onInsightGenerated?: (insight: InsightData[]) => void;
}

const PropertyManagementAgent = ({ apiKey, onInsightGenerated }: PropertyManagementAgentProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [transfers, setTransfers] = useState<MoneyTransfer[]>([]);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [fromTenantId, setFromTenantId] = useState('');
  const [toTenantId, setToTenantId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDescription, setTransferDescription] = useState('');
  const [tenantsList, setTenantsList] = useState<Tenant[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const properties: Property[] = [
    { id: 'prop1', name: 'Sunset Apartments', units: 24, occupancy: 0.92 },
    { id: 'prop2', name: 'River Heights', units: 12, occupancy: 0.85 },
    { id: 'prop3', name: 'Mountain View Condos', units: 36, occupancy: 0.78 },
  ];
  
  useEffect(() => {
    setTenantsList([
      { id: 'ten1', name: 'John Smith', unit: '101', property: 'prop1', status: 'current', balance: 1200 },
      { id: 'ten2', name: 'Sarah Johnson', unit: '204', property: 'prop1', status: 'late', balance: 850 },
      { id: 'ten3', name: 'Mike Williams', unit: '103', property: 'prop2', status: 'current', balance: 2000 },
    ]);
  }, []);

  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  useEffect(() => {
    const initializeAgent = async () => {
      try {
        setIsInitialized(true);
        setMessages([
          {
            id: generateId(),
            role: 'assistant',
            content: 'Hello! I\'m your property management assistant. How can I help you today? You can transfer money between tenants or manage your properties.',
            timestamp: new Date()
          }
        ]);
      } catch (error) {
        console.error('Error initializing property management agent:', error instanceof Error ? error.message : String(error));
        setIsInitialized(true);
      }
    };
    
    initializeAgent();
  }, [apiKey]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    if (isInitialized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInitialized]);

  const handleMoneyTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fromTenantId || !toTenantId || !transferAmount || parseFloat(transferAmount) <= 0) {
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'Please fill in all fields correctly. Amount must be greater than 0.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const fromTenant = tenantsList.find(t => t.id === fromTenantId);
    const toTenant = tenantsList.find(t => t.id === toTenantId);
    
    if (!fromTenant || !toTenant) {
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'One or both tenants could not be found.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const amount = parseFloat(transferAmount);
    
    if (fromTenant.balance < amount) {
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: `Transfer failed. ${fromTenant.name} has insufficient funds (balance: $${fromTenant.balance.toFixed(2)}).`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const newTransfer: MoneyTransfer = {
      fromTenantId,
      toTenantId,
      amount,
      date: new Date(),
      description: transferDescription || 'Money transfer'
    };
    
    setTenantsList(prev => prev.map(tenant => {
      if (tenant.id === fromTenantId) {
        return { ...tenant, balance: tenant.balance - amount };
      }
      if (tenant.id === toTenantId) {
        return { ...tenant, balance: tenant.balance + amount };
      }
      return tenant;
    }));
    
    setTransfers(prev => [...prev, newTransfer]);
    
    const successMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: `Transfer complete! $${amount.toFixed(2)} sent from ${fromTenant.name} to ${toTenant.name}. Description: ${newTransfer.description}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, successMessage]);
    
    setShowTransferForm(false);
    setFromTenantId('');
    setToTenantId('');
    setTransferAmount('');
    setTransferDescription('');
  };

  const addNewTenant = (newTenantData: {name: string, unit: string, property: string}) => {
    const newTenant: Tenant = {
      id: `ten${Date.now()}`,
      name: newTenantData.name,
      unit: newTenantData.unit,
      property: newTenantData.property,
      status: 'current',
      balance: 0
    };
    
    setTenantsList(prev => [...prev, newTenant]);
    
    const successMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: `New tenant added: ${newTenant.name}, Unit ${newTenant.unit}`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, successMessage]);
    return newTenant;
  };

  const generateResponse = useCallback((userInput: string): string => {
    let responseContent = 'I couldn\'t find relevant information for your query.';
    
    const input = userInput.toLowerCase();
    
    if (input.includes('transfer') && (input.includes('money') || input.includes('funds') || input.includes('balance'))) {
      setShowTransferForm(true);
      return "I've opened the money transfer form for you. Please fill in the details to complete the transfer.";
    }
    
    if ((input.includes('add') || input.includes('new')) && input.includes('tenant')) {
      const nameMatch = userInput.match(/name[: ]+([\w\s]+)[\s,]/i);
      const unitMatch = userInput.match(/unit[: ]+(\w+)[\s,]/i);
      const propertyMatch = userInput.match(/property[: ]+([\w\s]+)[\s,]/i);
      
      if (nameMatch && unitMatch) {
        const name = nameMatch[1].trim();
        const unit = unitMatch[1].trim();
        const property = propertyMatch ? propertyMatch[1].trim() : 'prop1';
        
        const propertyId = properties.find(p => 
          p.name.toLowerCase() === property.toLowerCase()
        )?.id || 'prop1';
        
        const newTenant = addNewTenant({name, unit, property: propertyId});
        return `Added new tenant: ${newTenant.name} in Unit ${newTenant.unit}`;
      } else {
        return "To add a tenant, please provide their name and unit number. For example: 'Add new tenant name John Doe, unit 305, property Sunset Apartments'";
      }
    }
    
    if (input.includes('balance') && input.includes('tenant')) {
      const words = userInput.split(' ');
      const nameIndex = words.findIndex(w => w.toLowerCase() === 'tenant') + 1;
      
      if (nameIndex > 0 && nameIndex < words.length) {
        const possibleName = words.slice(nameIndex).join(' ').replace(/[.,?!]$/, '');
        const tenant = tenantsList.find(t => t.name.toLowerCase().includes(possibleName.toLowerCase()));
        
        if (tenant) {
          return `${tenant.name}'s current balance is $${tenant.balance.toFixed(2)}.`;
        }
      }
      
      return `Current tenant balances:\n${tenantsList.map(t => 
        `- ${t.name}: $${t.balance.toFixed(2)}`).join('\n')}`;
    }
    
    if (input.includes('property') || input.includes('properties')) {
      responseContent = `Here are our properties:\n${properties.map(p => 
        `- ${p.name}: ${p.units} units, ${Math.round(p.occupancy * 100)}% occupied`).join('\n')}`;
    } else if (input.includes('tenant') || input.includes('tenants')) {
      responseContent = `Here are the current tenants:\n${tenantsList.map(t => 
        `- ${t.name} (Unit ${t.unit}, Status: ${t.status})`).join('\n')}`;
    } else if (input.includes('occupancy')) {
      const avgOccupancy = properties.reduce((sum, p) => sum + p.occupancy, 0) / properties.length;
      responseContent = `Average occupancy across all properties is ${(avgOccupancy * 100).toFixed(1)}%`;
    } else if (input.includes('help')) {
      responseContent = `I can help you with:\n- Property information\n- Tenant details and management\n- Money transfers between tenants\n- Occupancy statistics\n\nTry asking about "properties", "tenants", "transfer money", or "add tenant".`;
    } else if (input.includes('transfer history') || input.includes('transaction')) {
      if (transfers.length === 0) {
        responseContent = "There are no transfers in the history yet.";
      } else {
        responseContent = `Transfer history:\n${transfers.map((t, index) => {
          const from = tenantsList.find(tenant => tenant.id === t.fromTenantId)?.name || 'Unknown';
          const to = tenantsList.find(tenant => tenant.id === t.toTenantId)?.name || 'Unknown';
          return `${index + 1}. $${t.amount.toFixed(2)} from ${from} to ${to} - ${t.description} (${t.date.toLocaleDateString()})`;
        }).join('\n')}`;
      }
    }
    
    return responseContent;
  }, [properties, tenantsList, transfers, showTransferForm]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    const currentInput = input;
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    try {
      setIsProcessing(true);
      
      setTimeout(() => {
        const responseContent = generateResponse(currentInput);
        
        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: responseContent,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setIsProcessing(false);
        
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
        
        if (onInsightGenerated) {
          if (currentInput.toLowerCase().includes('status')) {
            onInsightGenerated([
              {
                type: 'tenant_status',
                data: tenantsList.reduce((acc, t) => {
                  acc[t.status] = (acc[t.status] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              }
            ]);
          } else if (currentInput.toLowerCase().includes('occupancy')) {
            onInsightGenerated([
              {
                type: 'property_occupancy',
                data: properties.map(p => ({
                  name: p.name,
                  occupancy: p.occupancy,
                  vacantUnits: Math.round(p.units * (1 - p.occupancy))
                }))
              }
            ]);
          }
        }
      }, 500);
    } catch (error) {
      console.error('Error processing message:', error instanceof Error ? error.message : String(error));
      
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.',
        timestamp: new Date()
      }]);
      setIsProcessing(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isProcessing) {
        handleSendMessage(e);
      }
    }
  };

  const MoneyTransferForm = () => (
    <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
      <h3 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Money Transfer</h3>
      <form onSubmit={handleMoneyTransfer} className="space-y-3">
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>From Tenant</label>
          <select 
            value={fromTenantId} 
            onChange={(e) => setFromTenantId(e.target.value)}
            className={`w-full p-2 border rounded-md ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            required
          >
            <option value="">Select sender</option>
            {tenantsList.map(tenant => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name} - Unit {tenant.unit} (Balance: ${tenant.balance.toFixed(2)})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>To Tenant</label>
          <select 
            value={toTenantId} 
            onChange={(e) => setToTenantId(e.target.value)}
            className={`w-full p-2 border rounded-md ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            required
          >
            <option value="">Select recipient</option>
            {tenantsList.map(tenant => (
              <option key={tenant.id} value={tenant.id} disabled={tenant.id === fromTenantId}>
                {tenant.name} - Unit {tenant.unit}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Amount ($)</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            className={`w-full p-2 border rounded-md ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            required
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
          <input
            type="text"
            value={transferDescription}
            onChange={(e) => setTransferDescription(e.target.value)}
            placeholder="Rent payment, security deposit, etc."
            className={`w-full p-2 border rounded-md ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
          />
        </div>
        
        <div className="flex space-x-2 pt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Transfer
          </button>
          <button
            type="button"
            onClick={() => setShowTransferForm(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className={`rounded-lg shadow-md flex flex-col h-[600px] ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Property Management Assistant</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {showTransferForm && <MoneyTransferForm />}
        
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[75%] rounded-lg p-3 whitespace-pre-wrap ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : isDark 
                    ? 'bg-gray-700 text-gray-200' 
                    : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p>{message.content}</p>
              <div 
                className={`text-xs mt-1 ${
                  message.role === 'user' 
                    ? 'text-blue-200' 
                    : isDark 
                      ? 'text-gray-400' 
                      : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (try 'help' for suggestions)"
            className={`flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            disabled={isProcessing || !isInitialized}
            autoComplete="off"
          />
          <button
            onClick={handleSendMessage}
            disabled={isProcessing || !input.trim() || !isInitialized}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-700"
          >
            {isProcessing ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyManagementAgent; 