import { Collapsible } from '@/components/common/Collapsible';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';

interface SettingsPageProps {
  isVisible: boolean;
  onClose: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ isVisible, onClose }) => {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [darkMode, setDarkMode] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(true);

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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      marginRight: spacing.md,
    },
    title: {
      fontSize: typography.fontSize.xl,
      fontWeight: 'bold',
      color: colors.text,
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
    version: {
      textAlign: 'center',
      padding: spacing.lg,
      color: colors.secondary,
      fontSize: typography.fontSize.sm,
    },
  });

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <ThemedText style={styles.title}>Settings</ThemedText>
          </View>

          <ScrollView>
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Appearance</ThemedText>
              <View style={styles.settingRow}>
                <View>
                  <ThemedText style={styles.settingLabel}>Dark Mode</ThemedText>
                  <ThemedText style={styles.settingDescription}>
                    Switch between light and dark theme
                  </ThemedText>
                </View>
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Sound</ThemedText>
              <View style={styles.settingRow}>
                <View>
                  <ThemedText style={styles.settingLabel}>Sound Effects</ThemedText>
                  <ThemedText style={styles.settingDescription}>
                    Play sounds for timer and task completion
                  </ThemedText>
                </View>
                <Switch
                  value={soundEnabled}
                  onValueChange={setSoundEnabled}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
            </View>

            <Collapsible title="About">
              <View style={styles.section}>
                <View style={styles.settingRow}>
                  <ThemedText style={styles.settingLabel}>Version</ThemedText>
                  <ThemedText style={styles.settingDescription}>1.0.0</ThemedText>
                </View>
                <View style={styles.settingRow}>
                  <ThemedText style={styles.settingLabel}>Build</ThemedText>
                  <ThemedText style={styles.settingDescription}>2024.1</ThemedText>
                </View>
              </View>
            </Collapsible>

            <ThemedText style={styles.version}>
              Habit Tracker v1.0.0
            </ThemedText>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}; 