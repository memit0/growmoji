import React from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useTheme } from '../../contexts/ThemeContext';
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
  const { colors } = useTheme();
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
    try {
      const state = event.nativeEvent.state;
      
      if (state === 5) { // END state
        if (event.nativeEvent.translationX > 100) {
          // Swiped right enough to trigger delete
          Animated.timing(translateX, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(({ finished }) => {
            if (finished) {
              onDelete?.();
            }
          });
        } else {
          // Reset position
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      }
    } catch (error) {
      console.error(`[TodoCard] Error in gesture handler for ${title}:`, error);
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      activeOffsetX={[-20, 20]}
      activeOffsetY={[-20, 20]}
      onFailed={() => {
        // Reset position when gesture fails
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }}
      onCancelled={() => {
        // Reset position when gesture is cancelled
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }}
      enabled={true}
    >
      <Animated.View style={[
        styles.container,
        {
          transform: [{ translateX }],
        }
      ]}>
        <TouchableOpacity 
          onPress={onPress} 
          activeOpacity={0.7}
        >
          <ThemedView style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.content}>
              <View style={[styles.priorityIndicator, { backgroundColor: priorityColors[priority] }]} />
              <View style={styles.textContainer}>
                <ThemedText 
                  type="defaultSemiBold" 
                  style={[
                    styles.title, 
                    { color: colors.text },
                    completed && styles.completedText
                  ]}
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
    marginVertical: 4,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  dueDate: {
    fontSize: 14,
  },
}); 