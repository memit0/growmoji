import { useTheme } from '@/contexts/ThemeContext';
import { AuthService } from '@/lib/auth/AuthService';
import { OAuthDebugger } from '@/lib/utils/oauthDebug';
import * as Linking from 'expo-linking';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function OAuthDebugScreen() {
    const { colors, spacing, typography, borderRadius } = useTheme();
    const [logs, setLogs] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const addLog = (message: string) => {
        const timestamp = new Date().toISOString();
        setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
        console.log(`[OAuthDebugScreen] ${message}`);
    };

    const clearLogs = () => {
        setLogs([]);
        addLog('Logs cleared');
    };

    const testEnvironment = () => {
        addLog('=== ENVIRONMENT TEST ===');
        OAuthDebugger.logEnvironment();
        OAuthDebugger.logSupabaseConfig();

        const scheme = Linking.createURL('/');
        addLog(`Deep Link Scheme: ${scheme}`);
        addLog(`Expected Redirect: com.mebattll.habittracker://auth/callback`);
        addLog('Environment test completed - check console for details');
    };

    const testDeepLinkHandling = async () => {
        addLog('=== DEEP LINK TEST ===');

        // Test with a mock Apple OAuth success URL
        const mockAppleSuccessUrl = 'com.mebattll.habittracker://auth/callback#access_token=mock_access_token&refresh_token=mock_refresh_token&token_type=bearer&expires_in=3600&provider=apple';

        addLog(`Testing deep link handling with mock URL`);
        addLog(`Mock URL: ${mockAppleSuccessUrl}`);

        try {
            const result = await AuthService.handleAuthRedirect(mockAppleSuccessUrl);
            addLog(`Deep link test result: ${JSON.stringify(result)}`);
        } catch (error) {
            addLog(`Deep link test error: ${error}`);
        }
    };

    const testAppleOAuth = async () => {
        if (isLoading) return;

        addLog('=== APPLE OAUTH TEST ===');
        setIsLoading(true);

        try {
            addLog('Starting Apple OAuth test...');
            const result = await AuthService.signInWithOAuth('apple');
            addLog(`Apple OAuth result: ${JSON.stringify(result, null, 2)}`);

            if (result.success && result.data?.url) {
                addLog(`Redirect URL received: ${result.data.url}`);
                Alert.alert(
                    'OAuth URL Generated',
                    `Apple OAuth URL was generated successfully. Check the logs for details.\n\nURL: ${result.data.url.substring(0, 100)}...`,
                    [{ text: 'OK' }]
                );
            } else {
                addLog('No redirect URL received - this indicates a problem');
                Alert.alert('OAuth Issue', 'No redirect URL was generated. Check the logs for details.');
            }
        } catch (error: any) {
            addLog(`Apple OAuth error: ${error.message}`);
            Alert.alert('OAuth Error', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const testGoogleOAuth = async () => {
        if (isLoading) return;

        addLog('=== GOOGLE OAUTH TEST ===');
        setIsLoading(true);

        try {
            addLog('Starting Google OAuth test...');
            const result = await AuthService.signInWithOAuth('google');
            addLog(`Google OAuth result: ${JSON.stringify(result, null, 2)}`);

            if (result.success && result.data?.url) {
                addLog(`Redirect URL received: ${result.data.url}`);
                Alert.alert(
                    'OAuth URL Generated',
                    `Google OAuth URL was generated successfully. Check the logs for details.\n\nURL: ${result.data.url.substring(0, 100)}...`,
                    [{ text: 'OK' }]
                );
            } else {
                addLog('No redirect URL received - this indicates a problem');
                Alert.alert('OAuth Issue', 'No redirect URL was generated. Check the logs for details.');
            }
        } catch (error: any) {
            addLog(`Google OAuth error: ${error.message}`);
            Alert.alert('OAuth Error', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            padding: spacing.md,
        },
        title: {
            fontSize: typography.fontSize.xl,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: spacing.lg,
            textAlign: 'center',
        },
        buttonContainer: {
            marginBottom: spacing.lg,
        },
        button: {
            backgroundColor: colors.primary,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            marginBottom: spacing.sm,
            alignItems: 'center',
        },
        buttonText: {
            color: '#FFFFFF',
            fontSize: typography.fontSize.md,
            fontWeight: 'bold',
        },
        clearButton: {
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
        },
        clearButtonText: {
            color: colors.text,
        },
        logsContainer: {
            flex: 1,
            backgroundColor: colors.card,
            borderRadius: borderRadius.md,
            padding: spacing.sm,
        },
        logsTitle: {
            fontSize: typography.fontSize.md,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: spacing.sm,
        },
        logText: {
            fontSize: typography.fontSize.xs,
            color: colors.text,
            fontFamily: 'Courier New', // Monospace font for logs
            marginBottom: spacing.xs,
        },
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>OAuth Debug Console</Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={testEnvironment} style={styles.button}>
                    <Text style={styles.buttonText}>Test Environment</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={testDeepLinkHandling} style={styles.button}>
                    <Text style={styles.buttonText}>Test Deep Link Handling</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={testAppleOAuth}
                    style={[styles.button, isLoading && { opacity: 0.7 }]}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>
                        {isLoading ? 'Testing Apple OAuth...' : 'Test Apple OAuth'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={testGoogleOAuth}
                    style={[styles.button, isLoading && { opacity: 0.7 }]}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>
                        {isLoading ? 'Testing Google OAuth...' : 'Test Google OAuth'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={clearLogs} style={[styles.button, styles.clearButton]}>
                    <Text style={[styles.buttonText, styles.clearButtonText]}>Clear Logs</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.logsContainer}>
                <Text style={styles.logsTitle}>Debug Logs ({logs.length})</Text>
                <ScrollView showsVerticalScrollIndicator={true}>
                    {logs.map((log, index) => (
                        <Text key={index} style={styles.logText}>
                            {log}
                        </Text>
                    ))}
                    {logs.length === 0 && (
                        <Text style={[styles.logText, { fontStyle: 'italic', color: colors.border }]}>
                            No logs yet. Run a test to see debug information.
                        </Text>
                    )}
                </ScrollView>
            </View>
        </View>
    );
}
