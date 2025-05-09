import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HabitCard } from '@/components/ui/HabitCard';
import { HabitModal } from '@/components/ui/HabitModal';
import { ThemedText } from '@/components/ui/ThemedText';
import { TodoCard } from '@/components/ui/TodoCard';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Habit, habitsService } from '@/lib/services/habits';
import { Todo, todosService } from '@/lib/services/todos';

export default function HomeScreen() {
  const { colors } = useTheme();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [isHabitModalVisible, setIsHabitModalVisible] = useState(false);
  
  // Refactored loading states
  const [isScreenLoading, setIsScreenLoading] = useState(false);
  const [isSubmittingTodo, setIsSubmittingTodo] = useState(false);
  const [isSubmittingHabit, setIsSubmittingHabit] = useState(false);
  const [isUpdatingItem, setIsUpdatingItem] = useState(false);

  const { user } = useAuth();

  const handleAddTodo = async () => {
    console.log(`[handleAddTodo] Called. Title: "${newTodoTitle}", isSubmittingTodo: ${isSubmittingTodo}, User: ${!!user}`);
    if (isSubmittingTodo || !newTodoTitle.trim() || !user) {
      if (isSubmittingTodo) console.log('[handleAddTodo] Guard: Add todo already in progress. Bailing out.');
      else console.log(`[handleAddTodo] Guard: Empty title or no user. Title: "${newTodoTitle}", User: ${!!user}. Bailing out.`);
      return;
    }

    console.log('[handleAddTodo] Proceeding: Setting isSubmittingTodo to true.');
    setIsSubmittingTodo(true);
    try {
      const newTodoData: Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed_at'> = {
        content: newTodoTitle.trim(),
        is_completed: false,
      };
      console.log('[handleAddTodo] Calling todosService.createTodo with:', newTodoData);
      const createdTodo = await todosService.createTodo(newTodoData);
      console.log('[handleAddTodo] todosService.createTodo SUCCEEDED. Response:', createdTodo);
      setTodos(prevTodos => [...prevTodos, createdTodo]);
      setNewTodoTitle('');
    } catch (error) {
      console.error('[handleAddTodo] todosService.createTodo FAILED. Error:', error);
    } finally {
      console.log('[handleAddTodo] Finally: Setting isSubmittingTodo to false.');
      setIsSubmittingTodo(false);
    }
  };

  const handleDeleteTodo = useCallback(async (id: string) => {
    if (!user) return;
    setIsUpdatingItem(true);
    try {
      await todosService.deleteTodo(id);
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('[HomeScreen] Error deleting todo:', error);
    } finally {
      setIsUpdatingItem(false);
    }
  }, [user]);

  const handleDeleteHabit = useCallback(async (id: string) => {
    if (!user) return;
    console.log(`[HomeScreen] Attempting to delete habit: ${id}`);
    try {
      await habitsService.deleteHabit(id);
      setHabits(prevHabits => prevHabits.filter(habit => habit.id !== id));
      console.log(`[HomeScreen] Successfully deleted habit: ${id}`);
    } catch (error) {
      console.error(`[HomeScreen] Error deleting habit: ${id}`, error);
    }
  }, [user]);

  const handleToggleTodo = useCallback(async (id: string) => {
    if (!user) return;
    const todoToToggle = todos.find(t => t.id === id);
    if (!todoToToggle) return;

    setIsUpdatingItem(true);
    try {
      const updatedTodo = await todosService.toggleTodoComplete(id, !todoToToggle.is_completed);
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === id ? updatedTodo : todo
        )
      );
    } catch (error) {
      console.error('[HomeScreen] Error toggling todo:', error);
    } finally {
      setIsUpdatingItem(false);
    }
  }, [user, todos]);

  interface HabitModalData {
    title: string;
    emoji: string;
    start_date: string;
  }

  const handleAddHabit = async (emoji: string) => {
    console.log(`[handleAddHabit] Called. Emoji: "${emoji}", isSubmittingHabit: ${isSubmittingHabit}, User: ${!!user}`);
    if (isSubmittingHabit || !user || !emoji) {
       if (isSubmittingHabit) console.log('[handleAddHabit] Guard: Add habit already in progress. Bailing out.');
       else console.log(`[handleAddHabit] Guard: No emoji or no user. Emoji: "${emoji}", User: ${!!user}. Bailing out.`);
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
      const createdHabit = await habitsService.createHabit(newHabitDetails);
      console.log('[handleAddHabit] habitsService.createHabit SUCCEEDED. Response:', createdHabit);
      setHabits(prevHabits => [...prevHabits, createdHabit]);
      setIsHabitModalVisible(false);
    } catch (error) {
      console.error('[handleAddHabit] habitsService.createHabit FAILED. Error:', error);
    } finally {
      console.log('[handleAddHabit] Finally: Setting isSubmittingHabit to false.');
      setIsSubmittingHabit(false);
    }
  };

  const handleHabitLog = async (habitId: string) => {
    if (!user) return;
    setIsUpdatingItem(true);
    console.log(`[HomeScreen] handleHabitLog called for habit: ${habitId}`);

    const habitToLog = habits.find(h => h.id === habitId);
    if (!habitToLog) {
      console.error('[HomeScreen] Habit not found in local state:', habitId);
      setIsUpdatingItem(false);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const isLoggedToday = habitToLog.last_check_date ? habitToLog.last_check_date.startsWith(todayStr) : false;

    try {
      if (isLoggedToday) {
        // Unlog: Delete the log and recalculate streak
        console.log(`[HomeScreen] Unlogging habit: ${habitId} for date: ${todayStr}`);
        await habitsService.deleteHabitLog(habitId, todayStr);
        console.log(`[HomeScreen] Successfully deleted log for habit: ${habitId}`);

        // Recalculate streak
        const remainingLogs = await habitsService.getHabitLogs(habitId);
        remainingLogs.sort((a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime()); // Sort ascending

        let newStreak = 0;
        let newLastCheckDate: string | null = null;

        if (remainingLogs.length > 0) {
          newLastCheckDate = remainingLogs[remainingLogs.length - 1].log_date;
          newStreak = 1;
          for (let i = remainingLogs.length - 2; i >= 0; i--) {
            const currentDate = new Date(remainingLogs[i+1].log_date);
            const previousDate = new Date(remainingLogs[i].log_date);
            const diffTime = currentDate.getTime() - previousDate.getTime();
            const diffDays = diffTime / (1000 * 3600 * 24);
            if (diffDays === 1) {
              newStreak++;
            } else {
              break; // Streak broken
            }
          }
        }
        console.log(`[HomeScreen] Recalculated streak for ${habitId}: ${newStreak}, last_check_date: ${newLastCheckDate}`);
        await habitsService.updateHabitStreakDetails(habitId, { current_streak: newStreak, last_check_date: newLastCheckDate });
        console.log(`[HomeScreen] Successfully updated habit streak details for ${habitId}`);

      } else {
        // Log: Add a new log entry
        console.log(`[HomeScreen] Logging habit: ${habitId} for date: ${todayStr}`);
        await habitsService.logHabitCompletion(habitId, todayStr);
        console.log(`[HomeScreen] Successfully logged habit completion for: ${habitId}`);
      }

      // Refresh all habits to update UI
      const updatedHabits = await habitsService.getHabits();
      setHabits(updatedHabits);
      console.log('[HomeScreen] Refreshed habits list.');

    } catch (error) {
      console.error('[HomeScreen] Error in handleHabitLog:', error);
    } finally {
      setIsUpdatingItem(false);
      console.log(`[HomeScreen] handleHabitLog finished for habit: ${habitId}`);
    }
  };

  useEffect(() => {
    if (user) {
      setIsScreenLoading(true);
      Promise.all([
        todosService.getTodos().then(data => setTodos(data || [])).catch(err => console.error("Error fetching todos:", err)),
        habitsService.getHabits().then(data => setHabits(data || [])).catch(err => console.error("Error fetching habits:", err))
      ]).finally(() => setIsScreenLoading(false));
    } else {
      setTodos([]);
      setHabits([]);
    }
  }, [user]);

  const renderTodoItem = useCallback(({ item }: { item: Todo }) => (
    <TodoCard
      title={item.content}
      completed={item.is_completed}
      onPress={() => handleToggleTodo(item.id)}
      onDelete={() => handleDeleteTodo(item.id)}
    />
  ), [handleToggleTodo, handleDeleteTodo]);

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
              placeholder="Add task..."
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
            />
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: colors.primary }]} 
              onPress={handleAddTodo}
            >
              <ThemedText style={[styles.addButtonText, { color: '#FFFFFF' }]}>Add</ThemedText>
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
            <ThemedText type="title" style={[styles.sectionTitle, { color: colors.text }]}>Habits</ThemedText>
            <TouchableOpacity 
              style={[styles.newHabitButton, { backgroundColor: colors.primary }]}
              onPress={() => setIsHabitModalVisible(true)}
            >
              <ThemedText style={[styles.newHabitButtonText, { color: '#FFFFFF' }]}>New Habit</ThemedText>
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
});
