import { inject } from '@vercel/analytics';

// Analytics service for tracking user actions and page views
class AnalyticsService {
  private initialized = false;

  // Initialize analytics when the app loads
  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeAnalytics();
    }
  }

  // Set up analytics providers
  private initializeAnalytics() {
    try {
      // Initialize Vercel Analytics
      inject();
      
      // If Google Analytics is available, it's already initialized via script tags in index.html
      // We can check if the gtag function exists
      if (typeof window.gtag === 'function') {
        console.debug('Google Analytics detected');
      }
      
      this.initialized = true;
      console.debug('Analytics initialized');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  // Track page views
  trackPageView(pageName: string) {
    try {
      // Track in Google Analytics
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', {
          page_title: pageName,
          page_location: window.location.href,
          page_path: window.location.pathname,
        });
      }
      
      console.debug(`📊 Page view: ${pageName}`);
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  // Track custom events
  trackEvent(eventName: string, eventProperties?: Record<string, any>) {
    try {
      // Track in Google Analytics
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, eventProperties);
      }
      
      console.debug(`📊 Event: ${eventName}`, eventProperties);
    } catch (error) {
      console.error(`Error tracking event ${eventName}:`, error);
    }
  }
}

// Add type definitions for window object to include gtag
declare global {
  interface Window {
    gtag: (command: string, action: string, params?: any) => void;
  }
}

// Create a singleton instance
const Analytics = new AnalyticsService();

export default Analytics; 