import React, { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface HabitModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (emoji: string) => void;
}

const COMMON_EMOJIS = [
  '🧘', '📚', '💪', '🏃', '🎯', '🎨', '🎵', '📝',
  '💧', '🥗', '😴', '🧠', '🏊‍♂️', '📱', '🌱', '☕️'
];

export function HabitModal({ visible, onClose, onSave }: HabitModalProps) {
  const { colors } = useTheme();
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
            <ThemedText type="title" style={{ color: colors.text }}>New Habit</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <ThemedText style={[styles.closeButtonText, { color: colors.text }]}>✕</ThemedText>
            </TouchableOpacity>
          </View>

          <ThemedText style={[styles.subtitle, { color: colors.text }]}>Choose an emoji for your habit</ThemedText>

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

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.primary },
                !selectedEmoji && styles.buttonDisabled
              ]}
              onPress={handleSave}
              disabled={!selectedEmoji}
            >
              <ThemedText style={styles.buttonText}>Create Habit</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    marginBottom: 20,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  emojiButton: {
    width: '23%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 10,
  },
  emoji: {
    fontSize: 32,
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 