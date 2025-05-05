import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface HabitCardProps {
  emoji: string;
  streak: number;
  frequency: string;
  onPress?: () => void;
  completed?: boolean;
}

export function HabitCard({ emoji, streak, frequency, onPress, completed = false }: HabitCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <ThemedView style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.emojiContainer}>
          <ThemedText style={styles.emoji}>{emoji}</ThemedText>
        </View>
        <View style={styles.streakContainer}>
          <View style={[styles.streakBadge, { backgroundColor: colors.streak }]}>
            <ThemedText style={styles.streakText}>🔥 {streak}</ThemedText>
          </View>
          <ThemedText style={[styles.frequency, { color: colors.secondary }]}>
            {frequency}
          </ThemedText>
        </View>
        {completed && (
          <View style={[styles.completedBadge, { backgroundColor: colors.completed }]}>
            <ThemedText style={styles.completedText}>✓</ThemedText>
          </View>
        )}
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 24,
  },
  streakContainer: {
    flex: 1,
  },
  streakBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  streakText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  frequency: {
    fontSize: 14,
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  completedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 