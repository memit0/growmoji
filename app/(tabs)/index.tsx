import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { HabitCard } from '@/components/ui/HabitCard';
import { HabitModal } from '@/components/ui/HabitModal';
import { ThemedText } from '@/components/ui/ThemedText';
import { TodoCard } from '@/components/ui/TodoCard';
import { Colors } from '@/constants/Colors';

interface Todo {
  id: string;
  title: string;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

interface Habit {
  id: string;
  emoji: string;
  streak: number;
  frequency: string;
  logged: boolean;
  startDate: string;
  lastLoggedDate?: string;
  missedDays: number;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [todos, setTodos] = useState<Todo[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [isHabitModalVisible, setIsHabitModalVisible] = useState(false);

  const handleAddTodo = () => {
    try {
      if (!newTodoTitle.trim()) {
        console.log('[HomeScreen] Empty todo title, skipping add');
        return;
      }
      
      if (todos.length >= 3) {
        console.error('[HomeScreen] Maximum todos reached, cannot add more');
        return;
      }

      const priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
      const nextPriority = priorities[todos.length];

      const newTodo: Todo = {
        id: `todo-${Date.now()}`,
        title: newTodoTitle.trim(),
        priority: nextPriority,
        completed: false,
      };

      setTodos(prevTodos => [...prevTodos, newTodo]);
      setNewTodoTitle('');
    } catch (error) {
      console.error('[HomeScreen] Error adding todo:', error);
    }
  };

  const handleDeleteTodo = (id: string) => {
    try {
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('[HomeScreen] Error deleting todo:', error);
    }
  };

  const handleToggleTodo = (id: string) => {
    try {
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );
    } catch (error) {
      console.error('[HomeScreen] Error toggling todo:', error);
    }
  };

  const handleAddHabit = (emoji: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const newHabit: Habit = {
        id: `habit-${Date.now()}`,
        emoji,
        streak: 0,
        frequency: 'Daily',
        logged: false,
        startDate: today,
        lastLoggedDate: today,
        missedDays: 0,
      };
      setHabits(prevHabits => [...prevHabits, newHabit]);
      setIsHabitModalVisible(false);
    } catch (error) {
      console.error('[HomeScreen] Error adding habit:', error);
    }
  };

  const handleHabitLog = (habitId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      setHabits(prevHabits => 
        prevHabits.map(habit => {
          if (habit.id === habitId) {
            const lastLogged = new Date(habit.lastLoggedDate || '');
            const todayDate = new Date(today);
            const daysSinceLastLog = Math.floor((todayDate.getTime() - lastLogged.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysSinceLastLog === 0) {
              return { ...habit, logged: !habit.logged };
            }
            
            if (daysSinceLastLog === 1) {
              return {
                ...habit,
                logged: true,
                streak: habit.streak + 1,
                lastLoggedDate: today,
                missedDays: 0,
              };
            }
            
            const newMissedDays = habit.missedDays + daysSinceLastLog - 1;
            
            if (newMissedDays > 1) {
              return {
                ...habit,
                logged: true,
                streak: 1,
                lastLoggedDate: today,
                missedDays: 0,
              };
            }
            
            return {
              ...habit,
              logged: true,
              lastLoggedDate: today,
              missedDays: newMissedDays,
            };
          }
          return habit;
        })
      );
    } catch (error) {
      console.error('[HomeScreen] Error logging habit:', error);
    }
  };

  const renderTodoItem = useCallback(({ item }: { item: Todo }) => (
    <TodoCard
      key={item.id}
      title={item.title}
      dueDate={item.dueDate}
      priority={item.priority}
      completed={item.completed}
      onPress={() => handleToggleTodo(item.id)}
      onDelete={() => handleDeleteTodo(item.id)}
    />
  ), [handleToggleTodo, handleDeleteTodo]);

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
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              emoji={habit.emoji}
              streak={habit.streak}
              frequency={habit.frequency}
              logged={habit.logged}
              onPress={() => handleHabitLog(habit.id)}
              startDate={habit.startDate}
              lastLoggedDate={habit.lastLoggedDate}
            />
          ))}
        </View>
      </View>

      <HabitModal
        visible={isHabitModalVisible}
        onClose={() => setIsHabitModalVisible(false)}
        onSave={handleAddHabit}
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
