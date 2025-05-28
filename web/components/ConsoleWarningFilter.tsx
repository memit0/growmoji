'use client';

import { useEffect } from 'react';

// Type declaration for Clerk global object
declare global {
  interface Window {
    Clerk?: {
      client?: {
        clearCache?: () => void;
      };
    };
  }
}

export function ConsoleWarningFilter() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalWarn = console.warn;
    const originalError = console.error;
    
    // Enhanced Clerk error filtering and recovery
    console.warn = (...args) => {
      const message = args.join(' ');
      // Filter out known Clerk browser extension warnings
      if (
        message.includes('clerk.browser.js') ||
        message.includes('createUnhandledError') ||
        message.includes('Hydration failed') ||
        message.includes('Warning: Did not expect server HTML') ||
        message.includes('Extension context invalidated') ||
        message.includes('Browser extension error')
      ) {
        // Log to analytics in production but don't show in console
        if (process.env.NODE_ENV === 'production') {
          // You can send this to your analytics service
          // analytics.track('clerk_browser_warning', { message });
        }
        return;
      }
      originalWarn(...args);
    };

    console.error = (...args) => {
      const message = args.join(' ');
      // Filter out known Clerk browser extension errors
      if (
        message.includes('clerk.browser.js') ||
        message.includes('createUnhandledError') ||
        message.includes('Extension context invalidated') ||
        message.includes('Browser extension error')
      ) {
        // Log to analytics in production but don't show in console
        if (process.env.NODE_ENV === 'production') {
          // You can send this to your analytics service
          // analytics.track('clerk_browser_error', { message });
        }
        return;
      }
      originalError(...args);
    };

    // Add global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      const message = error?.message || error?.toString() || '';
      
      if (
        message.includes('clerk.browser.js') ||
        message.includes('createUnhandledError') ||
        message.includes('Extension context invalidated')
      ) {
        event.preventDefault(); // Prevent the error from showing in console
        
        // Optional: Attempt to recover from Clerk errors
        if (typeof window !== 'undefined' && window.Clerk?.client?.clearCache) {
          // Clear any cached Clerk state
          try {
            window.Clerk.client.clearCache();
          } catch {
            // Ignore clearing errors
          }
        }
        
        return;
      }
    };

    // Add global error handler for script errors
    const handleError = (event: ErrorEvent) => {
      const message = event.message || '';
      const source = event.filename || '';
      
      if (
        message.includes('createUnhandledError') ||
        source.includes('clerk.browser.js') ||
        message.includes('Extension context invalidated')
      ) {
        event.preventDefault(); // Prevent the error from showing in console
        return;
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Cleanup function to restore original console methods
    return () => {
      console.warn = originalWarn;
      console.error = originalError;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
} 