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
          // Add CSP header for production (Supabase-compatible)
          ...(process.env.NODE_ENV === 'production' ? [{
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://challenges.cloudflare.com https://*.hcaptcha.com https://www.google.com/recaptcha/",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://api.stripe.com https://*.supabase.co wss://*.supabase.co",
              "frame-src 'self' https://js.stripe.com https://challenges.cloudflare.com https://*.hcaptcha.com https://www.google.com/recaptcha/",
              "worker-src 'self' blob:",
              "child-src 'self'",
            ].join('; '),
          }] : []),
        ],
      },
    ];
  },
};

export default nextConfig;
