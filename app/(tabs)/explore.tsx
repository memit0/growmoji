import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { HabitCard } from '@/components/ui/HabitCard';
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

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');

  // Track component lifecycle
  React.useEffect(() => {
    console.log('[ExploreScreen] Component mounted');
    return () => {
      console.log('[ExploreScreen] Component unmounting');
    };
  }, []);

  // Track todos state changes
  React.useEffect(() => {
    console.log('[ExploreScreen] Todos state changed:', {
      totalTodos: todos.length,
      completedTodos: todos.filter(t => t.completed).length,
      todoIds: todos.map(t => t.id)
    });
  }, [todos]);

  const habits = [
    {
      id: '1',
      emoji: '🧘',
      streak: 7,
      frequency: 'Daily',
      completed: true,
    },
    {
      id: '2',
      emoji: '📚',
      streak: 3,
      frequency: 'Daily',
      completed: false,
    },
    {
      id: '3',
      emoji: '💪',
      streak: 5,
      frequency: 'Mon, Wed, Fri',
      completed: false,
    },
  ];

  const handleAddTodo = () => {
    try {
      if (!newTodoTitle.trim()) {
        console.log('[ExploreScreen] Empty todo title, skipping add');
        return;
      }
      
      if (todos.length >= 3) {
        console.error('[ExploreScreen] Maximum todos reached, cannot add more');
        return;
      }

      // Rotate through priorities based on the number of existing todos
      const priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
      const nextPriority = priorities[todos.length];

      const newTodo: Todo = {
        id: `todo-${Date.now()}`,
        title: newTodoTitle.trim(),
        priority: nextPriority,
        completed: false,
      };

      console.log('[ExploreScreen] Adding new todo:', newTodo);
      setTodos(prevTodos => {
        const newTodos = [...prevTodos, newTodo];
        console.log('[ExploreScreen] New todos state:', newTodos);
        return newTodos;
      });
      setNewTodoTitle('');
    } catch (error) {
      console.error('[ExploreScreen] Error adding todo:', error);
    }
  };

  const handleDeleteTodo = (id: string) => {
    try {
      console.log('[ExploreScreen] Deleting todo with id:', id);
      console.log('[ExploreScreen] Current todos before deletion:', todos);
      setTodos(prevTodos => {
        const newTodos = prevTodos.filter(todo => todo.id !== id);
        console.log('[ExploreScreen] Todos after deletion:', newTodos);
        return newTodos;
      });
    } catch (error) {
      console.error('[ExploreScreen] Error deleting todo:', error);
    }
  };

  const handleToggleTodo = (id: string) => {
    try {
      console.log('[ExploreScreen] Toggling todo with id:', id);
      console.log('[ExploreScreen] Current todos before toggle:', todos);
      setTodos(prevTodos => {
        const newTodos = prevTodos.map(todo => {
          if (todo.id === id) {
            const updatedTodo = { ...todo, completed: !todo.completed };
            console.log('[ExploreScreen] Toggled todo:', updatedTodo);
            return updatedTodo;
          }
          return todo;
        });
        console.log('[ExploreScreen] Todos after toggle:', newTodos);
        return newTodos;
      });
    } catch (error) {
      console.error('[ExploreScreen] Error toggling todo:', error);
    }
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  console.log('[ExploreScreen] Completed todos count:', completedCount);

  // Memoized renderItem for FlatList
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
          <TouchableOpacity style={styles.newHabitButton}>
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
              completed={habit.completed}
              onPress={() => {
                // TODO: Navigate to habit details
                console.log('Pressed habit:', habit.emoji);
              }}
            />
          ))}
        </View>
      </View>
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
    // backgroundColor will be set dynamically
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
    // backgroundColor, borderColor, color will be set dynamically
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
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newHabitButtonText: {
    color: '#18181b',
    fontWeight: '600',
    fontSize: 16,
  },
});
