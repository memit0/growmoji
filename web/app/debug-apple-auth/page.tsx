'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase';
import { useState } from 'react';

export default function AppleAuthDebugPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createSupabaseBrowserClient();

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    };

    const clearLogs = () => {
        setLogs([]);
    };

    const runEnvironmentTests = () => {
        addLog('=== ENVIRONMENT TESTS ===');

        // Test 1: HTTPS Check
        const isHTTPS = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
        addLog(`✅ HTTPS Check: ${isHTTPS ? 'PASS' : 'FAIL'} (${window.location.protocol}//${window.location.hostname})`);

        // Test 2: Popup Test
        try {
            const popup = window.open('', '_blank', 'width=500,height=600');
            if (popup) {
                popup.close();
                addLog('✅ Popup Test: PASS');
            } else {
                addLog('❌ Popup Test: FAIL (popup blocked)');
            }
        } catch (error) {
            addLog('❌ Popup Test: FAIL (error opening popup)');
        }

        // Test 3: Third-party cookies
        addLog('⚠️  Third-party Cookies: Check browser settings manually');

        // Test 4: Supabase configuration
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const appleClientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
        addLog(`✅ Supabase URL: ${supabaseUrl ? 'SET' : 'MISSING'}`);
        addLog(`✅ Apple Client ID: ${appleClientId ? 'SET' : 'MISSING'} (${appleClientId})`);

        // Test 5: Expected URLs
        addLog('📋 Expected Configuration:');
        addLog(`   Apple Services ID: ${appleClientId || 'NOT SET'}`);
        addLog(`   Supabase callback: ${supabaseUrl}/auth/v1/callback`);
        addLog(`   App callback: ${window.location.origin}/auth/callback`);
    };

    const testAppleSignIn = async () => {
        setIsLoading(true);
        addLog('=== APPLE SIGN-IN TEST ===');

        try {
            addLog('Starting Apple Sign-In...');

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'apple',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                addLog(`❌ Apple Sign-In Error: ${error.message}`);
                addLog(`   Error details: ${JSON.stringify(error, null, 2)}`);
            } else {
                addLog('✅ Apple Sign-In initiated successfully');
                addLog(`   Redirect URL: ${data.url}`);
            }
        } catch (error: any) {
            addLog(`❌ Exception during Apple Sign-In: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const checkSupabaseSession = async () => {
        addLog('=== SESSION CHECK ===');

        try {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                addLog(`❌ Session Error: ${error.message}`);
            } else if (session) {
                addLog('✅ Active session found');
                addLog(`   User ID: ${session.user.id}`);
                addLog(`   Email: ${session.user.email || 'No email'}`);
                addLog(`   Provider: ${session.user.app_metadata.provider || 'Unknown'}`);
            } else {
                addLog('ℹ️  No active session');
            }
        } catch (error: any) {
            addLog(`❌ Exception checking session: ${error.message}`);
        }
    };

    const checkAppleReachability = async () => {
        addLog('=== APPLE SERVICES REACHABILITY ===');

        try {
            // Test if we can reach Apple ID servers
            const response = await fetch('https://appleid.apple.com/.well-known/openid_configuration', {
                method: 'HEAD',
                mode: 'no-cors'
            });
            addLog('✅ Apple ID services: Reachable');
        } catch (error) {
            addLog('❌ Apple ID services: Not reachable or blocked');
        }

        try {
            // Test if we can reach Supabase
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            if (supabaseUrl) {
                const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
                    method: 'GET',
                });
                if (response.ok) {
                    addLog('✅ Supabase auth: Reachable');
                } else {
                    addLog(`❌ Supabase auth: Error ${response.status}`);
                }
            }
        } catch (error) {
            addLog('❌ Supabase auth: Not reachable');
        }
    };

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Apple Sign-In Debug Tool</h1>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <h2 className="text-red-800 font-semibold mb-2">⚠️ IMPORTANT: Apple Sign-In Limitations</h2>
                    <ul className="text-red-700 space-y-1">
                        <li>• Apple Sign-In does NOT work on localhost</li>
                        <li>• Must test on production domain (www.growmoji.app)</li>
                        <li>• Requires HTTPS (except localhost)</li>
                        <li>• localhost URLs cannot be added to Apple Services ID</li>
                    </ul>
                </div>
            </div>

            <div className="grid gap-4 mb-8">
                <button
                    onClick={runEnvironmentTests}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Run Environment Tests
                </button>

                <button
                    onClick={testAppleSignIn}
                    disabled={isLoading}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                >
                    {isLoading ? 'Testing Apple Sign-In...' : 'Test Apple Sign-In'}
                </button>

                <button
                    onClick={checkSupabaseSession}
                    className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                >
                    Check Current Session
                </button>

                <button
                    onClick={checkAppleReachability}
                    className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                >
                    Check Apple/Supabase Reachability
                </button>

                <button
                    onClick={clearLogs}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                    Clear Logs
                </button>
            </div>

            <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
                <div className="mb-2 text-gray-400">Debug Output:</div>
                {logs.length === 0 ? (
                    <div className="text-gray-500">Click a button above to run tests...</div>
                ) : (
                    logs.map((log, index) => (
                        <div key={index} className="mb-1">
                            {log}
                        </div>
                    ))
                )}
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-blue-800 font-semibold mb-2">Configuration Checklist:</h3>
                <div className="text-blue-700 space-y-2">
                    <div>1. <strong>Apple Developer Console</strong>: Services ID `{process.env.NEXT_PUBLIC_APPLE_CLIENT_ID}` configured</div>
                    <div>2. <strong>Domain Verification</strong>: www.growmoji.app verified in Apple Console</div>
                    <div>3. <strong>Return URLs</strong>: `https://xtcktlilfkfhahjdvhuv.supabase.co/auth/v1/callback` added</div>
                    <div>4. <strong>Supabase</strong>: Apple provider enabled with Services ID, Team ID, Key ID, Private Key</div>
                    <div>5. <strong>Testing</strong>: Deploy to production and test on https://www.growmoji.app</div>
                </div>
            </div>
        </div>
    );
}
