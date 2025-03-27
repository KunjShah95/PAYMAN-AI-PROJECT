# Payman System Guide

This guide explains how to use the key features of the Payman property management system, focusing on tenant messaging and property allocation.

## Table of Contents
- [Tenant Management](#tenant-management)
  - [Viewing Tenant Details](#viewing-tenant-details)
  - [Messaging Tenants](#messaging-tenants)
- [Property Management](#property-management)
  - [Property Listings](#property-listings)
  - [Property Allocation Engine](#property-allocation-engine)
- [Analytics Integration](#analytics-integration)

## Tenant Management

The tenant management system provides a comprehensive way to view, communicate with, and manage your tenants.

### Viewing Tenant Details

To view detailed information about a tenant:

1. Navigate to the **Tenants** page from the sidebar
2. Find the tenant you want to view in the list
3. Click the external link icon (↗️) next to their name
4. The tenant details modal will appear showing:
   - Contact information
   - Lease details
   - Payment history
   - Documents
   - Notes

### Messaging Tenants

To send a message to a tenant:

1. Navigate to the **Tenants** page from the sidebar
2. Find the tenant you want to message in the list
3. Click the mail icon (✉️) next to their name
4. The messaging modal will appear with several features:
   - Pre-defined message templates (rent reminders, maintenance notifications, etc.)
   - Rich text editing
   - File attachments (up to 5 files, 20MB total)
   - Draft saving

**Message Templates:** You can use the provided templates as a starting point for common communications. Click a template button to automatically populate the message field.

**Attachments:** Click the "Attach Files" button to select files from your computer. You can view and remove attachments before sending.

**Best Practices:**
- Keep messages professional and clear
- Include specific dates and times for any actions required
- Maintain a record of all communications in the tenant's file

## Property Management

### Property Listings

The properties section provides different views to manage your property portfolio:

1. **Grid View**: Visual card-based layout showing property images and key details
2. **List View**: Compact table view for seeing more properties at once
3. **Allocation View**: Special view for matching properties with tenants

### Property Allocation Engine

The Property Allocation Engine helps you match available properties with suitable tenants based on their preferences and requirements.

To use the allocation engine:

1. Navigate to the **Properties** page from the sidebar
2. Click the "Allocation" tab in the view options
3. Use the filters to narrow down properties and tenants:
   - Property filters: type, bedrooms, rent range, availability
   - Tenant filters: budget, bedroom requirements, preferred locations

**Manual Allocation:**
1. Select a property from the left column
2. Select a tenant from the right column
3. Review the match score and compatibility details
4. Click "Allocate" to assign the property to the tenant

**Auto-Match:**
1. Click the "Run Auto-Match" button
2. The system will analyze all available properties and tenants
3. Review the suggested matches sorted by compatibility score
4. Select matches to approve or reject

**Match Score Calculation:**
The match score is calculated based on:
- Rent amount vs. tenant budget (40%)
- Number of bedrooms vs. tenant requirements (30%)
- Property location vs. tenant preferences (15%)
- Property features vs. tenant preferences (15%)

A score of 80% or higher is considered a good match.

## Analytics Integration

All actions in the system are tracked to provide insights into system usage and tenant interactions:

- Page views
- Tenant message sends
- Property allocations
- Payment processing

This data helps you understand user behavior and improve your property management workflow.

To access analytics data:
1. Ensure you've configured your Google Analytics ID in the `.env` file
2. View the data in your Google Analytics dashboard
3. Vercel Analytics is also automatically enabled if deployed on Vercel

For detailed analytics setup, refer to the `docs/analytics-setup.md` file.

---

For technical support or feature requests, please contact the development team at support@payman.io 