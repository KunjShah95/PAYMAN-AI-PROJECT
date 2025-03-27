# Analytics Setup Guide

This guide explains how to set up analytics tracking for the Payman property management system.

## Supported Analytics Platforms

Payman supports two analytics platforms out of the box:

1. **Google Analytics 4 (GA4)**: Comprehensive analytics for tracking user behavior and interactions
2. **Vercel Analytics**: Simple, privacy-friendly analytics integrated with Vercel deployments

## Setting Up Google Analytics

### Step 1: Create a Google Analytics 4 Property

1. Sign in to [Google Analytics](https://analytics.google.com/)
2. Create a new account if you don't have one already
3. Create a new property and select "Web" as the platform
4. Follow the setup prompts to get your Measurement ID (starts with "G-")

### Step 2: Update Environment Variables

1. Copy the `.env.example` file to create a new `.env` file
2. Add your GA4 Measurement ID to the environment variable:
   ```
   VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   ```
   Replace `G-XXXXXXXXXX` with your actual Measurement ID.

### Step 3: Verify Installation

1. Start your application in development mode
2. Open your browser's developer tools and check the console
3. You should see messages indicating "Analytics initialized" and tracking events
4. Visit your Google Analytics dashboard to confirm data is being received
5. Note that it may take 24-48 hours for data to fully appear in Google Analytics

## Setting Up Vercel Analytics

Vercel Analytics is automatically configured when you deploy your application to Vercel.

### Step 1: Install the Vercel Analytics Package

The package should already be installed, but if you need to install it manually:

```bash
npm install @vercel/analytics
# or
yarn add @vercel/analytics
```

### Step 2: Deploy to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Create a new project on [Vercel](https://vercel.com/)
3. Link your Git repository to the Vercel project
4. Deploy your application

Vercel Analytics will automatically begin collecting data once your application is deployed.

## Analytics Implementation Details

The Payman system tracks the following events by default:

### Page Views

- Dashboard view (`dashboard_view`)
- Properties view (`property_list_view`)
- Tenants view (`tenant_list_view`)
- Transactions view (`transaction_list_view`)
- Payment form view (`payment_form_view`)

### User Actions

- Navigation events (`navigation`)
- Payment creation (`payment_created`)
- Tenant messaging (`tenant_message_sent`, `tenant_messaging_opened`)
- Tenant details viewing (`tenant_details_viewed`)
- Property allocation (`property_allocated`)
- File attachments (`tenant_message_file_attached`)

### Custom Events

You can add custom tracking by using the Analytics service in your components:

```typescript
import Analytics from '../components/Analytics';

// Track a page view
Analytics.trackPageView('custom_page_name');

// Track a custom event
Analytics.trackEvent('custom_event', {
  customProperty: 'value',
  anotherProperty: 123
});
```

## Privacy Considerations

When implementing analytics, be sure to:

1. Include analytics information in your privacy policy
2. Obtain necessary user consent for tracking where required
3. Consider using the privacy-focused features of GA4 (IP anonymization, etc.)
4. Review and comply with relevant privacy regulations (GDPR, CCPA, etc.)

## Troubleshooting

If analytics data is not appearing:

1. Check that your environment variables are correctly set
2. Verify that the analytics scripts are loaded in the browser
3. Look for errors in the browser console
4. Ensure your browser's privacy settings or extensions are not blocking analytics

For further assistance, please contact the development team at support@payman.io 