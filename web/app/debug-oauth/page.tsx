'use client';

import { debugOAuthConfig, getOAuthRedirectUrl, getSiteUrl, validateOAuthConfig } from '@/lib/auth-config';
import { useEffect, useState } from 'react';

interface DebugInfo {
    environment: string;
    redirectUrl: string;
    siteUrl: string;
    appUrl: string | undefined;
    supabaseUrl: string | undefined;
    windowOrigin: string;
    timestamp: string;
    configValid: boolean;
    configError?: string;
}

export default function OAuthDebugPage() {
    const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

    useEffect(() => {
        // Run OAuth configuration debug
        debugOAuthConfig();

        const info: DebugInfo = {
            environment: process.env.NODE_ENV || 'development',
            redirectUrl: getOAuthRedirectUrl(),
            siteUrl: getSiteUrl(),
            appUrl: process.env.NEXT_PUBLIC_APP_URL,
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
            windowOrigin: typeof window !== 'undefined' ? window.location.origin : 'SSR',
            timestamp: new Date().toISOString(),
            configValid: false,
        };

        try {
            validateOAuthConfig();
            info.configValid = true;
        } catch (error) {
            info.configValid = false;
            info.configError = error instanceof Error ? error.message : 'Unknown error';
        }

        setDebugInfo(info);
    }, []);

    const testRedirectUrl = () => {
        const url = getOAuthRedirectUrl();
        alert(`Current redirect URL: ${url}`);
    };

    if (!debugInfo) {
        return <div className="p-8">Loading OAuth debug info...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold mb-6">OAuth Configuration Debug</h1>

                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-3">Configuration Status</h2>
                        <div className={`p-4 rounded-lg ${debugInfo.configValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            {debugInfo.configValid ? (
                                <div className="text-green-800">
                                    ✅ OAuth configuration is valid
                                </div>
                            ) : (
                                <div className="text-red-800">
                                    ❌ OAuth configuration has issues: {debugInfo.configError}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-3">Current Configuration</h2>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <pre className="text-sm overflow-x-auto">
                                {JSON.stringify(debugInfo, null, 2)}
                            </pre>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-3">Expected URLs for Google Cloud Console</h2>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <p className="font-medium text-blue-800 mb-2">Add these URLs to your Google OAuth client:</p>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• <code>{debugInfo.redirectUrl}</code></li>
                                <li>• <code>{process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback</code></li>
                            </ul>
                            <p className="text-sm text-blue-600 mt-3">
                                <strong>Remove any localhost URLs</strong> from your Google OAuth client configuration
                            </p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-3">Production Checklist</h2>
                        <div className="space-y-2">
                            {[
                                { label: 'Environment is production', check: debugInfo.environment === 'production' },
                                { label: 'App URL is HTTPS', check: debugInfo.appUrl?.startsWith('https://') },
                                { label: 'Redirect URL uses production domain', check: !debugInfo.redirectUrl.includes('localhost') },
                                { label: 'Window origin matches app URL', check: debugInfo.windowOrigin === debugInfo.appUrl },
                            ].map((item, index) => (
                                <div key={index} className={`flex items-center p-2 rounded ${item.check ? 'bg-green-50' : 'bg-yellow-50'}`}>
                                    <span className="mr-2">{item.check ? '✅' : '⚠️'}</span>
                                    <span className={item.check ? 'text-green-800' : 'text-yellow-800'}>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={testRedirectUrl}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Test Redirect URL
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                        >
                            Refresh Debug Info
                        </button>
                    </div>

                    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h3 className="font-semibold text-yellow-800 mb-2">Quick Fix Steps:</h3>
                        <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                            <li>Go to Google Cloud Console → APIs & Services → Credentials</li>
                            <li>Find your OAuth 2.0 Client ID (Web application)</li>
                            <li>Edit the client and update "Authorized redirect URIs"</li>
                            <li>Remove any localhost URLs and add the production URLs shown above</li>
                            <li>Save changes and test Google Sign-In again</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
