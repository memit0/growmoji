/**
 * Production environment utilities for Supabase deployment
 */

export const isProd = process.env.NODE_ENV === 'production';
export const isDev = process.env.NODE_ENV === 'development';

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://growmoji.app';

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

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all Supabase keys are set.'
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