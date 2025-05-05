import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface TodoCardProps {
  title: string;
  dueDate?: string;
  priority?: 'high' | 'medium' | 'low';
  onPress?: () => void;
  completed?: boolean;
}

export function TodoCard({ title, dueDate, priority = 'medium', onPress, completed = false }: TodoCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const priorityColors = {
    high: colors.error,
    medium: colors.warning,
    low: colors.success,
  };

  return (
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
          {completed && (
            <View style={[styles.completedBadge, { backgroundColor: colors.completed }]}>
              <ThemedText style={styles.completedCheck}>✓</ThemedText>
            </View>
          )}
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
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
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCheck: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 