/**
 * Production environment utilities for Supabase deployment
 */

export const isProd = process.env.NODE_ENV === 'production';
export const isDev = process.env.NODE_ENV === 'development';

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://growmoji.app';

// RevenueCat configuration - use appropriate API key based on environment
export const getRevenueCatApiKey = (): string => {
  const prodKey = process.env.NEXT_PUBLIC_REVENUECAT_WEB_API_KEY;
  const sandboxKey = process.env.NEXT_PUBLIC_REVENUECAT_WEB_API_KEY_SANDBOX;

  if (isProd) {
    if (!prodKey) {
      throw new Error('Missing NEXT_PUBLIC_REVENUECAT_WEB_API_KEY for production');
    }
    console.log('[RevenueCat] Using production API key');
    return prodKey;
  } else {
    if (!sandboxKey) {
      console.warn('[RevenueCat] Missing sandbox key, falling back to production key');
      if (!prodKey) {
        throw new Error('Missing both NEXT_PUBLIC_REVENUECAT_WEB_API_KEY and NEXT_PUBLIC_REVENUECAT_WEB_API_KEY_SANDBOX');
      }
      return prodKey;
    }
    console.log('[RevenueCat] Using sandbox API key');
    return sandboxKey;
  }
};

export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

// Validate required environment variables
export function validateEnvVars() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  // Add RevenueCat key validation based on environment
  if (isProd) {
    required.push('NEXT_PUBLIC_REVENUECAT_WEB_API_KEY');
  } else {
    // In development, either sandbox or production key should exist
    const hasAnyRevenueCatKey =
      process.env.NEXT_PUBLIC_REVENUECAT_WEB_API_KEY_SANDBOX ||
      process.env.NEXT_PUBLIC_REVENUECAT_WEB_API_KEY;

    if (!hasAnyRevenueCatKey) {
      throw new Error('Missing RevenueCat API key: Either NEXT_PUBLIC_REVENUECAT_WEB_API_KEY_SANDBOX or NEXT_PUBLIC_REVENUECAT_WEB_API_KEY is required');
    }
  }

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all required keys are set.'
    );
  }

  // Validate URL format
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  try {
    new URL(url);
  } catch {
    throw new Error('Invalid Supabase URL format');
  }
}

// DNS and domain configuration helpers
export const DOMAIN_CONFIG = {
  // Primary domain
  primaryDomain: isProd ? 'growmoji.app' : 'localhost:3000',

  // Allowed origins for CORS
  allowedOrigins: isProd
    ? [APP_URL]
    : ['http://localhost:3000'],
}; 