import { useTheme } from '@/contexts/ThemeContext';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
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

interface ProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
}

type AppearanceMode = 'system' | 'light' | 'dark';

const APP_GROUP_ID = "group.com.mebattll.habittracker.widget";
const WIDGET_DATA_KEY = "widgetData";

// Helper function to update widget data in UserDefaults
// This function assumes you have native methods (e.g., via NativeWidgetBridge or libraries)
const updateWidgetThemePreference = async (newAppTheme: 'light' | 'dark') => {
  try {
    // 1. Get current widgetData string from UserDefaults
    // Replace with actual call to your native module/library
    // const existingDataString = await MyWidgetBridge.getWidgetData(APP_GROUP_ID, WIDGET_DATA_KEY);
    // Example with react-native-default-preference:
    // const existingDataString = await DefaultPreference.get(WIDGET_DATA_KEY, APP_GROUP_ID);

    let currentWidgetData: any = { tasks: [], habits: [] }; // Default structure

    // For demonstration, we'll simulate fetching. In a real app, use your actual native call.
    // This is a placeholder for fetching.
    const existingDataString = null; // Placeholder: replace with actual native call result.
                                     // If using react-native-default-preference, handle its promise.

    if (existingDataString) {
      try {
        currentWidgetData = JSON.parse(existingDataString);
      } catch (e) {
        console.warn("ProfileModal: Could not parse existing widget data, will overwrite with new theme and default data.", e);
        currentWidgetData = { tasks: [], habits: [] }; // Fallback
      }
    }

    // 2. Update the appTheme
    const updatedWidgetData = {
      ...currentWidgetData,
      appTheme: newAppTheme,
      // Ensure tasks and habits are preserved or set to empty arrays if not present
      tasks: currentWidgetData.tasks || [],
      habits: currentWidgetData.habits || [],
    };

    // 3. Serialize updated object
    const newDataString = JSON.stringify(updatedWidgetData);

    // 4. Write back to UserDefaults
    // Replace with actual call to your native module/library
    // await MyWidgetBridge.setWidgetData(APP_GROUP_ID, WIDGET_DATA_KEY, newDataString);
    // Example with react-native-default-preference:
    // await DefaultPreference.set(WIDGET_DATA_KEY, newDataString, APP_GROUP_ID);
    console.log("ProfileModal: Simulating writing to UserDefaults:", newDataString); // Placeholder

    // 5. Notify the widget to reload
    // Replace with actual call to your native module/library
    // await MyWidgetBridge.reloadAllWidgets();
    // Example with react-native-widgetkit:
    // WidgetKit.reloadAllTimelines();
    console.log("ProfileModal: Simulating widget reload all timelines."); // Placeholder

  } catch (error) {
    console.error("ProfileModal: Failed to update widget theme preference:", error);
  }
};

