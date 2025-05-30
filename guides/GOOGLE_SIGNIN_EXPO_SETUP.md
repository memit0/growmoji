# Google Sign-In Configuration Guide for Expo

This guide walks you through setting up Google Sign-In for your Expo/React Native app using Supabase authentication.

## Prerequisites

1. **Expo Development Build**: This package cannot be used in Expo Go. You need a development build.
2. **Google Cloud Console Account**: You'll need access to create OAuth credentials.
3. **Supabase Project**: Your backend authentication provider.

## Step 1: Install Dependencies

The dependencies are already installed in this project:
- `@react-native-google-signin/google-signin`
- `@supabase/supabase-js`

## Step 2: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sign-In API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sign-In API" and enable it

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"

### Create Web Client ID (Required for Supabase)
- **Application type**: "Web application"
- **Name**: "Your App Name (Web)"
- **Authorized JavaScript origins**: `https://your-supabase-url.supabase.co`
- **Authorized redirect URIs**: `https://your-supabase-url.supabase.co/auth/v1/callback`

### Create iOS Client ID (Required for native iOS sign-in)
- **Application type**: "iOS"
- **Name**: "Your App Name (iOS)"
- **Bundle ID**: `com.mebattll.habittracker` (should match your app's bundle identifier)

## Step 4: Configure app.json

Update your `app.json` with the Google Sign-In config plugin:

```json
{
  "expo": {
    "plugins": [
      "expo-router",
      "@bacons/apple-targets",
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.YOUR_IOS_CLIENT_ID_HERE"
        }
      ]
    ]
  }
}
```

**Important**: Replace `YOUR_IOS_CLIENT_ID_HERE` with the first part of your iOS client ID:
- If your iOS client ID is: `123456789-abcdefg.apps.googleusercontent.com`
- Your iosUrlScheme should be: `com.googleusercontent.apps.123456789-abcdefg`

## Step 5: Environment Variables

Create a `.env` file in your project root and add:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Sign-In Configuration
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id.apps.googleusercontent.com
```

## Step 6: Supabase Configuration

1. Go to your Supabase dashboard
2. Navigate to "Authentication" > "Providers"
3. Enable Google provider
4. Add your **Web Client ID** and **Client Secret** from Google Cloud Console
5. Set the redirect URL to: `https://your-supabase-url.supabase.co/auth/v1/callback`

## Step 7: Rebuild Your App

After making these changes, you need to rebuild your app:

```bash
# Clean and rebuild native code
npx expo prebuild --clean

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

## Troubleshooting

### "Google Sign-In not available"
- Verify your client IDs are correctly set in `.env`
- Ensure Google Sign-In API is enabled in Google Cloud Console
- Check that you've updated the `iosUrlScheme` in `app.json`

### "No ID token received"
- Verify your web client ID is correct in `.env`
- Check that your Supabase Google provider is properly configured
- Ensure your redirect URLs match in Google Cloud Console and Supabase

### "Sign-in failed" or configuration errors
- Run the OAuth debug screen in your app for detailed logging
- Check the console logs for detailed error messages
- Verify all client IDs match between Google Cloud Console, `.env`, and `app.json`

### iOS-specific issues
- Make sure you've updated the `iosUrlScheme` in `app.json` with your actual iOS client ID
- Rebuild the app after changing `app.json`: `npx expo prebuild --clean && npx expo run:ios`
- Check that your iOS bundle identifier matches in both Google Cloud Console and `app.json`

## Testing

1. Update your `.env` file with valid client IDs
2. Update `app.json` with the correct iOS URL scheme
3. Rebuild the app: `npx expo prebuild --clean && npx expo run:ios`
4. Test the Google Sign-In flow on both login and register screens

## Development vs Production

- Use separate OAuth client IDs for development and production
- Make sure to test on physical devices, not just simulators
- Consider implementing proper error handling and fallback flows

## Debug Mode

The app includes extensive logging for Google Sign-In. Check the console for detailed error messages starting with `[AuthService]` and use the OAuth debug screen for testing.
