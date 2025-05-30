# Google Sign-In Setup Guide

## Prerequisites

Before you can use Google Sign-In in your app, you need to set up Google Cloud Console credentials and configure your app.

## Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sign-In API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sign-In API" and enable it

## Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Create two OAuth client IDs:

### Web Client ID (Required)
- Application type: "Web application"
- Name: "Your App Name (Web)"
- Authorized JavaScript origins: `https://your-supabase-url.supabase.co`
- Authorized redirect URIs: `https://your-supabase-url.supabase.co/auth/v1/callback`

### iOS Client ID (Optional but recommended)
- Application type: "iOS"
- Name: "Your App Name (iOS)"
- Bundle ID: `com.mebattll.habittracker` (should match your app's bundle identifier)

## Step 3: Configure Environment Variables

Update your `.env` file with the client IDs:

```bash
# Replace with your actual Google OAuth client IDs
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id_here.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id_here.apps.googleusercontent.com
```

## Step 4: Supabase Configuration

1. Go to your Supabase dashboard
2. Navigate to "Authentication" > "Providers"
3. Enable Google provider
4. Add your Web Client ID and Client Secret from Google Cloud Console
5. Set the redirect URL to: `https://your-supabase-url.supabase.co/auth/v1/callback`

## Step 5: iOS Configuration (if using iOS client ID)

The app is already configured to use Google Sign-In on iOS through the `@react-native-google-signin/google-signin` package.

### Important: Update app.json with iOS URL Scheme

After creating your iOS client ID in Google Cloud Console, you need to update the `app.json` file:

1. Copy your iOS client ID from Google Cloud Console (it should look like: `123456789-abcdefg.apps.googleusercontent.com`)
2. Replace `YOUR_IOS_CLIENT_ID_HERE` in `app.json` with your actual iOS client ID
3. The iosUrlScheme should be: `com.googleusercontent.apps.123456789-abcdefg` (remove the `.apps.googleusercontent.com` part)

Example:
```json
{
  "expo": {
    "plugins": [
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.123456789-abcdefg"
        }
      ]
    ]
  }
}
```

### Rebuild the app

After updating the config, you need to rebuild your app:

```bash
npx expo prebuild --clean
npx expo run:ios
```

## Testing

1. Make sure you've added valid client IDs to your `.env` file
2. Restart your development server: `npx expo start --clear`
3. Test the Google Sign-In flow on both the login and register screens

## Troubleshooting

### Common Issues:

1. **"Google Sign-In not available"**: 
   - Check that your client IDs are correctly set in `.env`
   - Ensure Google Sign-In API is enabled in Google Cloud Console

2. **"No ID token received"**:
   - Verify your web client ID is correct
   - Check that your Supabase Google provider is properly configured

3. **"Sign-in failed"**:
   - Check the console logs for detailed error messages
   - Ensure your redirect URLs match in Google Cloud Console and Supabase

### Debug Mode

The app includes extensive logging for Google Sign-In. Check the console for detailed error messages starting with `[AuthService]`.

## Production Notes

- Make sure to use production-ready client IDs (not test ones)
- Test the sign-in flow thoroughly on physical devices
- Consider implementing sign-out functionality if needed
