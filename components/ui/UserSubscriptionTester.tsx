import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedText } from './ThemedText';

export function UserSubscriptionTester() {
    const { colors, spacing, typography, borderRadius } = useTheme();
    const { user } = useAuth();
    const {
        customerInfo,
        isPremium,
        refreshCustomerInfo,
        simulatePurchase,
        checkRevenueCatConfig,
        isLoading,
        error,
        debugPremiumOverride,
        setDebugPremiumOverride
    } = useSubscription();

    const [testResults, setTestResults] = useState<string[]>([]);

    const addTestResult = (result: string) => {
        setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
    };

    const runUserIdTest = () => {
        addTestResult(`--- USER ID TEST ---`);
        addTestResult(`Current User ID: ${user?.id || 'NOT FOUND'}`);
        addTestResult(`User Email: ${user?.email || 'NOT FOUND'}`);

        if (!user?.id) {
            addTestResult(`❌ ERROR: No user ID found - check AuthContext`);
        } else {
            addTestResult(`✅ User ID found: ${user.id}`);
        }
    };

    const runRevenueCatUserTest = async () => {
        addTestResult(`--- REVENUECAT USER TEST ---`);

        try {
            await refreshCustomerInfo();

            if (customerInfo) {
                addTestResult(`✅ RevenueCat Customer Info Retrieved`);
                addTestResult(`RevenueCat User ID: ${customerInfo.originalAppUserId}`);
                addTestResult(`User ID Match: ${user?.id === customerInfo.originalAppUserId ? '✅ YES' : '❌ NO'}`);

                const activeEntitlements = Object.keys(customerInfo.entitlements.active);
                addTestResult(`Active Entitlements: ${activeEntitlements.length > 0 ? activeEntitlements.join(', ') : 'None'}`);
                addTestResult(`Premium Status: ${isPremium ? '✅ PREMIUM' : '❌ FREE'}`);
            } else {
                addTestResult(`❌ No customer info available`);
            }
        } catch (error: any) {
            addTestResult(`❌ RevenueCat Test Failed: ${error.message}`);
        }
    };

    const runSubscriptionIsolationTest = () => {
        addTestResult(`--- SUBSCRIPTION ISOLATION TEST ---`);
        addTestResult(`This test requires manual verification:`);
        addTestResult(`1. Note current user: ${user?.id || 'Unknown'}`);
        addTestResult(`2. Note current premium status: ${isPremium ? 'Premium' : 'Free'}`);
        addTestResult(`3. Log out and log in as different user`);
        addTestResult(`4. Check if premium status is different/independent`);
        addTestResult(`5. Verify RevenueCat dashboard shows separate users`);
    };

    const simulatePremiumForCurrentUser = () => {
        addTestResult(`--- SIMULATING PREMIUM PURCHASE ---`);
        addTestResult(`User: ${user?.id || 'Unknown'}`);
        addTestResult(`Previous Status: ${isPremium ? 'Premium' : 'Free'}`);

        simulatePurchase('Growmoji Premium');

        setTimeout(() => {
            addTestResult(`New Status: ${isPremium ? 'Premium' : 'Free'}`);
            addTestResult(`✅ Premium simulation completed`);
        }, 1000);
    };

    const runComprehensiveCheck = async () => {
        addTestResult(`--- COMPREHENSIVE REVENUECAT CHECK ---`);
        try {
            await checkRevenueCatConfig();
            addTestResult(`✅ Check complete - see console for detailed logs`);
        } catch (error: any) {
            addTestResult(`❌ Check failed: ${error.message}`);
        }
    };

    const clearResults = () => {
        setTestResults([]);
    };

    const showTestInstructions = () => {
        Alert.alert(
            'User Subscription Testing Instructions',
            `🧪 MANUAL TESTING STEPS:

1. USER ISOLATION TEST
   • Log in as User A
   • Note subscription status
   • Log out, log in as User B  
   • Verify different status possible

2. SUBSCRIPTION PURCHASE TEST
   • While as User A: simulate/buy premium
   • Switch to User B: verify still free
   • This proves no shared subscription

3. REVENUECAT DASHBOARD CHECK
   • Go to RevenueCat dashboard
   • Search for both user IDs
   • Verify separate customer records

4. LOG VERIFICATION
   Look for in console:
   ✅ "[RevenueCat] Using user ID: [UNIQUE_ID]"
   ✅ Different IDs for different users
   ❌ Undefined or same IDs

EXPECTED RESULTS:
✅ Each user has unique subscription status
✅ Premium changes affect only current user
✅ RevenueCat shows separate customers`,
            [{ text: 'OK' }]
        );
    };

    const styles = StyleSheet.create({
        container: {
            padding: spacing.lg,
            backgroundColor: colors.background,
        },
        title: {
            fontSize: typography.fontSize.xl,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: spacing.lg,
            textAlign: 'center',
        },
        section: {
            backgroundColor: colors.card,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            marginBottom: spacing.md,
        },
        sectionTitle: {
            fontSize: typography.fontSize.lg,
            fontWeight: '600',
            color: colors.text,
            marginBottom: spacing.sm,
        },
        infoRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: spacing.xs,
        },
        infoLabel: {
            fontSize: typography.fontSize.md,
            color: colors.text,
            flex: 1,
        },
        infoValue: {
            fontSize: typography.fontSize.md,
            color: colors.text,
            fontWeight: '500',
            flex: 2,
            textAlign: 'right',
        },
        button: {
            backgroundColor: colors.primary,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            marginVertical: spacing.xs,
            alignItems: 'center',
        },
        buttonSecondary: {
            backgroundColor: colors.secondary,
        },
        buttonDanger: {
            backgroundColor: '#ef4444',
        },
        buttonText: {
            color: colors.background,
            fontSize: typography.fontSize.md,
            fontWeight: '600',
        },
        resultsContainer: {
            backgroundColor: colors.card,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            marginTop: spacing.md,
            maxHeight: 300,
        },
        resultsTitle: {
            fontSize: typography.fontSize.lg,
            fontWeight: '600',
            color: colors.text,
            marginBottom: spacing.sm,
        },
        resultText: {
            fontSize: typography.fontSize.sm,
            color: colors.text,
            marginBottom: spacing.xs,
            fontFamily: 'monospace',
        },
        statusIndicator: {
            width: 12,
            height: 12,
            borderRadius: 6,
            marginRight: spacing.sm,
        },
        statusRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: spacing.xs,
        },
    });

    return (
        <ScrollView style={styles.container}>
            <ThemedText style={styles.title}>
                🧪 User Subscription Tester
            </ThemedText>

            {/* Current Status Section */}
            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Current Status</ThemedText>

                <View style={styles.infoRow}>
                    <ThemedText style={styles.infoLabel}>User ID:</ThemedText>
                    <ThemedText style={styles.infoValue}>{user?.id || 'Not found'}</ThemedText>
                </View>

                <View style={styles.infoRow}>
                    <ThemedText style={styles.infoLabel}>Email:</ThemedText>
                    <ThemedText style={styles.infoValue}>{user?.email || 'Not found'}</ThemedText>
                </View>

                <View style={styles.statusRow}>
                    <View style={[
                        styles.statusIndicator,
                        { backgroundColor: isPremium ? '#10b981' : '#ef4444' }
                    ]} />
                    <ThemedText style={styles.infoLabel}>Subscription Status:</ThemedText>
                    <ThemedText style={styles.infoValue}>
                        {isPremium ? '✅ Premium' : '❌ Free'}
                    </ThemedText>
                </View>

                <View style={styles.statusRow}>
                    <View style={[
                        styles.statusIndicator,
                        { backgroundColor: isLoading ? '#f59e0b' : '#10b981' }
                    ]} />
                    <ThemedText style={styles.infoLabel}>RevenueCat Status:</ThemedText>
                    <ThemedText style={styles.infoValue}>
                        {isLoading ? '⏳ Loading' : '✅ Ready'}
                    </ThemedText>
                </View>

                {error && (
                    <View style={styles.statusRow}>
                        <View style={[styles.statusIndicator, { backgroundColor: '#ef4444' }]} />
                        <ThemedText style={styles.infoLabel}>Error:</ThemedText>
                        <ThemedText style={[styles.infoValue, { color: '#ef4444' }]}>
                            {error}
                        </ThemedText>
                    </View>
                )}
            </View>

            {/* Test Actions Section */}
            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Test Actions</ThemedText>

                <TouchableOpacity style={styles.button} onPress={showTestInstructions}>
                    <ThemedText style={styles.buttonText}>📋 Show Test Instructions</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={runUserIdTest}>
                    <ThemedText style={styles.buttonText}>🔍 Test User ID Integration</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={runRevenueCatUserTest}>
                    <ThemedText style={styles.buttonText}>🏷️ Test RevenueCat User Mapping</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={runSubscriptionIsolationTest}>
                    <ThemedText style={styles.buttonText}>🔒 Test Subscription Isolation</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={simulatePremiumForCurrentUser}>
                    <ThemedText style={styles.buttonText}>💎 Simulate Premium Purchase</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={runComprehensiveCheck}>
                    <ThemedText style={styles.buttonText}>🔧 Run Comprehensive Check</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={clearResults}>
                    <ThemedText style={styles.buttonText}>🗑️ Clear Results</ThemedText>
                </TouchableOpacity>
            </View>

            {/* Test Results Section */}
            {testResults.length > 0 && (
                <View style={styles.resultsContainer}>
                    <ThemedText style={styles.resultsTitle}>Test Results</ThemedText>
                    <ScrollView style={{ maxHeight: 200 }}>
                        {testResults.map((result, index) => (
                            <ThemedText key={index} style={styles.resultText}>
                                {result}
                            </ThemedText>
                        ))}
                    </ScrollView>
                </View>
            )}
        </ScrollView>
    );
}
