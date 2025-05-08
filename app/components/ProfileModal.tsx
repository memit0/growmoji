import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isVisible, onClose, onSignOut }) => {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const { user } = useUser();

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-start',
    },
    modalContent: {
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
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: typography.fontSize.xl,
      fontWeight: 'bold',
      color: colors.text,
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
  });

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalContent}
          onPress={e => e.stopPropagation()}
        >
          <View style={styles.header}>
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
                {user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress || 'User'}
              </Text>
              <Text style={styles.userEmail}>
                {user.emailAddresses[0]?.emailAddress}
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="person-outline" size={24} color={colors.text} />
            <Text style={styles.menuItemText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="settings-outline" size={24} color={colors.text} />
            <Text style={styles.menuItemText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, styles.lastMenuItem]}
            onPress={onSignOut}
          >
            <Ionicons name="log-out-outline" size={24} color={colors.text} />
            <Text style={styles.menuItemText}>Sign Out</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}; 