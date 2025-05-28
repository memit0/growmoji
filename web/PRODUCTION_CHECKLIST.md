# Production Deployment Checklist for Clerk

Based on [Clerk's Production Deployment Guide](https://clerk.com/docs/deployments/overview)

## Pre-Deployment Requirements

- [ ] **Domain Ownership**: You own the domain you want to deploy to
- [ ] **DNS Access**: You can add DNS records to your domain
- [ ] **OAuth Credentials**: Set up production OAuth credentials for all social providers

## 1. Create Production Instance

- [ ] Navigate to Clerk Dashboard
- [ ] Create production instance (clone development settings or use defaults)
- [ ] Note: SSO connections, Integrations, and Paths settings don't copy over

## 2. API Keys and Environment Variables

- [ ] **Update Environment Variables**:
  - [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (should start with `pk_live_`)
  - [ ] `CLERK_SECRET_KEY` (should start with `sk_live_`)
  - [ ] `NEXT_PUBLIC_APP_URL` (your production domain with HTTPS)
  
- [ ] **Verify Key Formats**:
  - [ ] Publishable key: `pk_live_...` (not `pk_test_...`)
  - [ ] Secret key: `sk_live_...` (not `sk_test_...`)

## 3. OAuth Credentials

- [ ] Replace shared development OAuth credentials with your own production credentials
- [ ] Update redirect URLs in OAuth provider settings to use production domain
- [ ] Test each OAuth provider in production

## 4. Webhooks

- [ ] Update webhook endpoints to use production URLs
- [ ] Update webhook signing secrets
- [ ] Test webhook endpoints are accessible from Clerk's servers

## 5. DNS Records

- [ ] Add required DNS records as shown in Clerk Dashboard → Domains
- [ ] Wait up to 24 hours for DNS propagation
- [ ] Verify DNS records are correctly configured

## 6. Security Configuration

- [ ] **Authorized Parties**: Set `authorizedParties` in middleware for subdomain protection
- [ ] **CSP Headers**: Configure Content Security Policy to include Clerk domains
- [ ] **HTTPS**: Ensure all URLs use HTTPS in production

## 7. Domain Configuration

- [ ] Set custom domain in Clerk Dashboard (e.g., `clerk.yourdomain.com`)
- [ ] Configure authentication across subdomains if needed
- [ ] Test cross-subdomain session sharing

## 8. Deploy Certificates

- [ ] Complete all steps above
- [ ] Click "Deploy certificates" button in Clerk Dashboard
- [ ] Monitor certificate deployment status

## 9. Testing

- [ ] Test sign-in/sign-up flows
- [ ] Test all OAuth providers
- [ ] Test webhook functionality
- [ ] Test across different subdomains (if applicable)
- [ ] Test error boundaries and fallbacks

## 10. Monitoring

- [ ] Set up error monitoring for authentication issues
- [ ] Monitor console for Clerk-related warnings/errors
- [ ] Set up alerts for webhook failures

## Troubleshooting

### DNS Issues
- If using Cloudflare, set DNS record to "DNS only" mode
- Check CAA records don't block LetsEncrypt or Google Trust Services

### Certificate Issues
- Ensure no CAA records prevent certificate issuance
- Run: `dig yourdomain.com +short CAA` (should return empty)

### Incorrect Domain
- Change domain through Clerk Dashboard or Backend API if needed

## Code Implementation Status

- [x] **Middleware Security**: Added `authorizedParties` configuration
- [x] **CSP Headers**: Added Clerk-compatible Content Security Policy
- [x] **Environment Validation**: Enhanced validation for production
- [x] **Error Boundaries**: Clerk-specific error handling
- [x] **Console Filtering**: Production console warning management

## Environment Variables Required

```bash
# Production Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Production App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Other service keys (Supabase, RevenueCat, etc.)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_REVENUECAT_WEB_API_KEY=...
```

## Notes

- Test keys are blocked in production for security
- DNS changes can take up to 24 hours to propagate
- OAuth credentials must be production-ready
- Webhooks need production URLs and signing secrets 