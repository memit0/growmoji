# RevenueCat Integration Setup Guide

This guide will help you set up RevenueCat for subscription management in your Habit Tracker app.

## 1. RevenueCat Dashboard Setup ✅ COMPLETED

Your RevenueCat is already configured with:

### Products
- **Yearly Plan**: `growmoji.yearly` 
- **Monthly Plan**: `growmoji.monthly`

### Entitlements  
- **Growmoji Premium**: Access to all premium features (both monthly and yearly unlock this)

⚠️ **Status**: Both products show "Missing Metadata" - you need to configure these in App Store Connect.

## 2. App Store Connect Setup (REQUIRED)

### Create In-App Purchases
1. Log into [App Store Connect](https://appstoreconnect.apple.com/)
2. Go to your app → **Features** → **In-App Purchases**
3. Create Auto-Renewable Subscriptions with these **exact** IDs:
   - `growmoji.yearly` - Yearly subscription
   - `growmoji.monthly` - Monthly subscription
4. Set prices, descriptions, and localization
5. Submit for review

### Important Notes
- The product IDs in App Store Connect **must match exactly**: `growmoji.yearly` and `growmoji.monthly`
- Until these are created, your app will show "No subscription options available"

## 3. Environment Variables ✅ COMPLETED

Your `.env` file is already configured with:
```env
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_aWwSLIiOzZiHDKsBmBOeqHPAjpo
```

## 4. Testing Your App

### Testing in Development (Simulator/Device)

1. **Build and run your app:**
   ```bash
   npx expo run:ios
   # or
   npx expo run:android
   ```

2. **Test the free tier limits:**
   - Complete the onboarding flow
   - Try to add more than 3 habits → Should show paywall
   - Try to access the progress dashboard → Should show upgrade prompt

3. **Test paywall display:**
   - The paywall should show "No subscription options available" until App Store products are configured
   - All UI and flows should work correctly

### Testing with Real Purchases (After App Store Setup)

1. **Create a Sandbox Test User:**
   - Go to App Store Connect → Users and Access → Sandbox Testers
   - Create a test Apple ID for testing

2. **Test Purchase Flow:**
   - Sign in with sandbox test account on device
   - Complete purchase flow in app
   - Verify premium features unlock
   - Test restore purchases

### Expected Behavior During Testing

#### Free User Experience:
- ✅ Can create up to 3 habits
- ✅ Habit counter shows "3/3 habits • Limit reached" 
- ✅ "New Habit" button becomes "Upgrade" button
- ✅ Progress dashboard shows upgrade prompt
- ✅ Paywall displays when limits are hit

#### Premium User Experience (After Purchase):
- ✅ Unlimited habits (counter shows "∞")
- ✅ Full access to progress dashboard
- ✅ All premium features unlocked

## 5. Debugging & Logs

Check your console for these RevenueCat logs:
```
[RevenueCat] Configuring...
[RevenueCat] Getting customer info...
[RevenueCat] Getting offerings...
```

### Common Issues & Solutions

1. **"No subscription options available"**
   - ✅ **Cause**: App Store Connect products not configured
   - 🔧 **Fix**: Create in-app purchases with exact IDs `growmoji.yearly` and `growmoji.monthly`

2. **Purchases not working**
   - ✅ **Cause**: Using wrong Apple ID or not in sandbox mode
   - 🔧 **Fix**: Use sandbox test account

3. **Premium features not unlocking**
   - ✅ **Cause**: Entitlement names mismatch
   - 🔧 **Fix**: Code now checks for "Growmoji Premium" entitlement (matches dashboard)

## 6. Next Steps

### Immediate (For Testing):
1. **Create App Store Connect in-app purchases** with IDs:
   - `growmoji.yearly`
   - `growmoji.monthly`
2. **Test the app flows** even before purchases are approved
3. **Submit in-app purchases for review**

### Before Production:
1. **Android**: Set up Google Play Console subscriptions
2. **Testing**: Complete end-to-end purchase testing
3. **Production**: Switch to production RevenueCat API keys

## 7. Test Commands

```bash
# Clean and rebuild
npx expo run:ios --clear
npx expo run:android --clear

# Check logs
npx expo logs

# Reset Metro cache if needed
npx expo start --clear
```

Your app is ready for testing! The main limitation right now is that you need to create the actual subscription products in App Store Connect for the purchase flow to work, but all the app logic and UI is fully functional.

## 8. Features Implemented

### Free Tier Limitations
- ✅ Maximum 3 habits
- ✅ No widget access
- ✅ Basic progress tracking

### Premium Features
- ✅ Unlimited habits
- ✅ Widget access for home screen
- ✅ Advanced analytics dashboard
- ✅ Premium themes (future)
- ✅ Cloud sync (future)
- ✅ Smart reminders (future)

### Paywall Integration
- ✅ Beautiful, modern paywall design
- ✅ Shows premium features clearly
- ✅ Integrated into onboarding flow
- ✅ Triggered when hitting free limits
- ✅ Restore purchases functionality

## 9. User Flow

### Onboarding
1. User completes onboarding slides
2. Last slide offers free vs premium choice
3. Premium option opens paywall
4. Free option starts with 3-habit limit

### During Usage
1. When user tries to add 4th habit → Paywall
2. When user tries to access widgets → Paywall
3. Premium users get unlimited access

## 10. Development Notes

### Key Files Modified
- `contexts/SubscriptionContext.tsx` - RevenueCat integration
- `components/ui/PaywallModal.tsx` - Paywall UI
- `app/onboarding.tsx` - Enhanced onboarding
- `app/(tabs)/index.tsx` - Habit limits
- `components/ui/PomodoroTimer.tsx` - Widget restrictions

### Architecture
- Subscription state managed via React Context
- Clean separation of free vs premium features
- Graceful degradation for free users
- Modern, user-friendly UI/UX

## 11. Deployment Checklist

Before going live:
- [ ] Replace sandbox API keys with production keys
- [ ] Submit in-app purchases for review
- [ ] Test with real payment methods
- [ ] Verify receipt validation
- [ ] Set up webhooks for server-side validation (if needed)
- [ ] Configure proper error handling
- [ ] Test restore purchases functionality

## 12. Troubleshooting

### Common Issues
1. **Purchase not working**: Check API keys and product IDs match
2. **Sandbox testing**: Ensure using sandbox Apple ID
3. **Android testing**: Enable license testing for your Google account
4. **Restore not working**: Verify entitlement IDs are correct

### Debug Mode
The app logs RevenueCat operations to console. Check logs for:
- Subscription initialization
- Purchase attempts
- Entitlement changes
- Error messages

## Support

For RevenueCat specific issues, check:
- [RevenueCat Documentation](https://docs.revenuecat.com/)
- [Community Forum](https://community.revenuecat.com/)
- [GitHub Issues](https://github.com/RevenueCat/react-native-purchases) 