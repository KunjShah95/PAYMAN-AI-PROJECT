# AI Features Guide - Payman Property Management System

This guide provides detailed information on how to use the AI-powered features in the Payman property management system.

## Table of Contents

1. [Introduction](#introduction)
2. [Tenant Health Score Module](#tenant-health-score-module)
3. [Auto-Reconciliation Engine](#auto-reconciliation-engine)
4. [Smart Notification System](#smart-notification-system)
5. [Property Allocation Engine](#property-allocation-engine)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Introduction

Payman incorporates several AI-powered features designed to streamline property management tasks, reduce manual work, and provide actionable insights. These features include:

- **Tenant Health Score**: Financial reliability assessment system
- **Auto-Reconciliation Engine**: AI matching for incoming payments
- **Smart Notification System**: Intelligent alerts based on system events
- **Property Allocation Engine**: Matching tenants to properties based on preferences

These tools can be accessed through the Dashboard or their respective sections in the application.

## Tenant Health Score Module

The Tenant Health Score module calculates a financial reliability score for each tenant based on their payment history and patterns.

### Accessing the Health Score

1. Navigate to the **Dashboard**
2. Click on the **Tenant Health Score** card in the AI-Powered Tools section
3. Alternatively, view a tenant's health score from their detail page in the **Tenants** section

### Understanding the Score

The health score is displayed as a number from 0-100:
- **80-100**: Low risk - Excellent payment history
- **60-79**: Medium risk - Good payment history with minor issues
- **0-59**: High risk - Problematic payment history

### Score Components

The overall score is calculated based on several factors:
- **Consistency Score** (40%): How consistently rent is paid on time
- **Timeliness Score** (30%): Recent payment performance
- **History Length Score** (10%): Duration of payment history
- **Payment Method Score** (20%): Reliability of chosen payment methods

### Using the Recommendations

The system provides actionable recommendations based on the tenant's score:
- **Set up automatic payments**: For tenants with low payment method scores
- **Request deposit increase**: For tenants with inconsistent payment patterns
- **Issue payment reminder**: For tenants with recent late payments
- **Consider non-renewal**: For tenants with very low overall scores
- **Schedule payment discussion**: For tenants with missed payments
- **Offer renewal incentive**: For tenants with excellent scores

Click on any recommendation button to log the action and track your interactions with tenants.

## Auto-Reconciliation Engine

The Auto-Reconciliation Engine uses AI to match incoming payments to tenants, reducing manual reconciliation work.

### Accessing the Reconciliation Engine

1. Navigate to the **Dashboard**
2. Click on the **Auto-Reconciliation** card in the AI-Powered Tools section
3. Alternatively, access it from the **Payments** section

### Running Reconciliation

1. Review the unprocessed payments listed
2. Click the **Run Reconciliation** button to start the automated matching process
3. The system will process each payment and attempt to match it to a tenant
4. View the results in the **Processed** and **Flagged** tabs

### Match Confidence Indicators

Each reconciled payment shows a confidence score:
- **High** (90-100%): Very confident match, little review needed
- **Medium** (70-89%): Probable match, may need quick verification
- **Low** (Below 70%): Possible match, but requires manual review

### Handling Flagged Payments

Payments that couldn't be confidently matched are placed in the **Flagged** tab:
1. Review the payment details and any potential matches suggested
2. Use the **Manually Assign** button to select the correct tenant
3. Add notes to improve future matching for similar payments

## Smart Notification System

The Smart Notification System generates timely alerts based on property and tenant events.

### Accessing Notifications

1. Click the **Bell icon** in the top-right corner of any page
2. The number badge indicates how many unread notifications you have
3. The notification panel displays all your notifications

### Notification Types

Notifications are color-coded by type and priority:
- **Payment notifications** (Dollar sign icon): Related to rent payments, reconciliation
- **Maintenance notifications** (Wrench icon): Maintenance requests, completed work
- **Lease notifications** (Calendar icon): Expiring leases, renewals needed
- **System notifications** (Info icon): General system information

### Taking Action on Notifications

Most notifications have action buttons that allow you to:
1. **Respond immediately**: Take action directly from the notification
2. **View Details**: Open the related item (tenant, property, etc.)
3. **Dismiss**: Remove the notification from your list
4. **Clear All**: Remove all notifications at once

### Filtering Notifications

Use the filter buttons at the top of the notification panel to:
- View all notifications
- View only payment notifications
- View only maintenance notifications
- View only lease notifications

## Property Allocation Engine

The Property Allocation Engine helps match tenants with available properties based on their preferences and requirements.

### Accessing the Allocation Engine

1. Navigate to the **Properties** section
2. Click the **Allocation Engine** button

### Finding Matches

1. Select filters for property type, location, price range, etc.
2. View the available properties that match your criteria
3. Select a tenant from the dropdown or tenant list
4. Click **Find Matches** to see compatibility scores

### Understanding Match Scores

The match score (0-100) is calculated based on:
- Budget compatibility (rent within tenant's range)
- Size requirements (bedrooms, bathrooms)
- Location preferences
- Amenity preferences
- Property type preferences

### Automatic Matching

Use the **Auto Match** feature to:
1. Automatically find the best property matches for multiple tenants
2. See a ranked list of properties for each tenant
3. Make allocation decisions based on the highest compatibility scores

## Best Practices

### For Optimal Health Scores

- Regularly review tenant health scores (at least monthly)
- Take action on low scores before they deteriorate further
- Use the recommendations provided by the system
- Document actions taken for future reference

### For Reconciliation

- Run reconciliation daily for best results
- Review flagged payments promptly
- Provide detailed references when making manual payments
- Use the feedback mechanism to improve future matching

### For Notifications

- Check notifications daily
- Take action on high-priority notifications immediately
- Use filters to focus on specific areas when needed
- Clear processed notifications regularly

### For Property Allocation

- Keep tenant preferences up to date
- Add detailed property information for better matching
- Verify matches with tenants before finalizing
- Use the manual override when specific needs aren't captured by the algorithm

## Troubleshooting

### Health Score Issues

- **Score seems incorrect**: Verify payment data is complete and accurate
- **No score available**: Ensure tenant has sufficient payment history (at least 2 payments)
- **Recommendations not relevant**: Update tenant status and payment information

### Reconciliation Issues

- **Low match confidence**: Ensure payment references include tenant information
- **Payments not appearing**: Check they've been imported correctly
- **Incorrect matches**: Use feedback feature to improve future matching

### Notification Issues

- **Missing notifications**: Check notification settings
- **Too many notifications**: Use filters and consider adjusting priority thresholds
- **Actions not working**: Verify you have correct permissions

### General AI Feature Issues

- **Slow performance**: Processing large datasets may take time; be patient
- **Unexpected results**: The AI system improves with more data; results will get better over time
- **System unavailable**: Check your internet connection and system status

---

For additional help and support, contact the Payman support team at support@payman.example.com or use the in-app chat support. 