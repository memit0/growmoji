import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedText } from './ThemedText';

export function RevenueCatDebug() {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const { 
    offerings, 
    customerInfo, 
    isPremium, 
    refreshOfferings, 
    isLoading, 
    error,
    debugPremiumOverride,
    setDebugPremiumOverride
  } = useSubscription();

  const showDetailedInfo = () => {
    const info = {
      'Is Premium': isPremium ? 'Yes' : 'No',
      'Is Loading': isLoading ? 'Yes' : 'No',
      'Error': error || 'None',
      'Offerings Count': offerings?.length || 0,
      'Customer Info': customerInfo ? 'Available' : 'Not available',
      'Active Entitlements': customerInfo ? Object.keys(customerInfo.entitlements.active).join(', ') || 'None' : 'N/A',
    };

    const message = Object.entries(info)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    Alert.alert('RevenueCat Debug Info', message);
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
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.xs,
    },
    label: {
      fontSize: typography.fontSize.md,
      color: colors.text,
      flex: 1,
    },
    value: {
      fontSize: typography.fontSize.md,
      color: colors.secondary,
      flex: 1,
      textAlign: 'right',
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: typography.fontSize.md,
      fontWeight: '600',
    },
    errorText: {
      color: '#EF4444',
      fontSize: typography.fontSize.sm,
      fontStyle: 'italic',
    },
  });

  return (
    <ScrollView style={styles.container}>
      <ThemedText style={styles.title}>RevenueCat Debug</ThemedText>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Status</ThemedText>
        <View style={styles.row}>
          <ThemedText style={styles.label}>Loading</ThemedText>
          <ThemedText style={styles.value}>{isLoading ? 'Yes' : 'No'}</ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText style={styles.label}>Premium</ThemedText>
          <ThemedText style={styles.value}>{isPremium ? 'Yes' : 'No'}</ThemedText>
        </View>
        {error && (
          <View style={styles.row}>
            <ThemedText style={[styles.value, styles.errorText]}>{error}</ThemedText>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Debug Controls</ThemedText>
        <View style={styles.row}>
          <ThemedText style={styles.label}>Premium Override</ThemedText>
          <Switch
            value={debugPremiumOverride}
            onValueChange={setDebugPremiumOverride}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={debugPremiumOverride ? '#FFFFFF' : colors.secondary}
          />
        </View>
        {debugPremiumOverride && (
          <ThemedText style={[styles.value, { color: '#10B981', fontSize: 12, fontStyle: 'italic' }]}>
            Debug mode: Premium features enabled for testing
          </ThemedText>
        )}
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Offerings</ThemedText>
        <View style={styles.row}>
          <ThemedText style={styles.label}>Count</ThemedText>
          <ThemedText style={styles.value}>{offerings?.length || 0}</ThemedText>
        </View>
        {offerings?.map((offering, index) => (
          <View key={index} style={styles.row}>
            <ThemedText style={styles.label}>Offering {index + 1}</ThemedText>
            <ThemedText style={styles.value}>
              {offering.availablePackages.length} packages
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Customer Info</ThemedText>
        <View style={styles.row}>
          <ThemedText style={styles.label}>Available</ThemedText>
          <ThemedText style={styles.value}>{customerInfo ? 'Yes' : 'No'}</ThemedText>
        </View>
        {customerInfo && (
          <View style={styles.row}>
            <ThemedText style={styles.label}>Active Entitlements</ThemedText>
            <ThemedText style={styles.value}>
              {Object.keys(customerInfo.entitlements.active).length}
            </ThemedText>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={refreshOfferings}>
        <ThemedText style={styles.buttonText}>Refresh Offerings</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={showDetailedInfo}>
        <ThemedText style={styles.buttonText}>Show Detailed Info</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
} 