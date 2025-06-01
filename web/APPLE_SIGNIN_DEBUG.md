# Apple Sign-In Web Debugging Checklist

## 🚨 CRITICAL: Apple Sign In Limitations

**⚠️ Apple Sign In does NOT work on localhost!**

- Must test on production domain: `www.growmoji.app`
- Requires HTTPS (production domains only)
- localhost URLs cannot be added to Apple Services ID configuration
- This is normal Apple behavior, not a bug

## Quick Debug Access
Visit `/debug-apple-auth` in your web app to run automated tests.

## Production Configuration Required

For your app (`www.growmoji.app`):

### Apple Developer Console Services ID
- **Domain**: `www.growmoji.app` (must be verified ✓)
- **Return URL**: `https://xtcktlilfkfhahjdvhuv.supabase.co/auth/v1/callback`
- **DO NOT** add localhost URLs (Apple doesn't allow them)

### Supabase Dashboard Settings
- Path: Auth → Providers → Apple
- **Services ID**: Your Apple Services ID (e.g., `com.growmoji.app.signin`)  
- **Team ID**: Your 10-character Apple Team ID
- **Key ID**: Your 10-character Key ID
- **Private Key**: Content of your .p8 file

### Testing Steps
1. Deploy your changes to production
2. Test on `https://www.growmoji.app`  
3. Use Safari for best compatibility
4. Check browser console for specific error messages

## 1. Apple Developer Console Issues (Most Common)

### ❌ **Problem**: Using iOS App ID instead of Services ID
**Test**: Check if you're using a Services ID (reverse domain format) vs App ID (team prefix format)
```bash
# Services ID should look like: com.yourcompany.yourapp.signin
# NOT like: TEAM123.com.yourcompany.yourapp
```

### ❌ **Problem**: Missing Domain Verification
**Test**: In Apple Developer Console → Services ID → Website URLs
- Domain MUST be verified (blue checkmark)
- Must include both your domain AND Supabase domain

### ❌ **Problem**: Incorrect Return URLs
**Test**: Verify these URLs are in Apple Developer Console:
```
https://xtcktlilfkfhahjdvhuv.supabase.co/auth/v1/callback
https://your-domain.com/auth/callback (if testing locally: http://localhost:3000/auth/callback)
```

## 2. Supabase Configuration Issues

### ❌ **Problem**: Wrong Provider Settings
**Test**: In Supabase Dashboard → Auth → Providers → Apple:
- ✅ Enabled
- ✅ Services ID (not App ID)
- ✅ Team ID (10 characters)
- ✅ Key ID (10 characters)  
- ✅ Private Key (.p8 file content)

### ❌ **Problem**: Missing Key Permissions
**Test**: Apple Developer Console → Keys → Your Key:
- Must have "Sign In with Apple" checked
- Must be downloaded and content added to Supabase

## 3. Browser/Client Issues

### ❌ **Problem**: Popup Blocked
**Test**: Run popup test in debug tool or manually:
```javascript
const popup = window.open('', '_blank', 'width=500,height=600');
if (!popup) console.error('Popup blocked!');
```

### ❌ **Problem**: Third-party Cookies Disabled
**Test**: Check browser settings:
- Safari: Preferences → Privacy → Prevent cross-site tracking (try disabling)
- Chrome: Settings → Privacy → Third-party cookies
- Firefox: Privacy settings

### ❌ **Problem**: HTTPS Required
**Test**: Apple Sign-In requires HTTPS except for localhost
```javascript
const isValid = window.location.protocol === 'https:' || 
               window.location.hostname === 'localhost';
```

## 4. Code Implementation Issues

### ❌ **Problem**: Incorrect Redirect URL
**Test**: Check your auth component:
```typescript
// This should match what's in Apple Developer Console
redirectTo: `${window.location.origin}/auth/callback`
```

### ❌ **Problem**: Missing Error Handling in Callback
**Test**: Add debugging to `/auth/callback/route.ts`:
```typescript
console.log('Apple callback params:', {
  code: searchParams.get('code'),
  error: searchParams.get('error'),
  state: searchParams.get('state'),
  user: searchParams.get('user')
});
```

## 5. Network/Environment Issues

### ❌ **Problem**: Corporate Firewall/VPN
**Test**: 
- Try from different network
- Check if appleid.apple.com is accessible
- Test without VPN/corporate proxy

### ❌ **Problem**: Browser Extensions
**Test**:
- Try in incognito/private mode
- Disable ad blockers and privacy extensions
- Test in different browsers

## 6. Apple Services Issues

### ❌ **Problem**: Apple ID Service Downtime
**Test**: Check Apple System Status: https://www.apple.com/support/systemstatus/

### ❌ **Problem**: Rate Limiting
**Test**: Wait 10-15 minutes between attempts if you've been testing frequently

## Step-by-Step Debug Process

1. **Run Automated Tests**: Visit `/debug-apple-auth` 
2. **Check Apple Developer Console**: Verify Services ID, domain verification, return URLs
3. **Check Supabase Dashboard**: Verify Apple provider configuration
4. **Test in Different Browser**: Try Safari, Chrome, Firefox
5. **Test in Incognito Mode**: Eliminates extension interference
6. **Check Network Tab**: Look for failed requests to Apple or Supabase
7. **Check Console Errors**: Look for JavaScript errors
8. **Test with Different Apple ID**: Some Apple IDs may have restrictions

## Common Error Messages & Solutions

| Error | Solution |
|-------|----------|
| "invalid_client" | Check Services ID in Supabase matches Apple Console |
| "invalid_request" | Check return URLs match between Apple Console and your app |
| "access_denied" | User cancelled or Apple rejected request |
| No redirect happening | Check popup blocker and HTTPS requirements |
| "unauthorized_client" | Services ID not properly configured for Sign In with Apple |

## Manual Verification Steps

1. **Apple Developer Console**:
   - Services ID exists and is enabled
   - Website URLs section has your domains verified
   - Return URLs include Supabase callback

2. **Supabase Dashboard**:
   - Apple provider enabled
   - All required fields filled correctly
   - Test the configuration with a simple auth flow

3. **Browser Tests**:
   - Can open popups
   - Third-party cookies enabled
   - HTTPS (or localhost)
   - No blocking extensions

4. **Network Tests**:
   - Can reach appleid.apple.com
   - Can reach your Supabase instance
   - No corporate firewall blocking OAuth flows
