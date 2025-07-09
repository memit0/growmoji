
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useTheme } from '@/contexts/ThemeContext';
import { habitsService } from '@/lib/services/habits';
import { todosService } from '@/lib/services/todos';
import { updateWidgetData } from '@/lib/services/widgetData';
import { supabase } from '@/lib/supabase';
import { validateMigrationData } from '@/lib/utils/dataMigration';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme
} from 'react-native';

type AppearanceMode = 'system' | 'light' | 'dark';

interface ProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const APP_GROUP_ID = "group.com.mebattll.habittracker.widget";
const WIDGET_DATA_KEY = "widgetData";

export const ProfileModal: React.FC<ProfileModalProps> = ({ isVisible, onClose }) => {
  const {
    colors,
    spacing,
    typography,
    borderRadius,
    theme, // This is the actual applied theme ('light' or 'dark')
    appearanceMode: contextAppearanceMode, // User's preference ('system', 'light', 'dark')
    setAppearanceMode: setContextAppearanceMode // Function to update preference
  } = useTheme();
  const { signOut, user, isAnonymous, anonymousUserId } = useAuth();
  
  // Debug user state when modal opens
  useEffect(() => {
    if (isVisible) {
      console.log('[ProfileModal] Modal opened with state:', {
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email,
        isAnonymous,
        anonymousUserId,
        willShowAnonymousContent: isAnonymous,
        willShowAuthenticatedContent: !isAnonymous
      });
    }
  }, [isVisible, user, isAnonymous, anonymousUserId]);
  const { isPremium } = useSubscription();
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const systemColorScheme = useColorScheme(); // Still needed for widget logic if mode is system
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [anonymousDataStats, setAnonymousDataStats] = useState({ habits: 0, todos: 0 });

  // Load anonymous data stats for display
  useEffect(() => {
    const loadAnonymousDataStats = async () => {
      if (isAnonymous && anonymousUserId) {
        try {
          const validation = await validateMigrationData(anonymousUserId);
          setAnonymousDataStats(validation.dataStats);
        } catch (error) {
          console.error('[ProfileModal] Error loading anonymous data stats:', error);
        }
      }
    };

    if (isVisible && isAnonymous) {
      loadAnonymousDataStats();
    }
  }, [isVisible, isAnonymous, anonymousUserId]);

  // Update widget data when theme changes
  useEffect(() => {
    const updateWidgetWithCurrentData = async () => {
      try {
        if (isAnonymous && anonymousUserId) {
          // For anonymous users, get data from local storage
          const [todos, habits] = await Promise.all([
            todosService.getTodos(anonymousUserId, true),
            habitsService.getHabits(anonymousUserId, true)
          ]);
          console.log(
            'ProfileModal useEffect: Updating widget for anonymous user with theme:',
            theme
          );
          updateWidgetData(todos || [], habits || [], theme, false);
        } else if (user?.id) {
          // For authenticated users, get data from Supabase
          console.log('ProfileModal useEffect: Fetching data for user:', user.id);
          const [todos, habits] = await Promise.all([
            todosService.getTodos(user.id),
            habitsService.getHabits(user.id)
          ]);
          console.log(
            'ProfileModal useEffect: Updating widget with isPremium:',
            isPremium,
            'and theme:',
            theme
          );
          updateWidgetData(todos || [], habits || [], theme, isPremium);
        }
      } catch (error) {
        console.error('ProfileModal: Error updating widget data with theme change:', error);
      }
    };

    if (theme && (user?.id || (isAnonymous && anonymousUserId))) {
      updateWidgetWithCurrentData();
    }
  }, [theme, isPremium, user?.id, isAnonymous, anonymousUserId]);

  const handleAppearanceChange = async (mode: AppearanceMode) => {
    await setContextAppearanceMode(mode);
    // Widget theme update is handled by the useEffect above
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      onClose(); // Close the modal after sign out
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Sign Out Error", "Could not sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleCreateAccount = () => {
    onClose();
    router.push('/(auth)/register');
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) {
      Alert.alert("Error", "You must be logged in to delete your account.");
      return;
    }

    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes, Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeletingAccount(true);
            try {
              // Delete user data first
              const { error: deleteDataError } = await supabase.rpc('delete_user_data', {
                user_id_param: user.id
              });

              if (deleteDataError) {
                throw new Error(`Failed to delete user data: ${deleteDataError.message}`);
              }

              // Since we can't use admin API from client side, we'll sign out and inform the user
              // to contact support for full account deletion
              await signOut();
              Alert.alert(
                "Account Data Deleted",
                "Your account data has been deleted. For security reasons, please contact support to fully delete your authentication account.",
                [{ text: "OK" }]
              );
              onClose();

            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert(
                "Error",
                "Failed to delete account. Please try again later or contact support.",
                [{ text: "OK" }]
              );
            } finally {
              setIsDeletingAccount(false);
            }
          },
        },
      ]
    );
  };

  const handleContactPress = () => {
    Linking.openURL('https://x.com/mebattll');
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      flex: 1,
      backgroundColor: colors.background,
      marginTop: 60,
    },
    profileContent: {
      backgroundColor: colors.card,
      marginTop: 60,
      marginHorizontal: spacing.md,
      alignSelf: 'flex-end',
      width: '60%',
      maxWidth: 300,
      maxHeight: '75%', // Limit height to allow for scrolling
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      marginBottom: spacing.lg,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    profileHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: typography.fontSize.xl,
      fontWeight: 'bold',
      color: colors.text,
      flex: 1,
      textAlign: 'center',
    },
    closeButton: {
      padding: spacing.xs,
    },
    backButton: {
      padding: spacing.xs,
      marginRight: spacing.md,
    },
    userInfoContainer: {
      alignItems: 'center',
      marginBottom: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
    },
    anonymousInfoContainer: {
      alignItems: 'center',
      marginBottom: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.primary + '40',
    },
    userImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    anonymousIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.secondary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    userName: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    userEmail: {
      fontSize: typography.fontSize.sm,
      color: colors.secondary,
    },
    anonymousTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    anonymousSubtitle: {
      fontSize: typography.fontSize.sm,
      color: colors.secondary,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    anonymousStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
    },
    anonymousStatItem: {
      alignItems: 'center',
    },
    anonymousStatNumber: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      color: colors.primary,
    },
    anonymousStatLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.secondary,
    },
    warningCard: {
      backgroundColor: colors.primary + '10',
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.lg,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    warningTitle: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    warningText: {
      fontSize: typography.fontSize.sm,
      color: colors.secondary,
      lineHeight: typography.fontSize.sm * 1.4,
    },
    createAccountButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
      alignItems: 'center',
    },
    createAccountButtonText: {
      color: '#FFFFFF',
      fontSize: typography.fontSize.md,
      fontWeight: '600',
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    lastMenuItem: {
      borderBottomWidth: 0,
    },
    menuItemText: {
      fontSize: typography.fontSize.md,
      color: colors.text,
      marginLeft: spacing.md,
      flex: 1,
    },
    signOutButton: {
      marginTop: spacing.sm,
    },
    section: {
      backgroundColor: colors.card,
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
      borderRadius: borderRadius.md,
      padding: spacing.md,
    },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    settingLabel: {
      fontSize: typography.fontSize.md,
      color: colors.text,
    },
    dangerZone: {
      backgroundColor: colors.card,
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: '#FF6B6B20',
    },
    dangerTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      color: '#FF6B6B',
      marginBottom: spacing.md,
    },
    dangerButton: {
      backgroundColor: '#FF6B6B',
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    dangerButtonText: {
      color: '#FFFFFF',
      fontSize: typography.fontSize.md,
      fontWeight: '600',
    },
    linkButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
    linkText: {
      fontSize: typography.fontSize.md,
      color: colors.primary,
      marginLeft: spacing.sm,
    },
    radioGroup: {
      marginTop: spacing.sm,
    },
    radioOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    radioLabel: {
      fontSize: typography.fontSize.md,
      color: colors.text,
      marginLeft: spacing.sm,
    },
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioButtonInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.primary,
    },
  });

  const renderAnonymousProfileContent = () => (
    <TouchableOpacity
      style={styles.modalOverlay}
      activeOpacity={1}
      onPress={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={styles.profileContent}
        onPress={e => e.stopPropagation()}
      >
        <View style={styles.profileHeader}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={styles.anonymousInfoContainer}>
            <View style={styles.anonymousIcon}>
              <Ionicons name="person" size={30} color={colors.secondary} />
            </View>
            <Text style={styles.anonymousTitle}>👤 Anonymous User</Text>
            <Text style={styles.anonymousSubtitle}>
              Your data is stored locally on this device
            </Text>
            <View style={styles.anonymousStats}>
              <View style={styles.anonymousStatItem}>
                <Text style={styles.anonymousStatNumber}>{anonymousDataStats.habits}</Text>
                <Text style={styles.anonymousStatLabel}>Habits</Text>
              </View>
              <View style={styles.anonymousStatItem}>
                <Text style={styles.anonymousStatNumber}>{anonymousDataStats.todos}</Text>
                <Text style={styles.anonymousStatLabel}>Tasks</Text>
              </View>
            </View>
          </View>

          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠️ Important</Text>
            <Text style={styles.warningText}>
              Without an account, your data won't sync across devices and could be lost if you delete the app.
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.createAccountButton}
            onPress={handleCreateAccount}
          >
            <Text style={styles.createAccountButtonText}>
              Create Account & Backup Data
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowSettings(true)}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text} />
            <Text style={styles.menuItemText}>Settings</Text>
          </TouchableOpacity>
          
          {/* Add some bottom padding */}
          <View style={{ height: spacing.lg }} />
        </ScrollView>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderAuthenticatedProfileContent = () => (
    <TouchableOpacity
      style={styles.modalOverlay}
      activeOpacity={1}
      onPress={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={styles.profileContent}
        onPress={e => e.stopPropagation()}
      >
        <View style={styles.profileHeader}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {user && (
            <View style={styles.userInfoContainer}>
              <View style={styles.userImage}>
                <Ionicons name="person" size={30} color={colors.text} />
              </View>
              <Text style={styles.userName}>
                {user?.email?.split('@')[0] || 'User'}
              </Text>
              <Text style={styles.userEmail}>
                {user?.email}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowSettings(true)}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text} />
            <Text style={styles.menuItemText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.lastMenuItem, styles.signOutButton, { opacity: isSigningOut ? 0.7 : 1 }]}
            onPress={handleSignOut}
            disabled={isSigningOut}
          >
            <Ionicons name="log-out-outline" size={24} color={colors.text} />
            <Text style={styles.menuItemText}>{isSigningOut ? 'Signing Out...' : 'Sign Out'}</Text>
          </TouchableOpacity>
          
          {/* Add some bottom padding to ensure logout button is fully accessible */}
          <View style={{ height: spacing.lg }} />
        </ScrollView>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSettingsContent = () => (
    <View style={styles.modalContent}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowSettings(false)} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView>
        {!isAnonymous && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subscription</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Status</Text>
              <Text style={[styles.settingLabel, { color: isPremium ? colors.primary : colors.secondary }]}>
                {isPremium ? 'Premium Member' : 'Free Member'}
              </Text>
            </View>
          </View>
        )}

        {isAnonymous && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Status</Text>
              <Text style={[styles.settingLabel, { color: colors.secondary }]}>
                Anonymous User
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.createAccountButton}
              onPress={handleCreateAccount}
            >
              <Text style={styles.createAccountButtonText}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.radioGroup}>
            {(['system', 'light', 'dark'] as AppearanceMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={styles.radioOption}
                onPress={() => handleAppearanceChange(mode)}
              >
                <View style={styles.radioButton}>
                  {contextAppearanceMode === mode && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.radioLabel}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => Linking.openURL('https://www.growmoji.app')}
          >
            <Ionicons name="globe-outline" size={24} color={colors.primary} />
            <Text style={styles.linkText}>Visit Website</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => Linking.openURL('https://www.growmoji.app/terms')}
          >
            <Ionicons name="document-text-outline" size={24} color={colors.primary} />
            <Text style={styles.linkText}>Terms and Conditions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => Linking.openURL('https://www.growmoji.app/privacy')}
          >
            <Ionicons name="shield-outline" size={24} color={colors.primary} />
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact & Feedback</Text>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={handleContactPress}
          >
            <Ionicons name="logo-twitter" size={24} color={colors.primary} />
            <Text style={styles.linkText}>@mebattll</Text>
          </TouchableOpacity>
        </View>

        {/* Only show delete account for authenticated users */}
        {!isAnonymous && (
          <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>Danger Zone</Text>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleDeleteAccount}
              disabled={isDeletingAccount}
            >
              <Text style={styles.dangerButtonText}>{isDeletingAccount ? 'Deleting...' : 'Delete Account'}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: spacing.xl * 2 }} />
      </ScrollView>
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {showSettings ? renderSettingsContent() : (
        isAnonymous ? renderAnonymousProfileContent() : renderAuthenticatedProfileContent()
      )}
    </Modal>
  );
};

export default ProfileModal;