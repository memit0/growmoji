import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-expo';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Habit, habitsService } from '../../lib/services/habits';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface HabitProgressDashboardProps {
  onRefresh?: () => void;
}

interface HabitStats {
  totalHabits: number;
  activeHabits: number;
  completedToday: number;
  averageStreak: number;
  longestStreak: number;
  weeklyCompletionRate: number;
}

export function HabitProgressDashboard({ onRefresh }: HabitProgressDashboardProps) {
  const { colors } = useTheme();
  const { isSignedIn, isLoaded } = useClerkAuth();
  const { user } = useUser();
  const userId = user?.id;
  
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<HabitStats>({
    totalHabits: 0,
    activeHabits: 0,
    completedToday: 0,
    averageStreak: 0,
    longestStreak: 0,
    weeklyCompletionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const calculateStats = useCallback((habits: Habit[]): HabitStats => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    const totalHabits = habits.length;
    const activeHabits = habits.filter(habit => habit.current_streak > 0).length;
    const completedToday = habits.filter(habit => 
      habit.last_check_date && habit.last_check_date.startsWith(todayStr)
    ).length;
    
    const averageStreak = totalHabits > 0 
      ? Math.round(habits.reduce((sum, habit) => sum + habit.current_streak, 0) / totalHabits)
      : 0;
    
    const longestStreak = habits.reduce((max, habit) => 
      Math.max(max, habit.current_streak), 0
    );

    // Simple weekly completion rate calculation
    const weeklyCompletionRate = totalHabits > 0 
      ? Math.round((completedToday / totalHabits) * 100)
      : 0;

    return {
      totalHabits,
      activeHabits,
      completedToday,
      averageStreak,
      longestStreak,
      weeklyCompletionRate,
    };
  }, []);

  const loadHabits = useCallback(async () => {
    if (!isSignedIn || !userId) {
      setHabits([]);
      setStats({
        totalHabits: 0,
        activeHabits: 0,
        completedToday: 0,
        averageStreak: 0,
        longestStreak: 0,
        weeklyCompletionRate: 0,
      });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const fetchedHabits = await habitsService.getHabits(userId);
      setHabits(fetchedHabits);
      setStats(calculateStats(fetchedHabits));
      onRefresh?.();
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setIsLoading(false);
    }
  }, [calculateStats, isSignedIn, userId, onRefresh]);

  // Initial load when auth is ready
  useEffect(() => {
    if (isLoaded) {
      loadHabits();
    }
  }, [loadHabits, isLoaded]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isLoaded && isSignedIn && userId) {
        loadHabits();
      }
    }, [loadHabits, isLoaded, isSignedIn, userId])
  );

  // Auto-refresh every 30 seconds when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (!isLoaded || !isSignedIn || !userId) return;

      const interval = setInterval(() => {
        loadHabits();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }, [loadHabits, isLoaded, isSignedIn, userId])
  );

  const getMotivationalMessage = () => {
    if (stats.completedToday === stats.totalHabits && stats.totalHabits > 0) {
      return "🎉 Perfect day! All habits completed!";
    } else if (stats.completedToday > stats.totalHabits / 2) {
      return "🔥 Great progress! Keep it up!";
    } else if (stats.completedToday > 0) {
      return "💪 Good start! Let's complete more!";
    } else {
      return "🌟 Time to start building those habits!";
    }
  };

  const StatCard = ({ title, value, subtitle, icon }: { 
    title: string; 
    value: string; 
    subtitle?: string; 
    icon: string;
  }) => (
    <ThemedView style={[styles.statCard, { backgroundColor: colors.card }]}>
      <View style={styles.statHeader}>
        <ThemedText style={styles.statIcon}>{icon}</ThemedText>
        <ThemedText type="defaultSemiBold" style={[styles.statValue, { color: colors.primary }]}>
          {value}
        </ThemedText>
      </View>
      <ThemedText style={[styles.statTitle, { color: colors.text }]}>{title}</ThemedText>
      {subtitle && (
        <ThemedText style={[styles.statSubtitle, { color: colors.secondary }]}>
          {subtitle}
        </ThemedText>
      )}
    </ThemedView>
  );

  const ProgressBar = ({ progress, label }: { progress: number; label: string }) => (
    <View style={styles.progressContainer}>
      <View style={styles.progressLabelContainer}>
        <ThemedText style={[styles.progressLabel, { color: colors.text }]}>{label}</ThemedText>
        <ThemedText style={[styles.progressValue, { color: colors.primary }]}>{progress}%</ThemedText>
      </View>
      <View style={[styles.progressBarBackground, { backgroundColor: colors.background }]}>
        <View 
          style={[
            styles.progressBarFill, 
            { 
              backgroundColor: colors.primary,
              width: `${Math.min(progress, 100)}%`
            }
          ]} 
        />
      </View>
    </View>
  );

  // Show loading while auth is loading
  if (!isLoaded) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedView style={[styles.loadingContainer, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.loadingText, { color: colors.secondary }]}>
            Loading...
          </ThemedText>
        </ThemedView>
      </View>
    );
  }

  // Show sign in message when not authenticated
  if (!isSignedIn) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedView style={[styles.notSignedInContainer, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.notSignedInTitle, { color: colors.text }]}>
            📊 Habit Dashboard
          </ThemedText>
          <ThemedText style={[styles.notSignedInText, { color: colors.secondary }]}>
            Please sign in to view your habit progress and analytics.
          </ThemedText>
        </ThemedView>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={[styles.header, { backgroundColor: colors.card }]}>
        <ThemedText type="title" style={[styles.headerTitle, { color: colors.text }]}>
          Progress Dashboard
        </ThemedText>
        {isLoading && (
          <ThemedText style={[styles.refreshingText, { color: colors.secondary }]}>
            Refreshing...
          </ThemedText>
        )}
      </ThemedView>

      <ThemedView style={[styles.motivationCard, { backgroundColor: colors.card }]}>
        <ThemedText style={[styles.motivationText, { color: colors.text }]}>
          {getMotivationalMessage()}
        </ThemedText>
      </ThemedView>

      <View style={styles.statsGrid}>
        <StatCard
          icon="📊"
          title="Total Habits"
          value={stats.totalHabits.toString()}
          subtitle="All time"
        />
        <StatCard
          icon="🔥"
          title="Active Streaks"
          value={stats.activeHabits.toString()}
          subtitle="Currently active"
        />
        <StatCard
          icon="✅"
          title="Completed Today"
          value={`${stats.completedToday}/${stats.totalHabits}`}
          subtitle="Daily progress"
        />
        <StatCard
          icon="⚡"
          title="Longest Streak"
          value={stats.longestStreak.toString()}
          subtitle="Days in a row"
        />
      </View>

      <ThemedView style={[styles.progressSection, { backgroundColor: colors.card }]}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
          Progress Overview
        </ThemedText>
        
        <ProgressBar 
          progress={stats.weeklyCompletionRate} 
          label="Daily Completion Rate"
        />
        
        <ProgressBar 
          progress={stats.totalHabits > 0 ? Math.round((stats.activeHabits / stats.totalHabits) * 100) : 0} 
          label="Active Habits"
        />
        
        <ProgressBar 
          progress={stats.longestStreak > 0 ? Math.min((stats.averageStreak / stats.longestStreak) * 100, 100) : 0} 
          label="Average Streak Performance"
        />
      </ThemedView>

      {habits.length > 0 && (
        <ThemedView style={[styles.habitsSection, { backgroundColor: colors.card }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Habits
          </ThemedText>
          {habits.slice(0, 3).map((habit) => {
            const todayStr = new Date().toISOString().split('T')[0];
            const isCompletedToday = habit.last_check_date && habit.last_check_date.startsWith(todayStr);
            
            return (
              <View key={habit.id} style={styles.habitItem}>
                <View style={styles.habitInfo}>
                  <ThemedText style={styles.habitEmoji}>{habit.emoji}</ThemedText>
                  <View style={styles.habitDetails}>
                    <ThemedText style={[styles.habitStreak, { color: colors.primary }]}>
                      🔥 {habit.current_streak} days
                    </ThemedText>
                    <ThemedText style={[styles.habitStatus, { color: colors.secondary }]}>
                      {isCompletedToday ? '✅ Completed today' : '⏳ Pending today'}
                    </ThemedText>
                  </View>
                </View>
              </View>
            );
          })}
        </ThemedView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  refreshingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  motivationCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  motivationText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
  },
  progressSection: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  habitsSection: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  habitItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  habitDetails: {
    flex: 1,
  },
  habitStreak: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  habitStatus: {
    fontSize: 14,
  },
  loadingContainer: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  notSignedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notSignedInTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  notSignedInText: {
    fontSize: 16,
  },
}); 