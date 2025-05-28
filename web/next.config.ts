import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Add CSP header for production (Clerk-compatible)
          ...(process.env.NODE_ENV === 'production' ? [{
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.com https://js.stripe.com https://clerk.growmoji.app https://challenges.cloudflare.com https://*.hcaptcha.com https://www.google.com/recaptcha/ https://*.clerk.dev",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://clerk.growmoji.app https://api.stripe.com https://*.supabase.co wss://*.supabase.co",
              "frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://js.stripe.com https://challenges.cloudflare.com https://*.hcaptcha.com https://www.google.com/recaptcha/ https://*.clerk.dev",
              "worker-src 'self' blob:",
              "child-src 'self' https://*.clerk.accounts.dev https://*.clerk.com",
            ].join('; '),
          }] : []),
        ],
      },
    ];
  },
};

export default nextConfig;
