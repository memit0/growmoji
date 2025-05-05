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
        <View style={[styles.emojiContainer, { backgroundColor: colors.input }]}>
          <ThemedText style={styles.emoji}>{emoji}</ThemedText>
        </View>
        <View style={styles.contentContainer}>
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
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emoji: {
    fontSize: 28,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakContainer: {
    flex: 1,
  },
  streakBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  streakText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  frequency: {
    fontSize: 14,
    fontWeight: '500',
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  completedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 