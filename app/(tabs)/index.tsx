import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HabitCard } from '@/components/ui/HabitCard';
import { HabitModal } from '@/components/ui/HabitModal';
import { InteractiveWalkthrough } from '@/components/ui/InteractiveWalkthrough';
import { RemotePaywallModal } from '@/components/ui/RemotePaywallModal';
import { ThemedText } from '@/components/ui/ThemedText';
import { TodoCard } from '@/components/ui/TodoCard';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Habit, habitsService } from '@/lib/services/habits';
import { Todo, todosService } from '@/lib/services/todos';
import { clearWidgetData, updateWidgetData } from '@/lib/services/widgetData';

export default function HomeScreen() {
  const { colors, theme } = useTheme();
  const { isPremium, isLoading: subscriptionLoading, isInitialized, isQuickCacheLoaded } = useSubscription();
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [isHabitModalVisible, setIsHabitModalVisible] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Track paywall state changes (dev only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && showPaywall) {
      console.log('[HomeScreen] Paywall shown');
    }
  }, [showPaywall]);
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  // Refactored loading states
  const [isScreenLoading, setIsScreenLoading] = useState(false);
  const [isSubmittingTodo, setIsSubmittingTodo] = useState(false);
  const [isSubmittingHabit, setIsSubmittingHabit] = useState(false);
  const [isUpdatingItem, setIsUpdatingItem] = useState(false);
  const [loggingHabits, setLoggingHabits] = useState<Set<string>>(new Set());

  const { user, loading: authLoading, isAnonymous, anonymousUserId } = useAuth();
  const userId = user?.id || anonymousUserId;

  // Check if user has seen the walkthrough
  useEffect(() => {
    const checkWalkthroughStatus = async () => {
      if (!user?.id) return;
      
      try {
        const hasSeenWalkthrough = await AsyncStorage.getItem(`app_walkthrough_seen_${user.id}`);
        if (!hasSeenWalkthrough) {
          // Show walkthrough after a short delay to let the UI load
          setTimeout(() => {
            setShowWalkthrough(true);
          }, 1000);
        }
      } catch (error) {
        console.error('Error checking walkthrough status:', error);
      }
    };

    // Only check after data has loaded to ensure UI is ready
    if (user?.id && !isScreenLoading) {
      checkWalkthroughStatus();
    }
  }, [user?.id, isScreenLoading]);

  const handleWalkthroughComplete = async () => {
    setShowWalkthrough(false);
    if (user?.id) {
      try {
        await AsyncStorage.setItem(`app_walkthrough_seen_${user.id}`, 'true');
        
        // Show paywall for new users after walkthrough completion
        // Only show if user is not already premium and cache is loaded
        if (isQuickCacheLoaded && !isPremium) {
          // Small delay to ensure walkthrough modal is fully closed before showing paywall
          setTimeout(() => {
            setShowPaywall(true);
          }, 300);
        }
      } catch (error) {
        console.error('Error saving walkthrough status:', error);
      }
    }
  };

  // Don't make decisions about limits until subscription is initialized
  // FIXED: Improved logic to enforce limits for free users even during subscription loading
  const canCheckLimits = !authLoading && !!user; // Simplified: if user is authenticated, we can check limits
  const isTaskLimitReached = canCheckLimits && !isPremium && todos.length >= 3;
  const isHabitLimitReached = canCheckLimits && !isPremium && habits.length >= 3;

  // Simplified debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[HomeScreen] Status:', {
      userExists: !!user,
      isPremium,
      habitsCount: habits.length,
      canCheckLimits
    });
  }

  const handleAddTodo = async () => {
    // Updated check to support anonymous users
    if (isSubmittingTodo || !newTodoTitle.trim() || (!user && !anonymousUserId)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[handleAddTodo] Blocked:', { 
          isSubmittingTodo, 
          hasTitle: !!newTodoTitle.trim(), 
          hasUser: !!user, 
          hasAnonymousId: !!anonymousUserId,
          authLoading 
        });
      }
      return;
    }

    // Check task limit for free users (only if we can check limits)
    if (canCheckLimits && !isPremium && isTaskLimitReached) {
      setShowPaywall(true);
      return;
    }

    setIsSubmittingTodo(true);
    try {
      const newTodo = await todosService.createTodo(
        { content: newTodoTitle.trim(), is_completed: false },
        userId!,
        isAnonymous || userId?.startsWith('anon_')
      );
      setTodos(prevTodos => {
        const newTodos = [newTodo, ...prevTodos];
        updateWidgetData(newTodos, habits, theme, isPremium);
        return newTodos;
      });
      setNewTodoTitle('');
    } catch (error) {
      console.error('[HomeScreen] Error creating todo:', error);
    } finally {
      setIsSubmittingTodo(false);
    }
  };

  const handleDeleteTodo = useCallback(async (id: string) => {
    if (!userId) return;
    setIsUpdatingItem(true);
    try {
      await todosService.deleteTodo(id, userId, isAnonymous || userId.startsWith('anon_'));
      setTodos(prevTodos => {
        const newTodos = prevTodos.filter(todo => todo.id !== id);
        updateWidgetData(newTodos, habits, theme, isPremium);
        return newTodos;
      });
    } catch (error) {
      console.error('[HomeScreen] Error deleting todo:', error);
    } finally {
      setIsUpdatingItem(false);
    }
  }, [userId, habits, theme, isPremium, isAnonymous]);

  const handleDeleteHabit = useCallback(async (id: string) => {
    if (!userId) return;
    console.log(`[HomeScreen] Attempting to delete habit: ${id}`);
    try {
      await habitsService.deleteHabit(id, userId, isAnonymous || userId.startsWith('anon_'));
      setHabits(prevHabits => {
        const newHabits = prevHabits.filter(habit => habit.id !== id);
        updateWidgetData(todos, newHabits, theme, isPremium);
        return newHabits;
      });
      console.log(`[HomeScreen] Successfully deleted habit: ${id}`);
    } catch (error) {
      console.error(`[HomeScreen] Error deleting habit: ${id}`, error);
    }
  }, [userId, todos, theme, isPremium, isAnonymous]);

  const handleToggleTodo = useCallback(async (id: string) => {
    if (!userId) return;
    const todoToToggle = todos.find(t => t.id === id);
    if (!todoToToggle) return;

    setIsUpdatingItem(true);
    try {
      const updatedTodo = await todosService.toggleTodoComplete(id, !todoToToggle.is_completed, userId, isAnonymous || userId.startsWith('anon_'));
      setTodos(prevTodos => {
        const newTodos = prevTodos.map(todo =>
          todo.id === id ? updatedTodo : todo
        );
        updateWidgetData(newTodos, habits, theme, isPremium);
        return newTodos;
      });
    } catch (error) {
      console.error('[HomeScreen] Error toggling todo:', error);
    } finally {
      setIsUpdatingItem(false);
    }
  }, [userId, todos, habits, theme, isPremium, isAnonymous]);

  interface HabitModalData {
    title: string;
    emoji: string;
    start_date: string;
  }

  const handleAddHabit = async (emoji: string) => {
    // Updated check to support anonymous users
    if (isSubmittingHabit || !emoji || (!user && !anonymousUserId)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[handleAddHabit] Blocked:', { 
          isSubmittingHabit, 
          hasEmoji: !!emoji, 
          hasUser: !!user, 
          hasAnonymousId: !!anonymousUserId,
          authLoading 
        });
      }
      return;
    }

    // Check habit limit for free users (only if we can check limits)
    if (canCheckLimits && !isPremium && isHabitLimitReached) {
      console.log('[handleAddHabit] Free user has reached habit limit. Showing paywall.');
      setIsHabitModalVisible(false);
      setShowPaywall(true);
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[handleAddHabit] Creating habit:', emoji);
    }
    setIsSubmittingHabit(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const newHabitDetails: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'current_streak' | 'last_check_date'> = {
        emoji: emoji,
        start_date: today,
      };
      const createdHabit = await habitsService.createHabit(newHabitDetails, userId!, isAnonymous || userId?.startsWith('anon_'));
      setHabits(prevHabits => {
        const newHabits = [...prevHabits, createdHabit];
        updateWidgetData(todos, newHabits, theme, isPremium);
        return newHabits;
      });
      setIsHabitModalVisible(false);
    } catch (error) {
      console.error('[handleAddHabit] Error creating habit:', error);
    } finally {
      setIsSubmittingHabit(false);
    }
  };

  const handleHabitLog = async (habitId: string) => {
    if (!userId) return;

    // Prevent multiple simultaneous calls for the same habit
    if (loggingHabits.has(habitId)) {
      console.log(`[HomeScreen] handleHabitLog already in progress for habit: ${habitId}`);
      return;
    }

    console.log(`[HomeScreen] handleHabitLog called for habit: ${habitId}`);
    
    const targetHabit = habits.find(h => h.id === habitId);
    if (!targetHabit) {
      console.error(`[HomeScreen] Habit not found: ${habitId}`);
      return;
    }

    // Mark this habit as being processed
    setLoggingHabits(prev => new Set(prev).add(habitId));

    const todayStr = new Date().toISOString().split('T')[0];
    const isLoggedToday = targetHabit.last_check_date && targetHabit.last_check_date.startsWith(todayStr);

    // Optimistic UI update - update immediately for better UX
    const optimisticHabit = {
      ...targetHabit,
      current_streak: isLoggedToday 
        ? Math.max(0, targetHabit.current_streak - 1) // Decrease streak (approximate)
        : targetHabit.current_streak + 1, // Increase streak
      last_check_date: isLoggedToday ? null : todayStr, // Toggle logged state
    };

    // Update UI immediately with optimistic state
    setHabits(prevHabits => {
      const newHabits = prevHabits.map(habit => 
        habit.id === habitId ? optimisticHabit : habit
      );
      updateWidgetData(todos, newHabits, theme, isPremium);
      return newHabits;
    });

    try {
      // For anonymous users, use individual log/unlog methods
      if (isAnonymous || userId?.startsWith('anon_')) {
        if (isLoggedToday) {
          // Unlog the habit
          await habitsService.deleteHabitLog(habitId, todayStr, userId, true);
        } else {
          // Log the habit
          await habitsService.logHabitCompletion(habitId, todayStr, userId, true);
        }
        
        // Update the habit streak manually for anonymous users
        const newStreak = isLoggedToday 
          ? Math.max(0, targetHabit.current_streak - 1)
          : targetHabit.current_streak + 1;
        
        const updatedHabit = await habitsService.updateHabit(
          habitId,
          { 
            current_streak: newStreak,
            last_check_date: isLoggedToday ? null : todayStr
          },
          userId,
          true
        );
        
        // Update with the actual response
        setHabits(prevHabits => {
          const newHabits = prevHabits.map(habit => 
            habit.id === habitId ? updatedHabit : habit
          );
          updateWidgetData(todos, newHabits, theme, isPremium);
          return newHabits;
        });
      } else {
        // For authenticated users, use the optimized toggle method
        const updatedHabit = await habitsService.toggleHabitLog(habitId, userId);
      
              // Update with the actual server response
        setHabits(prevHabits => {
          const newHabits = prevHabits.map(habit => 
            habit.id === habitId ? updatedHabit : habit
          );
          updateWidgetData(todos, newHabits, theme, isPremium);
          return newHabits;
        });
      }

      console.log(`[HomeScreen] Successfully toggled habit log for: ${habitId}`);
    } catch (error) {
      if (isAnonymous || userId?.startsWith('anon_')) {
        console.error('[HomeScreen] Error in anonymous habit logging:', error);
      } else {
        console.warn('[HomeScreen] Server-side toggle failed, falling back to client-side method:', error);
        
        try {
          // Fallback to optimized client-side method
          const updatedHabit = await habitsService.toggleHabitLogFallback(habitId, userId);
        
          // Update with the actual server response
          setHabits(prevHabits => {
            const newHabits = prevHabits.map(habit => 
              habit.id === habitId ? updatedHabit : habit
            );
            updateWidgetData(todos, newHabits, theme, isPremium);
            return newHabits;
          });

          console.log(`[HomeScreen] Successfully toggled habit log (fallback) for: ${habitId}`);
        } catch (fallbackError) {
          console.error('[HomeScreen] Error in handleHabitLog (both methods failed):', fallbackError);
          
          // Revert optimistic update on error
          setHabits(prevHabits => {
            const revertedHabits = prevHabits.map(habit => 
              habit.id === habitId ? targetHabit : habit
            );
            updateWidgetData(todos, revertedHabits, theme, isPremium);
            return revertedHabits;
          });
        }
      }
      
      // Revert optimistic update on error for anonymous users too
      if (isAnonymous || userId?.startsWith('anon_')) {
        setHabits(prevHabits => {
          const revertedHabits = prevHabits.map(habit => 
            habit.id === habitId ? targetHabit : habit
          );
          updateWidgetData(todos, revertedHabits, theme, isPremium);
          return revertedHabits;
        });
      }
    } finally {
      // Always remove the habit from the logging set when done
      setLoggingHabits(prev => {
        const newSet = new Set(prev);
        newSet.delete(habitId);
        return newSet;
      });
    }

    console.log(`[HomeScreen] handleHabitLog finished for habit: ${habitId}`);
  };

  useEffect(() => {
    if (userId) {
      setIsScreenLoading(true);
      const useLocalStorage = isAnonymous || userId.startsWith('anon_');
      
      Promise.all([
        todosService.getTodos(userId, useLocalStorage).then(data => setTodos(data || [])).catch(err => console.error("Error fetching todos:", err)),
        habitsService.getHabits(userId, useLocalStorage).then(data => setHabits(data || [])).catch(err => console.error("Error fetching habits:", err))
      ])
        .finally(() => {
          setIsScreenLoading(false);
        });
    } else {
      setTodos([]);
      setHabits([]);
      clearWidgetData(); // Clear widget data on sign out
    }
  }, [userId, isAnonymous]);

  // New useEffect to update widget data when todos or habits change from any source (initial fetch, add, delete, etc.)
  useEffect(() => {
    if (userId && (todos.length > 0 || habits.length > 0)) { // Ensure data is present before updating
      updateWidgetData(todos, habits, theme, isPremium);
    }
    // Adding theme to dependency array to re-run if theme changes.
  }, [todos, habits, userId, theme, isPremium, isAnonymous]);

  const renderTodoItem = useCallback(({ item }: { item: Todo }) => (
    <TodoCard
      title={item.content}
      completed={item.is_completed}
      onPress={() => handleToggleTodo(item.id)}
      onDelete={() => handleDeleteTodo(item.id)}
    />
  ), [handleToggleTodo, handleDeleteTodo]);

  const renderHabitItem = useCallback(({ item }: { item: Habit }) => (
    <HabitCard
      id={item.id}
      emoji={item.emoji}
      streak={item.current_streak}
      startDate={item.start_date}
      lastLoggedDate={item.last_check_date === null ? undefined : item.last_check_date}
      onPress={() => handleHabitLog(item.id)}
      onDelete={() => handleDeleteHabit(item.id)}
      isLoading={loggingHabits.has(item.id)}
    />
  ), [handleHabitLog, handleDeleteHabit, loggingHabits]);

  return (
    <SafeAreaView edges={['bottom']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView style={[styles.bg]} contentContainerStyle={styles.container}>

        {/* Header with upgrade and help buttons */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          {/* Upgrade to Premium button for free users */}
          {canCheckLimits && !isPremium && (
            <TouchableOpacity
              style={[styles.helpButton, { backgroundColor: colors.primary, borderColor: colors.primary, marginRight: 8 }]}
              onPress={() => {
                console.log('[HomeScreen] Upgrade to Premium button pressed');
                setShowPaywall(true);
              }}
            >
              <ThemedText style={[styles.helpButtonText, { color: '#FFFFFF' }]}>
                ⭐ Upgrade to Premium
              </ThemedText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.helpButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowWalkthrough(true)}
          >
            <ThemedText style={[styles.helpButtonText, { color: colors.primary }]}>
              ❓ Help
            </ThemedText>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.cardSection, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeaderRow}>
            <ThemedText type="title" style={[styles.sectionTitle, { color: colors.text }]}>Daily Tasks</ThemedText>
            <ThemedText style={[styles.taskCount, { color: colors.secondary }]}>{todos.length}/3 tasks</ThemedText>
          </View>
          <View style={styles.inputRow}>
            <TextInput
              placeholder={isTaskLimitReached ? "Task limit reached" : "Add task..."}
              style={[styles.input, {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text
              }]}
              placeholderTextColor={colors.secondary}
              value={newTodoTitle}
              onChangeText={setNewTodoTitle}
              onSubmitEditing={handleAddTodo}
              returnKeyType="done"
              editable={!isTaskLimitReached} // Disable input if limit reached
            />
            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: isTaskLimitReached ? colors.disabled : colors.primary }, // Change button color if disabled
              ]}
              onPress={handleAddTodo}
              disabled={isTaskLimitReached} // Disable button if limit reached
            >
              <ThemedText style={[styles.addButtonText, { color: '#FFFFFF' }]}>
                {isTaskLimitReached ? 'Limit' : 'Add'}
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View>
            <FlatList<Todo>
              data={todos}
              renderItem={renderTodoItem}
              keyExtractor={item => item.id}
              removeClippedSubviews={true}
              initialNumToRender={3}
              maxToRenderPerBatch={3}
              windowSize={3}
              scrollEnabled={false}
            />
          </View>
        </View>

        <View style={[styles.cardSection, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.habitHeaderLeft}>
              <ThemedText type="title" style={[styles.sectionTitle, { color: colors.text }]}>Habits</ThemedText>
              <ThemedText style={[styles.habitCount, { color: colors.secondary }]}>
                {habits.length}/{isPremium ? '∞' : '3'} habits
                {canCheckLimits && !isPremium && isHabitLimitReached && (
                  <ThemedText style={[styles.limitText, { color: '#EF4444' }]}> • Limit reached</ThemedText>
                )}
              </ThemedText>
            </View>
            <TouchableOpacity
              style={[
                styles.newHabitButton,
                { backgroundColor: (canCheckLimits && !isPremium && isHabitLimitReached) ? colors.border : colors.primary }
              ]}
              onPress={() => {
                if (canCheckLimits && !isPremium && isHabitLimitReached) {
                  setShowPaywall(true);
                } else {
                  setIsHabitModalVisible(true);
                }
              }}
            >
              <ThemedText style={[
                styles.newHabitButtonText,
                { color: (canCheckLimits && !isPremium && isHabitLimitReached) ? colors.secondary : '#FFFFFF' }
              ]}>
                {(canCheckLimits && !isPremium && isHabitLimitReached) ? 'Upgrade' : 'New Habit'}
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View>
            {habits.map((habit: Habit) => (
              <HabitCard
                key={habit.id}
                id={habit.id}
                emoji={habit.emoji}
                streak={habit.current_streak}
                onPress={() => handleHabitLog(habit.id)}
                onDelete={handleDeleteHabit}
                startDate={habit.start_date}
                lastLoggedDate={habit.last_check_date === null ? undefined : habit.last_check_date}
                isLoading={loggingHabits.has(habit.id)}
              />
            ))}
          </View>
        </View>

        <HabitModal
          visible={isHabitModalVisible}
          onClose={() => setIsHabitModalVisible(false)}
          onSave={(emoji) => handleAddHabit(emoji)}
        />

        <RemotePaywallModal
          visible={showPaywall}
          onClose={() => {
            console.log('[HomeScreen] Paywall modal closed');
            setShowPaywall(false);
          }}
        />

        <InteractiveWalkthrough
          visible={showWalkthrough}
          onClose={handleWalkthroughComplete}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  bg: {
    flex: 1,
  },
  container: {
    paddingTop: 32, // Reduced from 32 since SafeAreaView will handle the top spacing
    paddingBottom: 32,
    paddingHorizontal: 0,
  },
  cardSection: {
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: 32,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  taskCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
  },
  addButton: {
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  newHabitButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  newHabitButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  habitHeaderLeft: {
    flex: 1,
  },
  habitCount: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  limitText: {
    fontSize: 12,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerSpacer: {
    flex: 1,
  },
  helpButton: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  helpButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
});
