'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function DebugAppleAuthPage() {
    const [debugInfo, setDebugInfo] = useState<any>({});
    const [testResults, setTestResults] = useState<string[]>([]);
    const supabase = createSupabaseBrowserClient();

    const addResult = (result: string) => {
        setTestResults(prev => [...prev, result]);
    };

    const runTests = async () => {
        setTestResults([]);

        // 1. Environment checks
        addResult('=== ENVIRONMENT CHECKS ===');
        addResult(`Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
        addResult(`Has Supabase Anon Key: ${!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`);

        // 2. Browser environment
        addResult('\n=== BROWSER ENVIRONMENT ===');
        addResult(`Protocol: ${window.location.protocol}`);
        addResult(`Hostname: ${window.location.hostname}`);
        addResult(`Origin: ${window.location.origin}`);
        addResult(`User Agent: ${navigator.userAgent}`);

        // 3. Security context
        addResult('\n=== SECURITY CONTEXT ===');
        addResult(`Is HTTPS: ${window.location.protocol === 'https:'}`);
        addResult(`Is localhost: ${window.location.hostname === 'localhost'}`);
        addResult(`Third-party cookies: ${navigator.cookieEnabled}`);

        // 4. Popup test
        addResult('\n=== POPUP TEST ===');
        try {
            const popup = window.open('', '_blank', 'width=500,height=600');
            if (popup) {
                popup.close();
                addResult('✅ Popup test passed');
            } else {
                addResult('❌ Popup blocked - this will prevent Apple Sign In');
            }
        } catch (error) {
            addResult(`❌ Popup error: ${error}`);
        }

        // 5. Supabase connection test
        addResult('\n=== SUPABASE CONNECTION ===');
        try {
            const { data, error } = await supabase.auth.getSession();
            addResult(`✅ Supabase connection: ${error ? 'Error - ' + error.message : 'Success'}`);
            addResult(`Current session: ${data.session ? 'Active' : 'None'}`);
        } catch (error) {
            addResult(`❌ Supabase error: ${error}`);
        }

        // 6. Apple OAuth URL generation test
        addResult('\n=== APPLE OAUTH TEST ===');
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'apple',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (error) {
                addResult(`❌ Apple OAuth setup error: ${error.message}`);
            } else if (data.url) {
                addResult(`✅ Apple OAuth URL generated successfully`);
                addResult(`OAuth URL: ${data.url.substring(0, 100)}...`);

                // Parse OAuth URL for debugging
                try {
                    const url = new URL(data.url);
                    addResult(`OAuth Host: ${url.hostname}`);
                    addResult(`OAuth Path: ${url.pathname}`);
                    addResult(`Has client_id: ${url.searchParams.has('client_id')}`);
                    addResult(`Has redirect_uri: ${url.searchParams.has('redirect_uri')}`);
                    addResult(`Has state: ${url.searchParams.has('state')}`);
                    addResult(`Has scope: ${url.searchParams.has('scope')}`);
                } catch (e) {
                    addResult(`❌ Error parsing OAuth URL: ${e}`);
                }
            } else {
                addResult('❌ No OAuth URL generated');
            }
        } catch (error) {
            addResult(`❌ Apple OAuth test failed: ${error}`);
        }
    };

    const testAppleSignIn = async () => {
        addResult('\n=== TESTING APPLE SIGN IN ===');
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'apple',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (error) {
                addResult(`❌ Apple Sign In failed: ${error.message}`);
            } else if (data.url) {
                addResult(`✅ Redirecting to Apple...`);
                window.location.href = data.url;
            }
        } catch (error) {
            addResult(`❌ Apple Sign In error: ${error}`);
        }
    };

    useEffect(() => {
        runTests();
    }, []);

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <h1 className="text-2xl font-bold mb-6">Apple Auth Debug Tool</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <h2 className="text-lg font-semibold mb-4">Debug Results</h2>
                    <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                        {testResults.map((result, index) => (
                            <div key={index} className="whitespace-pre-wrap">
                                {result}
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-semibold mb-4">Actions</h2>
                    <div className="space-y-4">
                        <button
                            onClick={runTests}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
                        >
                            Re-run All Tests
                        </button>

                        <button
                            onClick={testAppleSignIn}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
                        >
                            Test Apple Sign In
                        </button>

                        <div className="bg-yellow-100 p-4 rounded">
                            <h3 className="font-medium mb-2">Required Apple Developer Console Setup:</h3>
                            <div className="text-sm space-y-2">
                                <div>
                                    <strong>Services ID Configuration:</strong>
                                    <ul className="ml-4 mt-1 space-y-1">
                                        <li>• Primary Domain: <code>www.growmoji.app</code></li>
                                        <li>• Return URLs: <code>https://xtcktlilfkfhahjdvhuv.supabase.co/auth/v1/callback</code></li>
                                        <li>• ⚠️ DO NOT add localhost URLs (Apple doesn't allow them)</li>
                                    </ul>
                                </div>
                                <div>
                                    <strong>Common Issues to Check:</strong>
                                    <ul className="ml-4 mt-1 space-y-1">
                                        <li>• Client ID mismatch in Supabase config</li>
                                        <li>• Missing or invalid Key ID in Supabase</li>
                                        <li>• Wrong Team ID in Supabase</li>
                                        <li>• Invalid private key format</li>
                                        <li>• Domain not verified in Apple Developer Console</li>
                                        <li>• Services ID not enabled for Sign In with Apple</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="bg-red-100 p-4 rounded">
                            <h3 className="font-medium mb-2">Localhost Development Note:</h3>
                            <p className="text-sm">
                                Apple Sign In cannot be tested on localhost. You must test on your production domain
                                <code>www.growmoji.app</code> or deploy to a staging environment with HTTPS.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
