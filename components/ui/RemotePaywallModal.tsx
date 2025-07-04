import React from 'react';
import { Dimensions, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedText } from './ThemedText';

const { width } = Dimensions.get('window');

interface RemotePaywallModalProps {
  visible: boolean;
  onClose: () => void;
  showCloseButton?: boolean;
  requiredEntitlementIdentifier?: string;
}

// Helper function to present paywall imperatively
export async function presentRemotePaywall(options?: {
  requiredEntitlementIdentifier?: string;
  offering?: any;
}): Promise<boolean> {
  try {
    let paywallResult: PAYWALL_RESULT;
    
    if (options?.requiredEntitlementIdentifier) {
      paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: options.requiredEntitlementIdentifier,
        offering: options.offering,
      });
    } else {
      paywallResult = await RevenueCatUI.presentPaywall({
        offering: options?.offering,
      });
    }

    switch (paywallResult) {
      case PAYWALL_RESULT.PURCHASED:
      case PAYWALL_RESULT.RESTORED:
        return true;
      case PAYWALL_RESULT.NOT_PRESENTED:
      case PAYWALL_RESULT.ERROR:
      case PAYWALL_RESULT.CANCELLED:
      default:
        return false;
    }
  } catch (error) {
    console.error('Error presenting paywall:', error);
    return false;
  }
}

export function RemotePaywallModal({ 
  visible, 
  onClose, 
  showCloseButton = true,
  requiredEntitlementIdentifier = "Growmoji Premium"
}: RemotePaywallModalProps) {
  const { colors, spacing, borderRadius } = useTheme();
  const { offerings, customerInfo, isInitialized } = useSubscription();

  // Simplified logging for production
  React.useEffect(() => {
    if (visible && process.env.NODE_ENV === 'development') {
      console.log('[RemotePaywallModal] Paywall opened:', {
        isInitialized,
        hasOfferings: !!(offerings && offerings.length > 0)
      });
    }
  }, [visible, offerings, isInitialized]);

  const handleDismiss = () => {
    console.log('[RemotePaywallModal] Paywall dismissed');
    onClose();
  };

  const handlePurchaseStarted = () => {
    console.log('[RemotePaywallModal] Purchase started');
  };

  const handlePurchaseCompleted = ({ customerInfo }: any) => {
    console.log('[RemotePaywallModal] Purchase completed:', customerInfo);
    onClose(); 
  };

  const handlePurchaseError = (error: any) => {
    console.error('[RemotePaywallModal] Purchase error:', error); 
  };

  const handlePurchaseCancelled = () => {
    console.log('[RemotePaywallModal] Purchase cancelled');
  };

  const handleRestoreStarted = () => {
    console.log('[RemotePaywallModal] Restore started');
  };

  const handleRestoreCompleted = ({ customerInfo }: any) => {
    console.log('[RemotePaywallModal] Restore completed:', customerInfo);
    onClose(); 
  };

  const handleRestoreError = (error: any) => {
    console.error('[RemotePaywallModal] Restore error:', error); 
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
      height: '90%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
      overflow: 'hidden',
    },
    header: {
      padding: spacing.md,
      alignItems: 'flex-end',
      backgroundColor: colors.card,
    },
    closeButton: {
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
    paywallContainer: {
      flex: 1,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    errorText: {
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    debugButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginTop: spacing.md,
    },
  });

  // Show error state if RevenueCat is not properly initialized
  if (!isInitialized) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {showCloseButton && (
              <View style={styles.header}>
                <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
                  <ThemedText style={{ color: colors.secondary }}>✕</ThemedText>
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.errorContainer}>
              <ThemedText style={[styles.errorText, { color: colors.text }]}>
                💭 Setting up your subscription options...
              </ThemedText>
              <ThemedText style={[styles.errorText, { color: colors.secondary, fontSize: 14 }]}>
                Please wait while we initialize RevenueCat
              </ThemedText>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // Show error state if no offerings are available
  if (!offerings || offerings.length === 0) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {showCloseButton && (
              <View style={styles.header}>
                <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
                  <ThemedText style={{ color: colors.secondary }}>✕</ThemedText>
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.errorContainer}>
              <ThemedText style={[styles.errorText, { color: colors.text }]}>
                🎯 Premium Features Available Soon
              </ThemedText>
              <ThemedText style={[styles.errorText, { color: colors.secondary, fontSize: 14 }]}>
                We're setting up premium subscriptions. Please try again in a few minutes, or continue enjoying the free features!
              </ThemedText>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {showCloseButton && (
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
                <ThemedText style={{ color: colors.secondary }}>✕</ThemedText>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.paywallContainer}>
            <RevenueCatUI.Paywall
              options={{
                displayCloseButton: false, // We handle our own close button
              }}
              onDismiss={handleDismiss}
              onPurchaseStarted={handlePurchaseStarted}
              onPurchaseCompleted={handlePurchaseCompleted}
              onPurchaseError={handlePurchaseError}
              onPurchaseCancelled={handlePurchaseCancelled}
              onRestoreStarted={handleRestoreStarted}
              onRestoreCompleted={handleRestoreCompleted}
              onRestoreError={handleRestoreError}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
} 