import { Colors } from '@/constants/Colors';
import React from 'react';
import { Animated, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface TodoCardProps {
  title: string;
  dueDate?: string;
  priority?: 'high' | 'medium' | 'low';
  onPress?: () => void;
  onDelete?: () => void;
  completed?: boolean;
}

export function TodoCard({ title, dueDate, priority = 'medium', onPress, onDelete, completed = false }: TodoCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const translateX = new Animated.Value(0);

  const priorityColors = {
    high: colors.error,
    medium: colors.warning,
    low: colors.success,
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === 5) { // END state
      if (event.nativeEvent.translationX > 100) {
        // Swiped right enough to trigger delete
        Animated.timing(translateX, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          onDelete?.();
        });
      } else {
        // Reset position
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
    >
      <Animated.View style={[
        styles.container,
        {
          transform: [{ translateX }],
        }
      ]}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          <ThemedView style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.content}>
              <View style={[styles.priorityIndicator, { backgroundColor: priorityColors[priority] }]} />
              <View style={styles.textContainer}>
                <ThemedText 
                  type="defaultSemiBold" 
                  style={[styles.title, completed && styles.completedText]}
                >
                  {title}
                </ThemedText>
                {dueDate && (
                  <ThemedText style={[styles.dueDate, { color: colors.secondary }]}>
                    {dueDate}
                  </ThemedText>
                )}
              </View>
            </View>
          </ThemedView>
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  dueDate: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
}); 