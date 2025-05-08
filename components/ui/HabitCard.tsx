import { Colors } from '@/constants/Colors';
import React from 'react';
import { Animated, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface HabitCardProps {
  id: string;
  emoji: string;
  streak: number;
  onPress?: () => void;
  onDelete?: (id: string) => void;
  logged?: boolean;
  startDate: string;
  lastLoggedDate?: string;
}

export function HabitCard({ 
  id,
  emoji, 
  streak, 
  onPress, 
  onDelete,
  logged = false,
  startDate,
  lastLoggedDate 
}: HabitCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const translateX = new Animated.Value(0);

  // Calculate if the streak is at risk (missed one day)
  const isStreakAtRisk = lastLoggedDate ? 
    new Date().getTime() - new Date(lastLoggedDate).getTime() > 24 * 60 * 60 * 1000 : 
    false;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;
      if (translationX > 100) {
        Animated.timing(translateX, {
          toValue: 500,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          onDelete?.(id);
          translateX.setValue(0);
        });
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      activeOffsetX={[-20, 20]}
    >
      <Animated.View style={{ transform: [{ translateX }] }}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          <ThemedView style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={[
              styles.emojiContainer, 
              { backgroundColor: colors.input },
              logged && styles.loggedContainer
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
                    {isStreakAtRisk ? '⚠️' : '⛓️'} {streak}
                  </ThemedText>
                </View>
                <ThemedText style={[styles.infoText, { color: colors.secondary }]}>
                  Started {startDate}
                </ThemedText>
              </View>
            </View>
          </ThemedView>
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
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
  loggedContainer: {
    borderWidth: 3,
    borderColor: '#4CAF50', // Material Design Green
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
  infoText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 