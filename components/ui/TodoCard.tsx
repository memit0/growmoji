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

  // Track component lifecycle
  React.useEffect(() => {
    console.log(`[TodoCard] Component mounted: ${title}`);
    return () => {
      console.log(`[TodoCard] Component unmounting: ${title}`);
    };
  }, [title]);

  // Track animation value changes
  React.useEffect(() => {
    const listener = translateX.addListener(({ value }) => {
      console.log(`[TodoCard] Animation value changed for ${title}:`, value);
    });
    return () => translateX.removeListener(listener);
  }, [title]);

  console.log(`[TodoCard] Rendering card: ${title}, completed: ${completed}`);

  const priorityColors = {
    high: colors.error,
    medium: colors.warning,
    low: colors.success,
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { 
      useNativeDriver: true,
      listener: (event: any) => {
        console.log(`[TodoCard] Gesture event for ${title}:`, {
          translationX: event.nativeEvent.translationX,
          velocityX: event.nativeEvent.velocityX,
          state: event.nativeEvent.state,
          numberOfPointers: event.nativeEvent.numberOfPointers,
          x: event.nativeEvent.x,
          y: event.nativeEvent.y,
          absoluteX: event.nativeEvent.absoluteX,
          absoluteY: event.nativeEvent.absoluteY,
          timestamp: event.nativeEvent.timestamp
        });
      }
    }
  );

  const onHandlerStateChange = (event: any) => {
    try {
      const state = event.nativeEvent.state;
      const stateMap: { [key: number]: string } = {
        0: 'UNDETERMINED',
        1: 'FAILED',
        2: 'BEGAN',
        3: 'CANCELLED',
        4: 'ACTIVE',
        5: 'END'
      };
      const stateName = stateMap[state] || 'UNKNOWN';

      console.log(`[TodoCard] Gesture state changed for ${title}:`, {
        state: stateName,
        stateCode: state,
        translationX: event.nativeEvent.translationX,
        velocityX: event.nativeEvent.velocityX,
        completed,
        activeOffsetX: event.nativeEvent.activeOffsetX,
        failOffsetY: event.nativeEvent.failOffsetY,
        numberOfPointers: event.nativeEvent.numberOfPointers,
        x: event.nativeEvent.x,
        y: event.nativeEvent.y,
        absoluteX: event.nativeEvent.absoluteX,
        absoluteY: event.nativeEvent.absoluteY,
        timestamp: event.nativeEvent.timestamp
      });

      if (state === 5) { // END state
        if (event.nativeEvent.translationX > 100) {
          console.log(`[TodoCard] Delete triggered for: ${title}`);
          // Swiped right enough to trigger delete
          Animated.timing(translateX, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(({ finished }) => {
            console.log(`[TodoCard] Animation finished for ${title}:`, { finished });
            if (finished) {
              console.log(`[TodoCard] Calling onDelete for: ${title}`);
              onDelete?.();
            } else {
              console.error(`[TodoCard] Animation interrupted for ${title}`);
            }
          });
        } else {
          console.log(`[TodoCard] Reset position for: ${title}`);
          // Reset position
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start(({ finished }) => {
            console.log(`[TodoCard] Reset animation finished for ${title}:`, { finished });
          });
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
      onBegan={() => console.log(`[TodoCard] Gesture began for ${title}`)}
      onFailed={(event) => {
        const state = event.nativeEvent.state;
        const stateMap: { [key: number]: string } = {
          0: 'UNDETERMINED',
          1: 'FAILED',
          2: 'BEGAN',
          3: 'CANCELLED',
          4: 'ACTIVE',
          5: 'END'
        };
        const stateName = stateMap[state] || 'UNKNOWN';

        console.error(`[TodoCard] Gesture failed for ${title}:`, {
          state: stateName,
          stateCode: state,
          translationX: event.nativeEvent.translationX,
          translationY: event.nativeEvent.translationY,
          velocityX: event.nativeEvent.velocityX,
          velocityY: event.nativeEvent.velocityY,
          x: event.nativeEvent.x,
          y: event.nativeEvent.y,
          absoluteX: event.nativeEvent.absoluteX,
          absoluteY: event.nativeEvent.absoluteY,
          numberOfPointers: event.nativeEvent.numberOfPointers,
          timestamp: event.nativeEvent.timestamp,
          activeOffsetX: event.nativeEvent.activeOffsetX,
          failOffsetY: event.nativeEvent.failOffsetY
        });
        // Reset position when gesture fails
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }}
      onCancelled={() => {
        console.log(`[TodoCard] Gesture cancelled for ${title}`);
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
          onPress={() => {
            console.log(`[TodoCard] Card pressed: ${title}`);
            onPress?.();
          }} 
          activeOpacity={0.7}
        >
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