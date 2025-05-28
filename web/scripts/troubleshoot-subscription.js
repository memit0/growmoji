#!/usr/bin/env node

/**
 * Growmoji Web Subscription Troubleshooting Script
 * 
 * Run this script to diagnose common subscription issues:
 * node scripts/troubleshoot-subscription.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Growmoji Web Subscription Troubleshooting\n');

// Check if we're in the right directory
const currentDir = process.cwd();
const expectedFiles = ['package.json', '.env.local', 'next.config.ts'];
const hasExpectedFiles = expectedFiles.every(file => fs.existsSync(path.join(currentDir, file)));

if (!hasExpectedFiles) {
  console.error('❌ Error: This script must be run from the web app root directory');
  console.error('   Expected files:', expectedFiles.join(', '));
  process.exit(1);
}

console.log('✅ Running from correct directory\n');

// Check environment variables
console.log('📋 Environment Variables Check:');
const envPath = path.join(currentDir, '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_REVENUECAT_WEB_API_KEY'
];

const setVars = {};
envLines.forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    setVars[key.trim()] = value.trim();
  }
});

requiredVars.forEach(varName => {
  if (setVars[varName]) {
    console.log(`  ✅ ${varName}: Set (${setVars[varName].substring(0, 10)}...)`);
  } else {
    console.log(`  ❌ ${varName}: Missing`);
  }
});

// Specific checks for RevenueCat
if (setVars['NEXT_PUBLIC_REVENUECAT_WEB_API_KEY']) {
  const apiKey = setVars['NEXT_PUBLIC_REVENUECAT_WEB_API_KEY'];
  
  console.log('\n🔑 RevenueCat API Key Analysis:');
  console.log(`  Key preview: ${apiKey.substring(0, 15)}...`);
  
  if (apiKey.startsWith('rcb_')) {
    console.log('  ✅ Appears to be a valid Web Billing API key format');
  } else if (apiKey.startsWith('appl_') || apiKey.startsWith('goog_')) {
    console.log('  ⚠️  Warning: This looks like a mobile API key, not Web Billing');
    console.log('     Web Billing requires a different API key starting with "rcb_"');
  } else {
    console.log('  ❓ Unknown API key format - verify in RevenueCat dashboard');
  }
  
  // Check key length (RevenueCat keys are typically specific lengths)
  if (apiKey.length < 20) {
    console.log('  ⚠️  Warning: API key seems too short');
  }
} else {
  console.log('\n❌ RevenueCat Web API Key is missing!');
}

// Check package.json for required dependencies
console.log('\n📦 Dependencies Check:');
const packageJsonPath = path.join(currentDir, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const requiredDeps = [
  '@revenuecat/purchases-js',
  '@clerk/nextjs',
  '@supabase/supabase-js'
];

requiredDeps.forEach(dep => {
  const version = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
  if (version) {
    console.log(`  ✅ ${dep}: ${version}`);
  } else {
    console.log(`  ❌ ${dep}: Missing`);
  }
});

// Check if Next.js is configured correctly
console.log('\n⚙️  Next.js Configuration:');
const nextConfigPath = path.join(currentDir, 'next.config.ts');
if (fs.existsSync(nextConfigPath)) {
  console.log('  ✅ next.config.ts exists');
  // Could add more specific checks here
} else {
  console.log('  ❌ next.config.ts not found');
}

// Output recommendations
console.log('\n💡 Troubleshooting Recommendations:\n');

if (!setVars['NEXT_PUBLIC_REVENUECAT_WEB_API_KEY']) {
  console.log('1. 🔴 CRITICAL: Set up RevenueCat Web API Key');
  console.log('   - Go to RevenueCat Dashboard');
  console.log('   - Create a Web Billing app if you haven\'t');
  console.log('   - Copy the Public API Key (starts with "rcb_")');
  console.log('   - Add it to .env.local as NEXT_PUBLIC_REVENUECAT_WEB_API_KEY\n');
}

console.log('2. 🟡 Test your setup:');
console.log('   - Run: npm run dev');
console.log('   - Navigate to /debug in your app');
console.log('   - Check browser console for RevenueCat logs');
console.log('   - Use the debug tools to test subscription status\n');

console.log('3. 🟡 Common issues and solutions:');
console.log('   - If premium user sees paywall: Check entitlement names match');
console.log('   - If no subscription info shows: Verify API key is correct');
console.log('   - If purchase fails: Check RevenueCat Web Billing setup');
console.log('   - If sync issues: Verify user ID consistency\n');

console.log('4. 🟢 RevenueCat Dashboard checklist:');
console.log('   - Web Billing app is created and configured');
console.log('   - Products are created with correct pricing');
console.log('   - Entitlements are set up and linked to products');
console.log('   - Offerings are configured with packages');
console.log('   - Stripe account is connected (for payments)\n');

console.log('5. 🔵 Debug tools:');
console.log('   - Use the /debug page in your app');
console.log('   - Check browser DevTools console');
console.log('   - Use RevenueCat dashboard customer lookup');
console.log('   - Test with known premium users\n');

console.log('✨ For more help, check the PREMIUM_SETUP.md file or RevenueCat docs');
console.log('🌐 RevenueCat Web Billing docs: https://docs.revenuecat.com/docs/web-billing\n'); 