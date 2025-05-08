import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { HabitCard } from '@/components/ui/HabitCard';
import { HabitModal } from '@/components/ui/HabitModal';
import { ThemedText } from '@/components/ui/ThemedText';
import { TodoCard } from '@/components/ui/TodoCard';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { Habit, habitsService } from '@/lib/services/habits';
import { Todo, todosService } from '@/lib/services/todos';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [todos, setTodos] = useState<Todo[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [isHabitModalVisible, setIsHabitModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleAddTodo = async () => {
    if (!newTodoTitle.trim() || !user) {
      console.log('[HomeScreen] Empty todo title or no user, skipping add');
      return;
    }

    setIsLoading(true);
    try {
      const priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
      const nextPriority = priorities[todos.length % priorities.length] || 'low';

      const newTodoData: Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
        title: newTodoTitle.trim(),
        priority: nextPriority,
        completed: false,
      };

      const createdTodo = await todosService.createTodo(newTodoData);
      setTodos(prevTodos => [...prevTodos, createdTodo]);
      setNewTodoTitle('');
    } catch (error) {
      console.error('[HomeScreen] Error adding todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      await todosService.deleteTodo(id);
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('[HomeScreen] Error deleting todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTodo = async (id: string) => {
    if (!user) return;
    const todoToToggle = todos.find(t => t.id === id);
    if (!todoToToggle) return;

    setIsLoading(true);
    try {
      const updatedTodo = await todosService.toggleTodoComplete(id, !todoToToggle.completed);
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === id ? updatedTodo : todo
        )
      );
    } catch (error) {
      console.error('[HomeScreen] Error toggling todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  interface HabitModalData {
    title: string;
    emoji: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    start_date: string;
  }

  const handleAddHabit = async (emoji: string) => {
    if (!user || !emoji) {
       console.log('[HomeScreen] No emoji or no user, skipping add habit');
      return;
    }
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const newHabitDetails: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'current_streak' | 'longest_streak'> = {
        title: `New Habit ${emoji}`,
        emoji: emoji,
        frequency: 'daily',
        start_date: today,
      };
      
      const createdHabit = await habitsService.createHabit(newHabitDetails);
      setHabits(prevHabits => [...prevHabits, createdHabit]);
      setIsHabitModalVisible(false);
    } catch (error) {
      console.error('[HomeScreen] Error adding habit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHabitLog = async (habitId: string) => {
    if(!user) return;
    console.log(`[HomeScreen] Attempting to log habit: ${habitId}`);
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const loggedHabitEntry = await habitsService.logHabitCompletion(habitId, today);
      
      const updatedHabits = await habitsService.getHabits();
      setHabits(updatedHabits);

      console.log('[HomeScreen] Successfully logged habit and updated list. Log entry:', loggedHabitEntry);
    } catch (error) {
      console.error('[HomeScreen] Error logging habit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      Promise.all([
        todosService.getTodos().then(data => setTodos(data || [])).catch(err => console.error("Error fetching todos:", err)),
        habitsService.getHabits().then(data => setHabits(data || [])).catch(err => console.error("Error fetching habits:", err))
      ]).finally(() => setIsLoading(false));
    } else {
      setTodos([]);
      setHabits([]);
    }
  }, [user]);

  const renderTodoItem = useCallback(({ item }: { item: Todo }) => (
    <TodoCard
      key={item.id}
      title={item.title}
      dueDate={item.due_date}
      priority={item.priority}
      completed={item.completed}
      onPress={() => handleToggleTodo(item.id)}
      onDelete={() => handleDeleteTodo(item.id)}
    />
  ), [handleToggleTodo, handleDeleteTodo, todos]);

  return (
    <ScrollView style={[styles.bg, { backgroundColor: colors.background }]} contentContainerStyle={styles.container}>
      <View style={[styles.cardSection, { backgroundColor: colors.card }]}> 
        <View style={styles.sectionHeaderRow}>
          <ThemedText type="title" style={[styles.sectionTitle, { color: colors.text }]}>Daily Tasks</ThemedText>
          <ThemedText style={styles.taskCount}>{todos.length}/3 tasks</ThemedText>
        </View>
        <View style={styles.inputRow}>
          <TextInput
            placeholder="Add a task for today..."
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
            placeholderTextColor={colors.placeholder}
            value={newTodoTitle}
            onChangeText={setNewTodoTitle}
            onSubmitEditing={handleAddTodo}
            returnKeyType="done"
          />
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={handleAddTodo}
          >
            <ThemedText style={styles.addButtonText}>Add</ThemedText>
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
            style={styles.newHabitButton}
            onPress={() => setIsHabitModalVisible(true)}
          >
            <ThemedText style={styles.newHabitButtonText}>New Habit</ThemedText>
          </TouchableOpacity>
        </View>
        <View>
          {habits.map((habit: Habit) => (
            <HabitCard
              key={habit.id}
              emoji={habit.emoji || ''}
              streak={habit.current_streak}
              frequency={habit.frequency}
              onPress={() => handleHabitLog(habit.id)}
              startDate={habit.start_date}
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
  );
}

const styles = StyleSheet.create({
  bg: {
    // backgroundColor will be set dynamically
  },
  container: {
    paddingVertical: 32,
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
    color: '#18181b',
  },
  taskCount: {
    fontSize: 14,
    color: '#9BA1A6',
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
    backgroundColor: '#e5e5e5',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#18181b',
    fontWeight: '600',
    fontSize: 16,
  },
  newHabitButton: {
    backgroundColor: '#e5e5e5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  newHabitButtonText: {
    color: '#18181b',
    fontWeight: '600',
    fontSize: 14,
  },
});
