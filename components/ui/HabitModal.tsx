import { Colors } from '@/constants/Colors';
import React, { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface HabitModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (emoji: string) => void;
}

const COMMON_EMOJIS = [
  '🧘', '📚', '💪', '🏃', '🎯', '🎨', '🎵', '📝',
  '💧', '🥗', '😴', '🧠', '🎮', '📱', '🌱', '🎪'
];

export function HabitModal({ visible, onClose, onSave }: HabitModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
  };

  const handleSave = () => {
    if (selectedEmoji) {
      onSave(selectedEmoji);
      setSelectedEmoji(null);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ThemedView style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <ThemedText type="title">New Habit</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <ThemedText style={styles.closeButtonText}>✕</ThemedText>
            </TouchableOpacity>
          </View>

          <ThemedText style={styles.subtitle}>Choose an emoji for your habit</ThemedText>

          <View style={styles.emojiGrid}>
            {COMMON_EMOJIS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.emojiButton,
                  selectedEmoji === emoji && { backgroundColor: colors.primary }
                ]}
                onPress={() => handleEmojiSelect(emoji)}
              >
                <ThemedText style={styles.emoji}>{emoji}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: selectedEmoji ? colors.primary : colors.border }
            ]}
            onPress={handleSave}
            disabled={!selectedEmoji}
          >
            <ThemedText style={styles.saveButtonText}>Create Habit</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    opacity: 0.8,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  emojiButton: {
    width: '22%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 12,
  },
  emoji: {
    fontSize: 24,
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 