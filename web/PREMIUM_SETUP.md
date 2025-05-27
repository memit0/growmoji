# Premium Subscription Setup with RevenueCat

This guide will help you set up the premium subscription system for the web version of Growmoji using RevenueCat's Web Billing.

## Overview

The web version implements a hard paywall system where:
- **Free users** are blocked with an unskippable paywall modal
- **Premium users** can access all features
- Premium status is checked using RevenueCat's Web SDK
- The system syncs with the mobile app's subscription data

## Setup Steps

### 1. RevenueCat Dashboard Configuration

1. **Log in to RevenueCat Dashboard**
   - Go to [app.revenuecat.com](https://app.revenuecat.com)
   - Navigate to your project

2. **Create a Web Billing App**
   - Go to Project Settings > Apps
   - Click "New" > "Web Billing"
   - Configure:
     - App Name: "Growmoji Web"
     - Support Email: your support email
     - Default Currency: USD (or your preferred currency)
     - Connect your Stripe account

3. **Get the API Key**
   - After creating the Web Billing app
   - Copy the "Public API Key" (safe for client-side use)
   - Use "Sandbox API Key" for testing

4. **Create Products**
   - Go to Products > New
   - Select your Web Billing App
   - Create subscription products (e.g., Monthly, Yearly)
   - Set prices and billing cycles

5. **Create Entitlements**
   - Go to Entitlements > New
   - Create entitlements like "pro", "premium", or "Growmoji Premium"
   - Link products to entitlements

6. **Create Offerings**
   - Go to Offerings > New
   - Add your products as packages
   - Set one as the default offering

### 2. Environment Configuration

Update your `.env.local` file:

```env
# RevenueCat Web Configuration
NEXT_PUBLIC_REVENUECAT_WEB_API_KEY=your_actual_revenuecat_web_api_key_here
```

**Important**: 
- Use the **Public API Key** for production
- Use the **Sandbox API Key** for testing
- Never expose private/secret keys in client-side code

### 3. Testing the Integration

1. **Test with Sandbox**
   - Use the Sandbox API Key in development
   - Use Stripe test cards for purchases
   - Test card: `4242 4242 4242 4242`

2. **Debug Tools**
   - Check browser console for RevenueCat logs
   - Use the `/debug` page to test connection
   - Monitor network requests in DevTools

### 4. Premium Status Logic

The system checks for premium status using these entitlement patterns:
- `pro`
- `premium`
- `plus`
- `Yearly`
- `Monthly`
- `yearly`
- `monthly`
- `Growmoji Premium`

You can modify these patterns in `web/lib/subscription.ts` in the `checkPremiumStatus` function.

## Components Overview

### Core Files

- **`web/lib/subscription.ts`** - RevenueCat Web SDK integration
- **`web/hooks/useSubscription.ts`** - React hook for subscription state
- **`web/components/app/PremiumGuard.tsx`** - Paywall guard component
- **`web/components/ui/PaywallModal.tsx`** - Subscription purchase modal
- **`web/components/app/UserSubscriptionStatus.tsx`** - User status display

### Flow

1. User authenticates with Clerk
2. `PremiumGuard` initializes RevenueCat with user ID
3. RevenueCat checks subscription status
4. If premium: user accesses app
5. If free: user sees paywall modal
6. User can purchase subscription through Stripe
7. Premium status updates in real-time

## Customization

### Modifying Features

Edit the features list in `web/components/ui/PaywallModal.tsx`:

```tsx
const features = [
  {
    icon: <Zap className="h-5 w-5 text-yellow-500" />,
    title: 'Your Feature',
    description: 'Your feature description'
  },
  // Add more features
];
```

### Changing Entitlement Patterns

Update `web/lib/subscription.ts`:

```tsx
export function checkPremiumStatus(customerInfo: CustomerInfo | null): boolean {
  if (!customerInfo) return false;
  
  const activeEntitlements = customerInfo.entitlements.active;
  
  return (
    // Add your entitlement identifiers here
    activeEntitlements['your_entitlement_name'] !== undefined ||
    // ... other patterns
  );
}
```

## Troubleshooting

### Common Issues

1. **"Missing RevenueCat Web API key" Error**
   - Check that `NEXT_PUBLIC_REVENUECAT_WEB_API_KEY` is set
   - Restart your development server after adding the env var

2. **"No subscription plans available" Error**
   - Verify you've created products in RevenueCat dashboard
   - Check that products are linked to an offering
   - Ensure offering is set as default

3. **Premium status not updating**
   - Check browser console for RevenueCat errors
   - Verify entitlement names match your dashboard configuration
   - Test with a known premium user

4. **Paywall not showing**
   - Check that user is actually not premium
   - Verify `PremiumGuard` is wrapping your app content
   - Check for JavaScript errors in console

### Debug Mode

Use the debug page at `/debug` to:
- Test API connections
- View current user status
- Check environment variables
- Test subscription operations

## Production Checklist

- [ ] Switch to Production API Key
- [ ] Test with real Stripe account
- [ ] Verify entitlement names match mobile app
- [ ] Test user flow end-to-end
- [ ] Configure proper error handling
- [ ] Set up monitoring/analytics
- [ ] Test on multiple browsers
- [ ] Verify mobile app sync works

## Support

For RevenueCat-specific issues:
- [RevenueCat Documentation](https://docs.revenuecat.com/docs/web-billing)
- [RevenueCat Community](https://community.revenuecat.com/)
- [RevenueCat Support](https://support.revenuecat.com/)

For implementation issues:
- Check the browser console for errors
- Review the component implementation
- Test with the debug tools provided 