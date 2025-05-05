import { StyleSheet, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { HabitCard } from '@/components/ui/HabitCard';
import { ThemedText } from '@/components/ui/ThemedText';
import { TodoCard } from '@/components/ui/TodoCard';
import { Colors } from '@/constants/Colors';

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

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

  const todos = [
    {
      id: '1',
      title: 'Complete project proposal',
      dueDate: 'Today, 5:00 PM',
      priority: 'high' as const,
      completed: false,
    },
    {
      id: '2',
      title: 'Buy groceries',
      dueDate: 'Tomorrow, 10:00 AM',
      priority: 'medium' as const,
      completed: false,
    },
    {
      id: '3',
      title: 'Call mom',
      dueDate: 'Today, 8:00 PM',
      priority: 'low' as const,
      completed: true,
    },
  ];

  return (
    <ScrollView style={[styles.bg, { backgroundColor: colors.background }]} contentContainerStyle={styles.container}>
      <View style={[styles.cardSection, { backgroundColor: colors.card }]}> 
        <View style={styles.sectionHeaderRow}>
          <ThemedText type="title" style={[styles.sectionTitle, { color: colors.text }]}>Daily Tasks</ThemedText>
          <ThemedText style={styles.taskCount}>1/3 tasks</ThemedText>
        </View>
        <View style={styles.inputRow}>
          <TextInput
            placeholder="Add a task for today..."
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
            placeholderTextColor={colors.placeholder}
          />
          <TouchableOpacity style={styles.addButton}>
            <ThemedText style={styles.addButtonText}>Add</ThemedText>
          </TouchableOpacity>
        </View>
        <View>
          {todos.map((todo) => (
            <TodoCard
              key={todo.id}
              title={todo.title}
              dueDate={todo.dueDate}
              priority={todo.priority}
              completed={todo.completed}
              onPress={() => {
                // TODO: Navigate to todo details
                console.log('Pressed todo:', todo.title);
              }}
            />
          ))}
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
