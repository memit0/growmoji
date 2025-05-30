#!/usr/bin/env node

/**
 * Google Sign-In Setup Helper Script
 * 
 * This script helps you configure Google Sign-In for your Expo app.
 * Run this after obtaining your OAuth client IDs from Google Cloud Console.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function main() {
    console.log('🔧 Google Sign-In Setup Helper');
    console.log('===============================\n');

    console.log('Before running this script, make sure you have:');
    console.log('1. Created OAuth client IDs in Google Cloud Console');
    console.log('2. Enabled Google Sign-In API');
    console.log('3. Configured Supabase authentication provider\n');

    const proceed = await question('Do you want to continue? (y/N): ');
    if (proceed.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        rl.close();
        return;
    }

    console.log('\n📝 Please provide your Google OAuth client IDs:\n');

    // Get client IDs
    const webClientId = await question('Web Client ID (for Supabase): ');
    const iosClientId = await question('iOS Client ID (for native iOS): ');

    if (!webClientId || !iosClientId) {
        console.log('❌ Both client IDs are required.');
        rl.close();
        return;
    }

    // Extract iOS URL scheme
    const iosUrlScheme = iosClientId.replace('.apps.googleusercontent.com', '');
    const reversedIosScheme = `com.googleusercontent.apps.${iosUrlScheme}`;

    console.log(`\n🔍 Extracted iOS URL Scheme: ${reversedIosScheme}\n`);

    try {
        // Update .env file
        const envPath = path.join(process.cwd(), '.env');
        let envContent = '';

        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        }

        // Remove existing Google client ID lines
        envContent = envContent.replace(/EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=.*\n?/g, '');
        envContent = envContent.replace(/EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=.*\n?/g, '');

        // Add new lines
        if (!envContent.endsWith('\n') && envContent.length > 0) {
            envContent += '\n';
        }
        envContent += `\n# Google Sign-In Configuration\n`;
        envContent += `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=${webClientId}\n`;
        envContent += `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=${iosClientId}\n`;

        fs.writeFileSync(envPath, envContent);
        console.log('✅ Updated .env file');

        // Update app.json
        const appJsonPath = path.join(process.cwd(), 'app.json');
        const appJsonContent = fs.readFileSync(appJsonPath, 'utf8');
        const appJson = JSON.parse(appJsonContent);

        // Find and update the Google Sign-In plugin
        const plugins = appJson.expo.plugins;
        for (let i = 0; i < plugins.length; i++) {
            if (Array.isArray(plugins[i]) && plugins[i][0] === '@react-native-google-signin/google-signin') {
                plugins[i][1].iosUrlScheme = reversedIosScheme;
                break;
            }
        }

        fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
        console.log('✅ Updated app.json with iOS URL scheme');

        console.log('\n🎉 Configuration complete!');
        console.log('\n📋 Next steps:');
        console.log('1. Rebuild your app: npx expo prebuild --clean');
        console.log('2. Run on iOS: npx expo run:ios');
        console.log('3. Run on Android: npx expo run:android');
        console.log('4. Test Google Sign-In on both login and register screens');
        console.log('\n💡 Tip: Use the OAuth debug screen in your app for troubleshooting');

    } catch (error) {
        console.error('❌ Error updating configuration:', error.message);
    }

    rl.close();
}

main().catch(console.error);
