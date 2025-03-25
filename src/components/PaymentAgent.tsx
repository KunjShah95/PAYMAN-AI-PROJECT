import { useState, useEffect, useRef } from 'react';

interface PaymentAgentProps {
  apiKey: string;
  onPaymentAction?: (action: any) => void;
}

const PaymentAgent = ({ apiKey, onPaymentAction }: PaymentAgentProps) => {
  const [agent, setAgent] = useState<any | null>(null);
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const initializeAgent = async () => {
      try {
        // Simulate successful agent initialization
        const dummyAgent = {
          id: 'pay-agent-001',
          name: 'Payment Processor',
          type: 'US_ACH',
          status: 'active',
          createdAt: new Date().toISOString()
        };
        
        setAgent(dummyAgent);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing payment agent:', error);
        // Still set initialized to true so UI isn't blocked
        setIsInitialized(true);
      }
    };
    
    initializeAgent();
  }, [apiKey]);
  
  // Focus input field when component mounts
  useEffect(() => {
    if (isInitialized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInitialized]);

  const handleProcessRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userInput.trim()) return;
    
    try {
      setIsProcessing(true);
      
      // Simulate payment processing response instead of using agent.run
      setTimeout(() => {
        const simulatedResponse = {
          success: true,
          payeeId: agent?.id || 'dummy-id',
          request: userInput,
          timestamp: new Date().toISOString(),
          result: {
            message: `Successfully processed request: "${userInput}"`,
            details: userInput.toLowerCase().includes('late fee') 
              ? { 
                  calculation: 'Late fee calculated',
                  amount: '$45.00',
                  paymentDue: '$1,045.00' 
                }
              : {
                  status: 'Payment request acknowledged',
                  nextSteps: 'Awaiting approval'
                }
          }
        };
        
        setResult(simulatedResponse);
        if (onPaymentAction) {
          onPaymentAction(simulatedResponse);
        }
        setIsProcessing(false);
        
        // Clear input after successful processing if desired
        // setUserInput('');
        
        // Re-focus the input
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }, 800);
    } catch (error) {
      console.error('Error processing payment request:', error);
      setResult({ error: 'Failed to process payment request' });
      setIsProcessing(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (userInput.trim() && !isProcessing) {
        handleProcessRequest(e);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Payment Assistant</h2>
      
      <form onSubmit={handleProcessRequest} className="mb-4">
        <div className="mb-4">
          <label htmlFor="userInput" className="block text-sm font-medium text-gray-700 mb-1">
            Payment Request
          </label>
          <textarea
            ref={inputRef}
            id="userInput"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Describe payment action or query (e.g., Calculate late fee for $1000 payment that is 5 days late)"
            disabled={isProcessing || !isInitialized}
          />
        </div>
        
        <button
          type="submit"
          disabled={isProcessing || !userInput.trim() || !isInitialized}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700"
        >
          {isProcessing ? 'Processing...' : 'Process Request'}
        </button>
      </form>
      
      {result && (
        <div className="mt-4">
          <h3 className="font-medium text-gray-700 mb-2">Result:</h3>
          <div className="p-3 bg-gray-50 rounded-md">
            <pre className="whitespace-pre-wrap break-words">
              {typeof result === 'object' ? JSON.stringify(result, null, 2) : result}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentAgent; 