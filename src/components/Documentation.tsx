import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { BookOpen, Code, Key, CreditCard, Shield, Lightbulb, ArrowRight } from 'lucide-react';

const Documentation: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const sections = [
    {
      title: "Getting Started",
      icon: BookOpen,
      content: `
        <h3>Welcome to PaymanAI</h3>
        <p>PaymanAI is an AI-powered property management platform designed to simplify rent collection, tenant management, and property analytics.</p>
        <h4>Quick Start</h4>
        <ol>
          <li>Create an account or sign in using your credentials</li>
          <li>Add your properties and units to the system</li>
          <li>Invite tenants to join and set up their payment methods</li>
          <li>Configure automated payment reminders and collection schedules</li>
          <li>Start tracking payments and managing your properties effortlessly</li>
        </ol>
      `
    },
    {
      title: "API Reference",
      icon: Code,
      content: `
        <h3>RESTful API</h3>
        <p>PaymanAI offers a comprehensive API for developers who want to integrate our services into their applications.</p>
        <h4>Base URL</h4>
        <code>https://api.payman.ai/v1</code>
        <h4>Authentication</h4>
        <p>All API requests require an API key passed in the header:</p>
        <code>Authorization: Bearer YOUR_API_KEY</code>
        <h4>Common Endpoints</h4>
        <ul>
          <li><code>GET /properties</code> - List all properties</li>
          <li><code>GET /properties/:id</code> - Get property details</li>
          <li><code>POST /properties</code> - Create a new property</li>
          <li><code>GET /tenants</code> - List all tenants</li>
          <li><code>GET /payments</code> - List all payments</li>
          <li><code>POST /payments</code> - Create a payment</li>
        </ul>
      `
    },
    {
      title: "Authentication",
      icon: Key,
      content: `
        <h3>Authentication Methods</h3>
        <p>PaymanAI supports multiple authentication methods for secure access:</p>
        <ul>
          <li>Email and password</li>
          <li>Single Sign-On (SSO) with Google, Microsoft, or Apple</li>
          <li>Two-factor authentication (2FA)</li>
          <li>API key-based authentication for developers</li>
        </ul>
        <h4>Security Best Practices</h4>
        <ul>
          <li>Use strong, unique passwords</li>
          <li>Enable two-factor authentication for additional security</li>
          <li>Regularly rotate API keys</li>
          <li>Review account activity logs periodically</li>
        </ul>
      `
    },
    {
      title: "Payment Processing",
      icon: CreditCard,
      content: `
        <h3>Payment Methods</h3>
        <p>PaymanAI supports various payment methods to accommodate different tenant preferences:</p>
        <ul>
          <li>Credit and debit cards</li>
          <li>ACH transfers</li>
          <li>Digital wallets (Apple Pay, Google Pay, PayPal)</li>
          <li>Recurring payments</li>
        </ul>
        <h4>Processing Fees</h4>
        <table>
          <tr>
            <th>Payment Method</th>
            <th>Fee</th>
          </tr>
          <tr>
            <td>Credit/Debit Card</td>
            <td>2.9% + $0.30</td>
          </tr>
          <tr>
            <td>ACH Transfer</td>
            <td>0.8% (capped at $5)</td>
          </tr>
          <tr>
            <td>Digital Wallet</td>
            <td>2.9% + $0.30</td>
          </tr>
        </table>
      `
    },
    {
      title: "Data Security",
      icon: Shield,
      content: `
        <h3>Data Protection</h3>
        <p>At PaymanAI, we prioritize the security of your data and implement multiple layers of protection:</p>
        <ul>
          <li>256-bit AES encryption for data at rest</li>
          <li>TLS/SSL encryption for data in transit</li>
          <li>PCI DSS compliance for payment processing</li>
          <li>Regular security audits and penetration testing</li>
          <li>Data backup and disaster recovery protocols</li>
        </ul>
        <h4>Privacy Policy</h4>
        <p>We are committed to protecting your privacy. We collect only the data necessary to provide our services and never sell your information to third parties. For detailed information, please refer to our Privacy Policy.</p>
      `
    },
    {
      title: "AI Features",
      icon: Lightbulb,
      content: `
        <h3>Intelligent Automation</h3>
        <p>PaymanAI leverages artificial intelligence to enhance your property management experience:</p>
        <ul>
          <li><strong>Smart Notifications:</strong> Predictive rent reminders based on tenant payment patterns</li>
          <li><strong>Payment Risk Assessment:</strong> AI-powered risk scoring to identify potential late payments</li>
          <li><strong>Occupancy Optimization:</strong> Recommendations for optimal pricing based on market trends</li>
          <li><strong>Maintenance Prediction:</strong> Predictive maintenance alerts based on property age and history</li>
          <li><strong>Financial Forecasting:</strong> Advanced revenue and expense predictions for better financial planning</li>
        </ul>
        <h4>Machine Learning Models</h4>
        <p>Our AI systems continuously learn from your data to provide increasingly accurate and personalized insights over time, while maintaining strict privacy controls.</p>
      `
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          PaymanAI Documentation
        </h1>
        <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          A comprehensive guide to using PaymanAI for property management
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <div 
              key={index}
              className={`p-4 rounded-lg border ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 hover:border-blue-500' 
                  : 'bg-white border-gray-200 hover:border-blue-500'
              } cursor-pointer transition-all duration-200 transform hover:-translate-y-1`}
              onClick={() => document.getElementById(`section-${index}`)?.scrollIntoView({ behavior: 'smooth' })}
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{section.title}</h2>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Jump to {section.title} section
              </p>
              <div className={`mt-2 flex items-center text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                <span>Read more</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          );
        })}
      </div>

      {sections.map((section, index) => {
        const Icon = section.icon;
        return (
          <div 
            key={index} 
            id={`section-${index}`}
            className={`p-6 rounded-lg shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-full ${isDark ? 'bg-blue-900 bg-opacity-50' : 'bg-blue-100'}`}>
                <Icon className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{section.title}</h2>
            </div>
            <div 
              className={`prose prose-slate dark:prose-invert max-w-none`}
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </div>
        );
      })}

      <div className={`p-6 rounded-lg shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Contact & Support</h2>
        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Need help with PaymanAI? Our support team is available 24/7 to assist you with any questions or issues.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Email Support</h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <a href="mailto:support@payman.ai" className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                support@payman.ai
              </a>
            </p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Phone Support</h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <a href="tel:+18005551234" className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                +1 (800) 555-1234
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="text-center py-6">
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          PaymanAI © 2024. Made with ❤️ by Kunj Shah. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Documentation; 