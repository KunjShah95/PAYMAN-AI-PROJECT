# Rental Payment Tracker with PaymanAI Integration

This project is a React-based rental property management application that integrates PaymanAI to provide intelligent assistance for property managers and tenants.

## Features

- Dashboard for property management overview
- Payment processing and tracking
- Tenant management
- AI assistants powered by PaymanAI for:
  - General assistance
  - Payment processing and analysis
  - Property management with chat capabilities

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with your PaymanAI API key:

```
VITE_PAYMAN_API_KEY=your_api_key_here
```

4. Start the development server:

```bash
npm run dev
```

## PaymanAI Integration

This project uses [PaymanAI](https://docs.paymanai.com) to provide AI capabilities for property management. The integration includes:

### 1. Basic AI Assistant

Located in `src/components/AIAgent.tsx`, this component provides a general-purpose AI assistant that can answer questions about property management.

### 2. Payment Processing Agent

Located in `src/components/PaymentAgent.tsx`, this specialized agent helps with payment-related tasks including:
- Analyzing payment histories
- Suggesting payment plans
- Detecting anomalies in payment patterns
- Calculating late fees

### 3. Property Management Agent

Located in `src/components/PropertyManagementAgent.tsx`, this advanced agent with memory capabilities provides:
- Chat interface for tenant communications
- Property maintenance scheduling
- Occupancy analysis
- Rent collection tracking

## Configuration

To use the PaymanAI integration, you need to:

1. Sign up for an account at [PaymanAI](https://paymanai.com)
2. Get your API key from the dashboard
3. Add your API key to the `.env` file or update it directly in `App.tsx`

## PaymanAI Usage Notes

- The current implementation uses sample data for properties and tenants
- In a production environment, you would connect this to your actual database
- The API key should be stored securely and not committed to version control

## License

MIT 