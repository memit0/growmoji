import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HabitCard } from '@/components/ui/HabitCard';
import { HabitModal } from '@/components/ui/HabitModal';
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
  const { isPremium, isLoading: subscriptionLoading, isInitialized } = useSubscription();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [isHabitModalVisible, setIsHabitModalVisible] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Refactored loading states
  const [isScreenLoading, setIsScreenLoading] = useState(false);
  const [isSubmittingTodo, setIsSubmittingTodo] = useState(false);
  const [isSubmittingHabit, setIsSubmittingHabit] = useState(false);
  const [isUpdatingItem, setIsUpdatingItem] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const userId = user?.id;

  // Don't make decisions about limits until subscription is initialized
  const canCheckLimits = !authLoading && (!user || isInitialized);
  const isTaskLimitReached = canCheckLimits && todos.length >= 3;
  const isHabitLimitReached = canCheckLimits && habits.length >= 3;

  const handleAddTodo = async () => {
    if (isSubmittingTodo || !newTodoTitle.trim() || !user || !userId) return;

    // Check task limit for free users (only if we can check limits)
    if (canCheckLimits && !isPremium && isTaskLimitReached) {
      setShowPaywall(true);
      return;
    }

    setIsSubmittingTodo(true);
    try {
      const newTodo = await todosService.createTodo(
        { content: newTodoTitle.trim(), is_completed: false },
        userId
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
    if (!user || !userId) return;
    setIsUpdatingItem(true);
    try {
      await todosService.deleteTodo(id, userId);
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
  }, [user, userId, habits, theme, isPremium]);

  const handleDeleteHabit = useCallback(async (id: string) => {
    if (!user || !userId) return;
    console.log(`[HomeScreen] Attempting to delete habit: ${id}`);
    try {
      await habitsService.deleteHabit(id, userId);
      setHabits(prevHabits => {
        const newHabits = prevHabits.filter(habit => habit.id !== id);
        updateWidgetData(todos, newHabits, theme, isPremium);
        return newHabits;
      });
      console.log(`[HomeScreen] Successfully deleted habit: ${id}`);
    } catch (error) {
      console.error(`[HomeScreen] Error deleting habit: ${id}`, error);
    }
  }, [user, userId, todos, theme, isPremium]);

  const handleToggleTodo = useCallback(async (id: string) => {
    if (!user || !userId) return;
    const todoToToggle = todos.find(t => t.id === id);
    if (!todoToToggle) return;

    setIsUpdatingItem(true);
    try {
      const updatedTodo = await todosService.toggleTodoComplete(id, !todoToToggle.is_completed, userId);
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
  }, [user, userId, todos, habits, theme, isPremium]);

  interface HabitModalData {
    title: string;
    emoji: string;
    start_date: string;
  }

  const handleAddHabit = async (emoji: string) => {
    console.log(`[handleAddHabit] Called. Emoji: "${emoji}", isSubmittingHabit: ${isSubmittingHabit}, user: ${user ? 'present' : 'null'}, userId: ${userId}`);
    if (isSubmittingHabit || !emoji || !user || !userId) {
      if (isSubmittingHabit) console.log('[handleAddHabit] Guard: Add habit already in progress. Bailing out.');
      else console.log(`[handleAddHabit] Guard: No emoji, not signed in, or no userId. Emoji: "${emoji}", user: ${user ? 'present' : 'null'}, userId: ${userId}. Bailing out.`);
      return;
    }

    // Check habit limit for free users (only if we can check limits)
    if (canCheckLimits && !isPremium && isHabitLimitReached) {
      console.log('[handleAddHabit] Free user has reached habit limit. Showing paywall.');
      setIsHabitModalVisible(false);
      setShowPaywall(true);
      return;
    }

    console.log('[handleAddHabit] Proceeding: Setting isSubmittingHabit to true.');
    setIsSubmittingHabit(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const newHabitDetails: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'current_streak' | 'last_check_date'> = {
        emoji: emoji,
        start_date: today,
      };
      console.log('[handleAddHabit] Calling habitsService.createHabit with:', newHabitDetails);
      const createdHabit = await habitsService.createHabit(newHabitDetails, userId);
      console.log('[handleAddHabit] habitsService.createHabit SUCCEEDED. Response:', createdHabit);
      setHabits(prevHabits => {
        const newHabits = [...prevHabits, createdHabit];
        updateWidgetData(todos, newHabits, theme, isPremium);
        return newHabits;
      });
      setIsHabitModalVisible(false);
    } catch (error) {
      console.error('[handleAddHabit] habitsService.createHabit FAILED. Error:', error);
    } finally {
      console.log('[handleAddHabit] Finally: Setting isSubmittingHabit to false.');
      setIsSubmittingHabit(false);
    }
  };

  const handleHabitLog = async (habitId: string) => {
    if (!user || !userId) return;

    setIsUpdatingItem(true);
    console.log(`[HomeScreen] handleHabitLog called for habit: ${habitId}`);

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const targetHabit = habits.find(h => h.id === habitId);

      if (!targetHabit) {
        console.error(`[HomeScreen] Habit not found: ${habitId}`);
        return;
      }

      const isLoggedToday = targetHabit.last_check_date && targetHabit.last_check_date.startsWith(todayStr);

      if (isLoggedToday) {
        // Unlog: Delete the log entry for today
        console.log(`[HomeScreen] Unlogging habit: ${habitId} for date: ${todayStr}`);
        await habitsService.deleteHabitLog(habitId, todayStr, userId);
        console.log(`[HomeScreen] Successfully deleted habit log for: ${habitId}`);

        // Recalculate streak after removing today's log
        const remainingLogs = await habitsService.getHabitLogs(habitId, userId);
        let newStreak = 0;
        let newLastCheckDate: string | null = null;

        if (remainingLogs.length > 0) {
          // Sort logs by date (newest first)
          remainingLogs.sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime());
          newLastCheckDate = remainingLogs[0].log_date;
          newStreak = 1; // At least 1 if there are any logs

          // Calculate consecutive days from the most recent log backwards
          for (let i = 1; i < remainingLogs.length; i++) {
            const currentDate = new Date(remainingLogs[i - 1].log_date);
            const previousDate = new Date(remainingLogs[i].log_date);
            const diffTime = currentDate.getTime() - previousDate.getTime();
            const diffDays = diffTime / (1000 * 3600 * 24);
            if (diffDays === 1) {
              newStreak++;
            } else {
              break;
            }
          }
        }

        await habitsService.updateHabitStreakDetails(habitId, { current_streak: newStreak, last_check_date: newLastCheckDate }, userId);
        console.log(`[HomeScreen] Successfully updated habit streak details for ${habitId}`);

      } else {
        // Log: Add a new log entry
        console.log(`[HomeScreen] Logging habit: ${habitId} for date: ${todayStr}`);
        await habitsService.logHabitCompletion(habitId, todayStr, userId);
        console.log(`[HomeScreen] Successfully logged habit completion for: ${habitId}`);
      }

      // Refresh all habits to update UI
      const refreshedHabits = await habitsService.getHabits(userId);
      setHabits(refreshedHabits);
      updateWidgetData(todos, refreshedHabits, theme, isPremium);
      console.log('[HomeScreen] Refreshed habits list.');

    } catch (error) {
      console.error('[HomeScreen] Error in handleHabitLog:', error);
    } finally {
      setIsUpdatingItem(false);
      console.log(`[HomeScreen] handleHabitLog finished for habit: ${habitId}`);
    }
  };

  useEffect(() => {
    if (user && userId) {
      setIsScreenLoading(true);
      Promise.all([
        todosService.getTodos(userId).then(data => setTodos(data || [])).catch(err => console.error("Error fetching todos:", err)),
        habitsService.getHabits(userId).then(data => setHabits(data || [])).catch(err => console.error("Error fetching habits:", err))
      ])
        .finally(() => {
          setIsScreenLoading(false);
        });
    } else {
      setTodos([]);
      setHabits([]);
      clearWidgetData(); // Clear widget data on sign out
    }
  }, [user, userId]);

  // New useEffect to update widget data when todos or habits change from any source (initial fetch, add, delete, etc.)
  useEffect(() => {
    if (user && userId && (todos.length > 0 || habits.length > 0)) { // Ensure data is present before updating
      updateWidgetData(todos, habits, theme, isPremium);
    }
    // Adding theme to dependency array to re-run if theme changes.
  }, [todos, habits, user, userId, theme, isPremium]);

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
    />
  ), [handleHabitLog, handleDeleteHabit]);

  return (
    <SafeAreaView edges={['bottom']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView style={[styles.bg]} contentContainerStyle={styles.container}>
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
          onClose={() => setShowPaywall(false)}
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
  // Add a new style for disabled button/input elements if needed
  // For example:
  // disabledInput: {
  //   backgroundColor: '#e0e0e0', // Lighter grey for disabled state
  //   color: '#a0a0a0',
  // },
  // disabledButton: {
  //   backgroundColor: '#cccccc',
  // },
});
