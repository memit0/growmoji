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
  logged?: boolean;
  startDate: string;
  lastLoggedDate?: string;
}

export function HabitCard({ 
  emoji, 
  streak, 
  frequency, 
  onPress, 
  logged = false,
  startDate,
  lastLoggedDate 
}: HabitCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Calculate if the streak is at risk (missed one day)
  const isStreakAtRisk = lastLoggedDate ? 
    new Date().getTime() - new Date(lastLoggedDate).getTime() > 24 * 60 * 60 * 1000 : 
    false;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <ThemedView style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={[
          styles.emojiContainer, 
          { backgroundColor: colors.input },
          logged && { backgroundColor: colors.primary }
        ]}>
          <ThemedText style={styles.emoji}>{emoji}</ThemedText>
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.streakContainer}>
            <View style={styles.streakBadge}>
              <ThemedText style={[
                styles.streakText,
                { color: isStreakAtRisk ? colors.warning : colors.streak }
              ]}>
                {isStreakAtRisk ? '⚠️' : '🔥'} {streak}
              </ThemedText>
            </View>
            <ThemedText style={[styles.frequency, { color: colors.secondary }]}>
              Started {startDate}
            </ThemedText>
          </View>
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
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '600',
  },
  frequency: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 