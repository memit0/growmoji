import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

const { width } = Dimensions.get('window');

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  showCloseButton?: boolean;
}

const features = [
  {
    icon: '🚀',
    title: 'Unlimited Habits',
    description: 'Track as many habits as you want without any limits'
  },
  {
    icon: '📊',
    title: 'Advanced Analytics',
    description: 'Get detailed insights into your progress and streaks'
  },
  {
    icon: '📱',
    title: 'Widget Access',
    description: 'Add beautiful widgets to your home screen'
  },
  {
    icon: '🎨',
    title: 'Premium Themes',
    description: 'Unlock exclusive themes and customization options'
  },
  {
    icon: '☁️',
    title: 'Cloud Sync',
    description: 'Sync your data across all your devices'
  },
  {
    icon: '🔔',
    title: 'Smart Reminders',
    description: 'AI-powered reminders at the perfect time'
  }
];

export function PaywallModal({ 
  visible, 
  onClose, 
  title = "Unlock Your Full Potential",
  subtitle = "Get unlimited habits, widgets, and premium features",
  showCloseButton = true 
}: PaywallModalProps) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const { offerings, purchasePackage, restorePurchases, refreshOfferings, isLoading, error } = useSubscription();
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async (packageToPurchase: any) => {
    try {
      setPurchasing(true);
      const success = await purchasePackage(packageToPurchase);
      if (success) {
        Alert.alert(
          'Success!',
          'Welcome to Premium! You now have access to all features.',
          [{ text: 'OK', onPress: onClose }]
        );
      }
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setPurchasing(true);
      const success = await restorePurchases();
      if (success) {
        Alert.alert(
          'Restored!',
          'Your premium subscription has been restored.',
          [{ text: 'OK', onPress: onClose }]
        );
      } else {
        Alert.alert('No purchases found', 'No previous purchases were found to restore.');
      }
    } catch (error) {
      console.error('Restore error:', error);
    } finally {
      setPurchasing(false);
    }
  };

  const handleRefreshOfferings = async () => {
    try {
      setPurchasing(true);
      await refreshOfferings();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setPurchasing(false);
    }
  };

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.xl,
      width: width * 0.9,
      maxHeight: '90%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
    header: {
      padding: spacing.xl,
      alignItems: 'center',
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      backgroundColor: colors.card,
    },
    closeButton: {
      position: 'absolute',
      top: spacing.md,
      right: spacing.md,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    title: {
      fontSize: typography.fontSize.xxl,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: typography.fontSize.md,
      color: colors.secondary,
      textAlign: 'center',
      lineHeight: typography.fontSize.md * 1.4,
    },
    featuresContainer: {
      padding: spacing.lg,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.sm,
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    featureIcon: {
      fontSize: 24,
      marginRight: spacing.md,
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    featureDescription: {
      fontSize: typography.fontSize.sm,
      color: colors.secondary,
      lineHeight: typography.fontSize.sm * 1.3,
    },
    pricingContainer: {
      padding: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    packageButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.md,
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    packageButtonDisabled: {
      backgroundColor: colors.border,
      shadowOpacity: 0.1,
    },
    packageTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: spacing.xs,
    },
    packagePrice: {
      fontSize: typography.fontSize.md,
      color: '#FFFFFF',
      opacity: 0.9,
    },
    footer: {
      padding: spacing.lg,
      alignItems: 'center',
    },
    restoreButton: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
    },
    restoreText: {
      fontSize: typography.fontSize.sm,
      color: colors.secondary,
      textDecorationLine: 'underline',
    },
    errorText: {
      fontSize: typography.fontSize.sm,
      color: '#EF4444',
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    loadingText: {
      fontSize: typography.fontSize.md,
      color: colors.secondary,
      textAlign: 'center',
      padding: spacing.xl,
    },
    noOfferingsContainer: {
      padding: spacing.lg,
      alignItems: 'center',
    },
    noOfferingsTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    noOfferingsText: {
      fontSize: typography.fontSize.md,
      color: colors.secondary,
      textAlign: 'center',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <ThemedView style={styles.modalContent}>
          <View style={styles.header}>
            {showCloseButton && (
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <ThemedText style={{ color: colors.secondary }}>✕</ThemedText>
              </TouchableOpacity>
            )}
            <ThemedText style={styles.title}>{title}</ThemedText>
            <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.featuresContainer}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <ThemedText style={styles.featureIcon}>{feature.icon}</ThemedText>
                  <View style={styles.featureContent}>
                    <ThemedText style={styles.featureTitle}>{feature.title}</ThemedText>
                    <ThemedText style={styles.featureDescription}>{feature.description}</ThemedText>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.pricingContainer}>
              {error && (
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              )}
              
              {isLoading ? (
                <ThemedText style={styles.loadingText}>Loading subscription options...</ThemedText>
              ) : (
                offerings && offerings.length > 0 ? (
                  offerings[0].availablePackages.map((pkg, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.packageButton,
                        (purchasing || isLoading) && styles.packageButtonDisabled
                      ]}
                      onPress={() => handlePurchase(pkg)}
                      disabled={purchasing || isLoading}
                    >
                      <ThemedText style={styles.packageTitle}>
                        {pkg.product.title}
                      </ThemedText>
                      <ThemedText style={styles.packagePrice}>
                        {pkg.product.priceString}/{pkg.product.subscriptionPeriod}
                      </ThemedText>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.noOfferingsContainer}>
                    <ThemedText style={styles.noOfferingsTitle}>Setup in Progress</ThemedText>
                    <ThemedText style={styles.noOfferingsText}>
                      Subscription options are being configured. This can take a few minutes to several hours after creating offerings in RevenueCat dashboard.
                    </ThemedText>
                    <TouchableOpacity
                      style={[
                        styles.packageButton,
                        { marginTop: spacing.lg, backgroundColor: colors.secondary },
                        purchasing && styles.packageButtonDisabled
                      ]}
                      onPress={handleRefreshOfferings}
                      disabled={purchasing}
                    >
                      <ThemedText style={styles.packageTitle}>
                        {purchasing ? 'Refreshing...' : 'Refresh Offerings'}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                )
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
              <ThemedText style={styles.restoreText}>Restore Purchases</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
} 