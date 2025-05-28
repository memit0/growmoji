/**
 * Environment Variable Validation for Production
 * Ensures all required Clerk and other service keys are properly configured
 */

import { APP_URL, CLERK_CONFIG, isProd, validateEnvVars } from './env';

export function validateProductionEnvironment() {
  // Use the new validation function
  validateEnvVars();

  const requiredEnvVars: Record<string, string | undefined> = {
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    'CLERK_SECRET_KEY': process.env.CLERK_SECRET_KEY,
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'NEXT_PUBLIC_REVENUECAT_WEB_API_KEY': process.env.NEXT_PUBLIC_REVENUECAT_WEB_API_KEY,
  };

  // Add production-specific required variables
  if (isProd) {
    requiredEnvVars['NEXT_PUBLIC_APP_URL'] = process.env.NEXT_PUBLIC_APP_URL;
  }

  const missingVars: string[] = [];
  const testKeyWarnings: string[] = [];

  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value) {
      missingVars.push(key);
    } else if (value.includes('test_') || value.includes('pk_test_') || value.includes('sk_test_')) {
      if (isProd) {
        testKeyWarnings.push(`${key} appears to be using a test key in production: ${value.substring(0, 20)}...`);
      }
    }
  });

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  if (testKeyWarnings.length > 0) {
    console.error('❌ Test keys detected in production environment:');
    testKeyWarnings.forEach(warning => console.error(`   ${warning}`));
    throw new Error('Test keys are not allowed in production');
  }

  // Validate Clerk keys format
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;

  if (clerkPublishableKey && !clerkPublishableKey.startsWith('pk_')) {
    throw new Error('Invalid Clerk publishable key format');
  }

  if (clerkSecretKey && !clerkSecretKey.startsWith('sk_')) {
    throw new Error('Invalid Clerk secret key format');
  }

  // Check if using production keys
  const isUsingLiveKeys = clerkPublishableKey?.startsWith('pk_live_') && clerkSecretKey?.startsWith('sk_live_');
  
  if (isProd && !isUsingLiveKeys) {
    throw new Error('Production environment requires Clerk live keys (pk_live_... and sk_live_...)');
  }

  // Production-specific validations
  if (isProd) {
    console.log('🚀 Production environment detected');
    console.log(`🌐 App URL: ${APP_URL}`);
    console.log(`🛡️  Authorized Parties: ${CLERK_CONFIG.authorizedParties?.join(', ') || 'None'}`);
    
    // Validate production URL format
    if (!APP_URL.startsWith('https://')) {
      throw new Error('Production app URL must use HTTPS');
    }
  }

  console.log('✅ Environment validation passed');
  console.log(`🔑 Using Clerk ${isUsingLiveKeys ? 'LIVE' : 'TEST'} keys`);
  console.log(`🏠 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  return {
    isValid: true,
    isUsingLiveKeys,
    environment: process.env.NODE_ENV || 'development',
    appUrl: APP_URL,
    authorizedParties: CLERK_CONFIG.authorizedParties,
  };
}

// Environment validation for production
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  // Server-side validation
  const requiredEnvVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate Clerk keys format
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;

  if (clerkPublishableKey && !clerkPublishableKey.startsWith('pk_')) {
    console.error('❌ Invalid Clerk publishable key format');
    throw new Error('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must start with "pk_"');
  }

  if (clerkSecretKey && !clerkSecretKey.startsWith('sk_')) {
    console.error('❌ Invalid Clerk secret key format');
    throw new Error('CLERK_SECRET_KEY must start with "sk_"');
  }

  console.log('✅ All required environment variables are present and valid');
}

// Client-side browser extension detection and Clerk compatibility check
if (typeof window !== 'undefined') {
  // Detect problematic browser extensions
  const detectProblematicExtensions = () => {
    const indicators = [
      // Ad blockers
      () => window.navigator.plugins && Array.from(window.navigator.plugins).some(p => 
        p.name.toLowerCase().includes('adblock') || 
        p.name.toLowerCase().includes('ublock')
      ),
      // Privacy extensions
      () => document.querySelector('script[src*="ghostery"]') !== null,
      () => '_gaq' in window && typeof (window as Record<string, unknown>)._gaq === 'undefined', // AdBlock detection
      // Developer extensions that might interfere
      () => '__REACT_DEVTOOLS_GLOBAL_HOOK__' in window,
    ];

    return indicators.some(check => {
      try {
        return check();
      } catch {
        return false;
      }
    });
  };

  // Monitor for Clerk-specific errors and provide user guidance
  const setupClerkErrorMonitoring = () => {
    let clerkErrorCount = 0;
    const maxErrors = 3;

    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      
      if (message.includes('clerk.browser.js') || message.includes('createUnhandledError')) {
        clerkErrorCount++;
        
        if (clerkErrorCount >= maxErrors && process.env.NODE_ENV === 'production') {
          // Show user-friendly notification
          const hasExtensions = detectProblematicExtensions();
          
          if (hasExtensions) {
            // Create a non-intrusive notification
            const notification = document.createElement('div');
            notification.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              background: #fee2e2;
              border: 1px solid #fecaca;
              color: #991b1b;
              padding: 12px 16px;
              border-radius: 8px;
              font-size: 14px;
              z-index: 10000;
              max-width: 300px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            `;
            notification.innerHTML = `
              <div style="font-weight: 600; margin-bottom: 4px;">Browser Extension Detected</div>
              <div>Some browser extensions may interfere with authentication. Try incognito mode if you experience issues.</div>
              <button onclick="this.parentElement.remove()" style="
                background: none;
                border: none;
                color: #991b1b;
                cursor: pointer;
                margin-top: 8px;
                text-decoration: underline;
                font-size: 12px;
              ">Dismiss</button>
            `;
            
            document.body.appendChild(notification);
            
            // Auto-remove after 10 seconds
            setTimeout(() => {
              if (notification.parentElement) {
                notification.remove();
              }
            }, 10000);
          }
        }
        
        // Don't call the original console.error for Clerk errors
        return;
      }
      
      // Call original for non-Clerk errors
      originalConsoleError(...args);
    };
  };

  // Initialize monitoring after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupClerkErrorMonitoring);
  } else {
    setupClerkErrorMonitoring();
  }
}

 