export const ProfileModal: React.FC<ProfileModalProps> = ({ isVisible, onClose }) => {
  const { colors, spacing, typography, borderRadius, theme, toggleTheme } = useTheme();
  const { signOut } = useClerkAuth();
  const { user, isLoaded } = useUser();
  const [showSettings, setShowSettings] = useState(false);
  const [appearanceMode, setAppearanceMode] = useState<AppearanceMode>('system');
  const systemColorScheme = useColorScheme();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    loadAppearanceSettings();
  }, []);

  useEffect(() => {
    // Determine the target theme based on appearanceMode and systemColorScheme
    let targetThemeMode: 'light' | 'dark' | null = null;

    if (appearanceMode === 'system') {
      targetThemeMode = systemColorScheme === undefined ? null : systemColorScheme;
    } else {
      targetThemeMode = appearanceMode; // 'light' or 'dark'
    }

    // If a target theme is determined and it's different from the current app theme, toggle
    if (targetThemeMode && theme !== targetThemeMode) {
      toggleTheme();
    }

    // Update widget theme preference whenever the effective theme changes
    if (targetThemeMode) { // targetThemeMode will be 'light' or 'dark'
      updateWidgetThemePreference(targetThemeMode);
    }
  }, [appearanceMode, systemColorScheme, theme, toggleTheme]);

  const loadAppearanceSettings = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('appearanceMode');
      if (savedMode) {
        setAppearanceMode(savedMode as AppearanceMode); // This will trigger the theme-sync useEffect
      }
      // If no savedMode, the initial useState('system') for appearanceMode will be used,
      // and the theme-sync useEffect will apply it based on systemColorScheme.
    } catch (error) {
      console.error('Error loading appearance settings:', error);
    }
  };

  const handleAppearanceChange = async (mode: AppearanceMode) => {
    setAppearanceMode(mode); // Update state for app UI
    await AsyncStorage.setItem('appearanceMode', mode); // Save for app persistence

    // Determine the theme to send to the widget
    let themeForWidget: 'light' | 'dark';
    if (mode === 'system') {
      // systemColorScheme can be null, if so, default to 'light' for the widget
      themeForWidget = systemColorScheme === 'dark' ? 'dark' : 'light';
    } else {
      themeForWidget = mode; // 'light' or 'dark'
    }
    // Update the widget's theme preference
    await updateWidgetThemePreference(themeForWidget);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out with Clerk:", error);
      Alert.alert("Sign Out Error", "Could not sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => console.log("Account deletion cancelled"),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!user) {
              Alert.alert("Error", "User not found. Cannot delete account.");
              return;
            }
            setIsDeletingAccount(true);
            try {
              await user.delete();
              // Successfully deleted. Clerk should handle sign out and state updates.
              // onClose(); // Close the modal if needed, or rely on Clerk's redirection/state change
              Alert.alert("Account Deleted", "Your account has been successfully deleted.");
              // It's good practice to call signOut explicitly if destroy() doesn't handle it,
              // or if you want to ensure the local session is cleared immediately.
              // await signOut(); // This might be redundant if destroy() handles it.
            } catch (error) {
              console.error("Error deleting account with Clerk:", error);
              Alert.alert("Deletion Error", "Could not delete your account. Please try again or contact support.");
            } finally {
              setIsDeletingAccount(false);
            }
          }
        }
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
    },
    backButton: {
      marginRight: spacing.md,
    },
    closeButton: {
      padding: spacing.sm,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuItemText: {
      marginLeft: spacing.md,
      fontSize: typography.fontSize.md,
      color: colors.text,
    },
    lastMenuItem: {
      borderBottomWidth: 0,
    },
    userInfoContainer: {
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    userImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.border,
      marginBottom: spacing.sm,
      justifyContent: 'center',
      alignItems: 'center'
    },
    userName: {
      fontSize: typography.fontSize.lg,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    userEmail: {
      fontSize: typography.fontSize.sm,
      color: colors.text,
    },
    signOutButton: {
      opacity: isSigningOut ? 0.7 : 1,
    },
    section: {
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      marginBottom: spacing.md,
      color: colors.text,
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
    settingDescription: {
      fontSize: typography.fontSize.sm,
      color: colors.secondary,
      marginTop: spacing.xs,
    },
    dangerZone: {
      marginTop: spacing.xl,
      padding: spacing.lg,
      borderRadius: borderRadius.md,
      backgroundColor: 'rgba(255, 59, 48, 0.1)',
      opacity: isDeletingAccount ? 0.7 : 1,
    },
    dangerTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      color: '#FF3B30',
      marginBottom: spacing.md,
    },
    dangerButton: {
      backgroundColor: '#FF3B30',
      padding: spacing.md,
      borderRadius: borderRadius.md,
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

  const renderProfileContent = () => (
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

        {user && (
          <View style={styles.userInfoContainer}>
            <View style={styles.userImage}>
              <Ionicons name="person" size={30} color={colors.text} />
            </View>
            <Text style={styles.userName}>
              {user?.fullName || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User'}
            </Text>
            <Text style={styles.userEmail}>
              {user?.primaryEmailAddress?.emailAddress}
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
          disabled={isSigningOut || !isLoaded}
        >
          <Ionicons name="log-out-outline" size={24} color={colors.text} />
          <Text style={styles.menuItemText}>{isSigningOut ? 'Signing Out...' : 'Sign Out'}</Text>
        </TouchableOpacity>
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
                  {appearanceMode === mode && <View style={styles.radioButtonInner} />}
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
            onPress={() => Linking.openURL('https://example.com/website')}
          >
            <Ionicons name="globe-outline" size={24} color={colors.primary} />
            <Text style={styles.linkText}>Visit Website</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => Linking.openURL('https://example.com/terms')}
          >
            <Ionicons name="document-text-outline" size={24} color={colors.primary} />
            <Text style={styles.linkText}>Terms and Conditions</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => Linking.openURL('https://example.com/privacy')}
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

        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <TouchableOpacity 
            style={styles.dangerButton}
            onPress={handleDeleteAccount}
            disabled={isDeletingAccount || !isLoaded}
          >
            <Text style={styles.dangerButtonText}>{isDeletingAccount ? 'Deleting...' : 'Delete Account'}</Text>
          </TouchableOpacity>
        </View>

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
      {showSettings ? renderSettingsContent() : renderProfileContent()}
    </Modal>
  );
}; 