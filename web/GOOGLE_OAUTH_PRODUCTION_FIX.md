# Google OAuth Production Fix Guide

## The Problem

Google Sign-In works in development but redirects to `localhost:3000` in production, causing Safari to show "can't open page localhost:3000" error.

## Root Cause

The issue occurs because:

1. **Google OAuth Client Configuration**: Your Google Cloud Console OAuth client is configured with localhost redirect URIs
2. **Environment-Specific URLs**: The app was dynamically constructing redirect URLs that could fall back to localhost
3. **Cached Configuration**: Google OAuth providers cache redirect URLs from their initial configuration

## The Fix

### ✅ Code Changes (Already Applied)

1. **Created `auth-config.ts`**: Centralized OAuth configuration management
2. **Updated Auth Components**: Both sign-in and sign-up pages now use `getOAuthRedirectUrl()`
3. **Production-First Logic**: In production, always uses `NEXT_PUBLIC_APP_URL`

### 🔧 Google Cloud Console Configuration (You Need to Do This)

1. **Go to Google Cloud Console**: [console.cloud.google.com](https://console.cloud.google.com)
2. **Navigate to Credentials**: APIs & Services → Credentials
3. **Find Your OAuth Client ID** (the Web client used for Supabase)
4. **Update Authorized Redirect URIs**:

   **Remove any localhost URLs:**
   ```
   ❌ http://localhost:3000/auth/callback
   ❌ http://localhost:3001/auth/callback
   ```

   **Add your production URLs:**
   ```
   ✅ https://www.growmoji.app/auth/callback
   ✅ https://xtcktlilfkfhahjdvhuv.supabase.co/auth/v1/callback
   ```

5. **Save the changes**

### 🗄️ Supabase Configuration Check

1. **Go to Supabase Dashboard**: [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Navigate to**: Authentication → Providers → Google
3. **Verify Redirect URL**: Should be `https://xtcktlilfkfhahjdvhuv.supabase.co/auth/v1/callback`
4. **Check Site URL**: Should be `https://www.growmoji.app`

### 🌐 Environment Variables Check

Ensure your production environment has:

```env
NEXT_PUBLIC_APP_URL=https://www.growmoji.app
NEXT_PUBLIC_SUPABASE_URL=https://xtcktlilfkfhahjdvhuv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Testing

1. **Deploy Your Changes**: Push the updated code to production
2. **Test Google Sign-In**: Try signing in on `https://www.growmoji.app`
3. **Check Console**: Monitor browser console for any OAuth errors
4. **Test Both Flows**: Try both sign-in and sign-up with Google

## Common Issues & Solutions

### Issue: Still redirecting to localhost
**Solution**: Clear browser cache and cookies, or test in incognito mode

### Issue: "redirect_uri_mismatch" error
**Solution**: Double-check that Google Cloud Console has the exact production URLs

### Issue: Works in development but not production
**Solution**: Ensure you have separate OAuth clients for dev/prod, or add both URLs to the same client

### Issue: Apple Sign-In also affected
**Note**: Apple Sign-In has different requirements - it doesn't allow localhost at all

## Verification Checklist

- [ ] Google Cloud Console updated with production redirect URIs
- [ ] No localhost URLs in Google OAuth configuration
- [ ] Supabase Google provider configured correctly
- [ ] `NEXT_PUBLIC_APP_URL` set in production environment
- [ ] Code deployed to production
- [ ] Tested Google Sign-In flow end-to-end
- [ ] Cleared browser cache/cookies during testing

## Why This Happens

OAuth providers like Google require **exact URL matching** for security. When you configure redirect URIs, the OAuth flow will only work with those exact URLs. If your app constructs URLs dynamically and falls back to localhost (common in development), production deployments can inherit these localhost URLs, causing the redirect failure.

The fix ensures that production always uses production URLs, while development can use local URLs.
