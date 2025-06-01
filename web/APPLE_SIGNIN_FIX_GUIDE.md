# Apple Sign-In "Sign Up Not Complete" Fix Guide

## Problem Description
You're getting "sign up not complete" error when trying to use Apple Sign-In with Supabase Auth.

## Root Cause Analysis
Based on your configuration:
- **App ID**: `com.mebattll.habittracker`
- **Service ID**: `com.mebattll.habittracker.signin` 
- **Domain**: `www.growmoji.app`
- **Supabase URL**: `https://xtcktlilfkfhahjdvhuv.supabase.co`

The "sign up not complete" error typically occurs due to:

1. **Incorrect Services ID Configuration** in Apple Developer Console
2. **Missing Domain Verification** 
3. **Wrong Return URLs** 
4. **Incomplete Supabase Apple Provider Setup**
5. **Testing on localhost** (Apple doesn't support this)

## Step-by-Step Fix

### 1. Apple Developer Console Configuration

#### Check Your Services ID
1. Go to [Apple Developer Console](https://developer.apple.com/account/resources/identifiers/list/serviceId)
2. Find your Services ID: `com.mebattll.habittracker.signin`
3. Ensure it's **enabled** and **configured for Sign In with Apple**

#### Domain Verification
1. Click on your Services ID → Configure
2. In **Website URLs** section:
   - Primary Domain: `www.growmoji.app` (must be verified ✓)
   - Also add: `xtcktlilfkfhahjdvhuv.supabase.co` (must be verified ✓)

#### Return URLs
Add these **exact** URLs to your Services ID:
```
https://xtcktlilfkfhahjdvhuv.supabase.co/auth/v1/callback
https://www.growmoji.app/auth/callback
```

**❌ DO NOT ADD**: `http://localhost:3000/auth/callback` (Apple doesn't allow localhost)

### 2. Apple Developer Keys

#### Create/Check Your Key
1. Go to Keys section in Apple Developer Console
2. Create a new key (or find existing) with:
   - **Sign In with Apple** enabled
   - Note the **Key ID** (10 characters)
   - Download the `.p8` file
   - Note your **Team ID** (10 characters, found in top right)

### 3. Supabase Configuration

#### Apple Provider Settings
1. Go to Supabase Dashboard → Authentication → Providers → Apple
2. **Enable** the provider
3. Configure with:
   - **Services ID**: `com.mebattll.habittracker.signin` (NOT the App ID)
   - **Team ID**: Your 10-character Team ID
   - **Key ID**: Your 10-character Key ID  
   - **Private Key**: Content of your `.p8` file (including header/footer)

#### Example Private Key Format:
```
-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
(multiple lines of key data)
...
-----END PRIVATE KEY-----
```

### 4. Code Configuration Check

Your current setup looks correct:
- ✅ `NEXT_PUBLIC_APPLE_CLIENT_ID=com.growmoji.app.signin` 
- ✅ Consistent `redirectTo` URLs between sign-in/sign-up pages
- ✅ Proper error handling in callback

But double-check your `.env.local`:
```bash
NEXT_PUBLIC_APPLE_CLIENT_ID=com.mebattll.habittracker.signin
```
Should match exactly with your Apple Services ID.

### 5. Testing Requirements

**❌ WILL NOT WORK:**
- `http://localhost:3000` (Apple limitation)
- Development URLs

**✅ WILL WORK:**
- `https://www.growmoji.app` (production)
- Must use HTTPS
- Must test with actual deployment

## Debugging Steps

### Step 1: Use the Debug Tool
1. Deploy your changes to production
2. Visit `https://www.growmoji.app/debug-apple-auth`
3. Run all tests to identify issues

### Step 2: Check Browser Console
When testing Apple Sign-In, check for:
- JavaScript errors
- Network errors (failed requests to `appleid.apple.com`)
- Popup blockers

### Step 3: Verify Network Access
- Ensure `appleid.apple.com` is accessible
- Check corporate firewalls/VPNs
- Test in different browsers (Safari works best)

## Common Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "sign up not complete" | Apple provider misconfiguration | Check Supabase Apple settings |
| "invalid_client" | Wrong Services ID | Verify Services ID matches in Apple Console and Supabase |
| "invalid_request" | Wrong return URLs | Check return URLs in Apple Console |
| "access_denied" | User cancelled or Apple rejected | Check Apple Services ID configuration |
| No popup/redirect | Popup blocked or HTTPS issue | Check browser settings, ensure HTTPS |

## Verification Checklist

Before testing, ensure:

- [ ] Apple Services ID exists and is enabled
- [ ] Domain `www.growmoji.app` is verified in Apple Console  
- [ ] Domain `xtcktlilfkfhahjdvhuv.supabase.co` is verified in Apple Console
- [ ] Correct return URLs added to Apple Services ID
- [ ] Apple key created with "Sign In with Apple" permission
- [ ] Supabase Apple provider enabled with correct credentials
- [ ] Testing on production domain (not localhost)
- [ ] Using HTTPS
- [ ] No browser extensions blocking popups

## Next Steps

1. **Deploy** your updated code to production
2. **Test** on `https://www.growmoji.app/debug-apple-auth` 
3. **Check** all configurations match this guide
4. **Test** Apple Sign-In on actual auth pages
5. **Monitor** browser console for specific error messages

If you still get "sign up not complete" after following this guide, the issue is most likely in the Supabase Apple provider configuration - double-check the Services ID, Team ID, Key ID, and Private Key format.
