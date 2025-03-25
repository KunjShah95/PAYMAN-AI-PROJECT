import { useState, useEffect, useRef, useCallback } from 'react';

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
  const [agent, setAgent] = useState<{
    id: string;
    name: string;
    type: string;
    status: string;
    createdAt: string;
  } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Sample property data - in a real app, this would come from an API or database
  const properties: Property[] = [
    { id: 'prop1', name: 'Sunset Apartments', units: 24, occupancy: 0.92 },
    { id: 'prop2', name: 'River Heights', units: 12, occupancy: 0.85 },
    { id: 'prop3', name: 'Mountain View Condos', units: 36, occupancy: 0.78 },
  ];
  
  const tenants: Tenant[] = [
    { id: 'ten1', name: 'John Smith', unit: '101', property: 'prop1', status: 'current' },
    { id: 'ten2', name: 'Sarah Johnson', unit: '204', property: 'prop1', status: 'late' },
    { id: 'ten3', name: 'Mike Williams', unit: '103', property: 'prop2', status: 'current' },
  ];

  // Generate a unique ID for messages
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  useEffect(() => {
    const initializeAgent = async () => {
      try {
        // Instead of creating a real payee which could fail, we'll simulate a successful agent
        // initialization for demonstration purposes
        const dummyAgent = {
          id: 'pm-agent-001',
          name: 'Property Manager',
          type: 'US_ACH',
          status: 'active',
          createdAt: new Date().toISOString()
        };
        
        setAgent(dummyAgent);
        setIsInitialized(true);
        
        // Add initial system message
        setMessages([
          {
            id: generateId(),
            role: 'assistant',
            content: 'Hello! I\'m your property management assistant. How can I help you today?',
            timestamp: new Date()
          }
        ]);
      } catch (error) {
        console.error('Error initializing property management agent:', error instanceof Error ? error.message : String(error));
        // Even if there's an error, set isInitialized so the UI isn't blocked
        setIsInitialized(true);
      }
    };
    
    initializeAgent();
  }, [apiKey]);
  
  useEffect(() => {
    // Scroll to bottom of messages when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input field when component mounts or initialization changes
  useEffect(() => {
    if (isInitialized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInitialized]);

  // Memoize the response generation to avoid recreation on every render
  const generateResponse = useCallback((userInput: string): string => {
    // Simulate response with tenant data
    let responseContent = 'I couldn\'t find relevant information for your query.';
    
    // Simple keyword matching to demonstrate properties and tenant data usage
    if (userInput.toLowerCase().includes('property') || userInput.toLowerCase().includes('properties')) {
      responseContent = `Here are our properties:\n${properties.map(p => 
        `- ${p.name}: ${p.units} units, ${Math.round(p.occupancy * 100)}% occupied`).join('\n')}`;
    } else if (userInput.toLowerCase().includes('tenant') || userInput.toLowerCase().includes('tenants')) {
      responseContent = `Here are the current tenants:\n${tenants.map(t => 
        `- ${t.name} (Unit ${t.unit}, Status: ${t.status})`).join('\n')}`;
    } else if (userInput.toLowerCase().includes('occupancy')) {
      const avgOccupancy = properties.reduce((sum, p) => sum + p.occupancy, 0) / properties.length;
      responseContent = `Average occupancy across all properties is ${(avgOccupancy * 100).toFixed(1)}%`;
    } else if (userInput.toLowerCase().includes('help')) {
      responseContent = `I can help you with:\n- Property information\n- Tenant details\n- Occupancy statistics\n\nTry asking about "properties", "tenants", or "occupancy".`;
    }
    
    return responseContent;
  }, [properties, tenants]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    // Save current input before clearing
    const currentInput = input;
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    try {
      setIsProcessing(true);
      
      // Add a small delay to simulate processing time
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
        
        // Re-focus the input after processing
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
        
        // Simulate tool results for insights
        if (onInsightGenerated) {
          if (currentInput.toLowerCase().includes('status')) {
            onInsightGenerated([
              {
                type: 'tenant_status',
                data: tenants.reduce((acc, t) => {
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

  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col h-[600px]">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Property Management Assistant</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[75%] rounded-lg p-3 whitespace-pre-wrap ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p>{message.content}</p>
              <div 
                className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (try 'help' for suggestions)"
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing || !isInitialized}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isProcessing || !input.trim() || !isInitialized}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-700"
          >
            {isProcessing ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyManagementAgent; 