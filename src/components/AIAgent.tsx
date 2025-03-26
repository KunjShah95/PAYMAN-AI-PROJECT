import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

interface AIAgentProps {
  apiKey: string;
  onResponse?: (response: any) => void;
}

const AIAgent = ({ apiKey, onResponse }: AIAgentProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [agent, setAgent] = useState<any | null>(null);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Initialize the Paymanai client with API key
    const setupAgent = async () => {
      try {
        // Simulate successful agent initialization
        const dummyAgent = {
          id: 'ai-agent-001',
          name: 'AI Assistant',
          type: 'virtual',
          status: 'active',
          createdAt: new Date().toISOString()
        };
        
        setAgent(dummyAgent);
        setIsInitialized(true);
      } catch (error) {
        console.error("Error creating agent:", error);
        // Still set initialized to true so UI isn't blocked
        setIsInitialized(true);
      }
    };
    
    setupAgent();
  }, [apiKey]);
  
  // Focus input field when component mounts
  useEffect(() => {
    if (isInitialized && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [isInitialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    try {
      setIsLoading(true);
      
      // In a real implementation, this would use paymanai's actual AI capabilities
      // For now, we'll just simulate a response with a delay
      setTimeout(() => {
        const result = {
          response: generateResponse(prompt),
          payeeId: agent?.id || 'dummy-id',
          timestamp: new Date().toISOString()
        };
        
        setResponse(result.response);
        if (onResponse) {
          onResponse(result);
        }
        setIsLoading(false);
        
        // Clear prompt after response if desired
        // setPrompt('');
        
        // Re-focus the textarea
        setTimeout(() => {
          textAreaRef.current?.focus();
        }, 100);
      }, 1000);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setResponse('Sorry, there was an error processing your request.');
      setIsLoading(false);
    }
  };
  
  // Generate simple responses based on keywords
  const generateResponse = (input: string) => {
    const lowercaseInput = input.toLowerCase();
    
    if (lowercaseInput.includes('hello') || lowercaseInput.includes('hi')) {
      return 'Hello! How can I assist you with property management today?';
    } else if (lowercaseInput.includes('help')) {
      return 'I can help with various property management tasks. Try asking about:\n- Payment processing\n- Tenant management\n- Maintenance requests\n- Financial reports';
    } else if (lowercaseInput.includes('payment') || lowercaseInput.includes('pay')) {
      return 'I can help process payments for your properties. Would you like information about payment methods, scheduling recurring payments, or processing a specific payment?';
    } else if (lowercaseInput.includes('tenant')) {
      return 'I can help manage tenant information, track lease agreements, process tenant applications, and handle tenant communications.';
    } else if (lowercaseInput.includes('maintenance') || lowercaseInput.includes('repair')) {
      return 'I can help track maintenance requests, schedule repairs, and manage vendor relationships for your properties.';
    } else {
      return `I understand you're asking about "${input}". While I'm trained to assist with property management queries, I'll need more specific information to provide a helpful response.`;
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim() && !isLoading) {
        handleSubmit(e);
      }
    }
  };

  return (
    <div className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>AI Assistant</h2>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-4">
          <label htmlFor="prompt" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Ask a question
          </label>
          <textarea
            ref={textAreaRef}
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            rows={3}
            placeholder="Ask about payments, tenants, or property management... (try 'help')"
            disabled={isLoading || !isInitialized}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !prompt.trim() || !isInitialized}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-700"
        >
          {isLoading ? 'Processing...' : 'Submit'}
        </button>
      </form>
      
      {response && (
        <div className="mt-4">
          <h3 className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Response:</h3>
          <div className={`p-3 rounded-md whitespace-pre-wrap ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-800'}`}>
            {response}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAgent; 