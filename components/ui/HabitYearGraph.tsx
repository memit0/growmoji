import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Habit, HabitLog, habitsService } from '../../lib/services/habits';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface HabitYearGraphProps {
  habit: Habit;
  onHabitUpdated?: () => void;
}

interface DayData {
  date: string;
  count: number;
  isToday: boolean;
}

export function HabitYearGraph({ habit, onHabitUpdated }: HabitYearGraphProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearData, setYearData] = useState<DayData[]>([]);

  const loadLogs = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const habitLogs = await habitsService.getHabitLogs(habit.id, user.id);
      setLogs(habitLogs);
    } catch (error) {
      console.error('Error loading habit logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [habit.id, user?.id]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    if (logs.length === 0 && !loading) {
      generateYearData([]);
      return;
    }
    generateYearData(logs);
  }, [logs, loading]);

  const generateYearData = (habitLogs: HabitLog[]) => {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    oneYearAgo.setDate(oneYearAgo.getDate() + 1);

    const data: DayData[] = [];
    const logMap = new Map<string, number>();

    habitLogs.forEach(log => {
      const dateStr = log.log_date;
      logMap.set(dateStr, (logMap.get(dateStr) || 0) + 1);
    });

    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const isToday = dateStr === today.toISOString().split('T')[0];
      
      data.push({
        date: dateStr,
        count: logMap.get(dateStr) || 0,
        isToday
      });
    }

    setYearData(data);
  };

  const handleDayPress = async (day: DayData) => {
    if (!user?.id) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Only allow logging for today
      if (day.date !== today) return;
      
      if (day.count > 0) {
        // Unlog the habit
        await habitsService.deleteHabitLog(habit.id, day.date, user.id);
      } else {
        // Log the habit
        await habitsService.logHabitCompletion(habit.id, day.date, user.id);
      }
      
      // Refresh the logs
      await loadLogs();
      
      // Notify parent component to refresh habits data
      if (onHabitUpdated) {
        onHabitUpdated();
      }
    } catch (error) {
      console.error('Error logging/unlogging habit:', error);
    }
  };

  const getIntensityColor = (count: number) => {
    if (count === 0) return colors.background;
    if (count === 1) return '#c6f6d5'; // Light green
    if (count === 2) return '#68d391'; // Medium green
    if (count >= 3) return '#38a169'; // Dark green
    return colors.background;
  };

  const getWeeksArray = () => {
    const weeks: DayData[][] = [];
    let currentWeek: DayData[] = [];

    yearData.forEach((day, index) => {
      const dayOfWeek = new Date(day.date).getDay();
      
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      currentWeek.push(day);
      
      if (index === yearData.length - 1) {
        weeks.push(currentWeek);
      }
    });

    return weeks;
  };

  const totalLogs = logs.length;
  const currentStreak = habit.current_streak || 0;
  const weeks = getWeeksArray();
  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.card }]}>
        <View style={styles.header}>
          <ThemedText style={styles.emoji}>{habit.emoji}</ThemedText>
          <ThemedText style={[styles.loadingText, { color: colors.secondary }]}>
            Loading...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <ThemedText style={styles.emoji}>{habit.emoji}</ThemedText>
        <View style={styles.habitInfo}>
          <ThemedText type="defaultSemiBold" style={[styles.habitTitle, { color: colors.text }]}>
            Habit Progress
          </ThemedText>
          <View style={styles.statsRow}>
            <ThemedText style={[styles.statText, { color: colors.secondary }]}>
              {totalLogs} total • {currentStreak} day streak
            </ThemedText>
          </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.graphContainer}>
        <View style={styles.graph}>
          {/* Month labels */}
          <View style={styles.monthLabels}>
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
              <ThemedText key={month} style={[styles.monthLabel, { color: colors.secondary }]}>
                {month}
              </ThemedText>
            ))}
          </View>

          {/* Day labels */}
          <View style={styles.dayLabelsContainer}>
            <View style={styles.dayLabels}>
              <ThemedText style={[styles.dayLabel, { color: colors.secondary }]}>Mon</ThemedText>
              <ThemedText style={[styles.dayLabel, { color: colors.secondary }]}>Wed</ThemedText>
              <ThemedText style={[styles.dayLabel, { color: colors.secondary }]}>Fri</ThemedText>
            </View>

            {/* Graph grid */}
            <View style={styles.weeksContainer}>
              {weeks.slice(0, 53).map((week, weekIndex) => (
                <View key={weekIndex} style={styles.week}>
                  {/* Fill empty days at beginning */}
                  {weekIndex === 0 && week.length > 0 && (() => {
                    const firstDay = new Date(week[0].date);
                    const dayOfWeek = firstDay.getDay();
                    const emptyDays = [];
                    for (let i = 0; i < dayOfWeek; i++) {
                      emptyDays.push(<View key={`empty-${i}`} style={styles.emptyDay} />);
                    }
                    return emptyDays;
                  })()}
                  
                  {week.map((day) => (
                    <TouchableOpacity
                      key={day.date}
                      style={[
                        styles.daySquare,
                        { 
                          backgroundColor: getIntensityColor(day.count),
                          borderColor: day.isToday ? colors.primary : 'transparent',
                          borderWidth: day.isToday ? 2 : 0,
                        }
                      ]}
                      activeOpacity={0.7}
                      onPress={() => handleDayPress(day)}
                      disabled={day.date !== today} // Only allow logging today
                    />
                  ))}
                  
                  {/* Fill empty days at end */}
                  {weekIndex === weeks.length - 1 && week.length > 0 && (() => {
                    const lastDay = new Date(week[week.length - 1].date);
                    const dayOfWeek = lastDay.getDay();
                    const emptyDays = [];
                    for (let i = dayOfWeek + 1; i < 7; i++) {
                      emptyDays.push(<View key={`empty-end-${i}`} style={styles.emptyDay} />);
                    }
                    return emptyDays;
                  })()}
                </View>
              ))}
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <ThemedText style={[styles.legendText, { color: colors.secondary }]}>Less</ThemedText>
            <View style={styles.legendSquares}>
              <View style={[styles.legendSquare, { backgroundColor: colors.background }]} />
              <View style={[styles.legendSquare, { backgroundColor: '#c6f6d5' }]} />
              <View style={[styles.legendSquare, { backgroundColor: '#68d391' }]} />
              <View style={[styles.legendSquare, { backgroundColor: '#38a169' }]} />
            </View>
            <ThemedText style={[styles.legendText, { color: colors.secondary }]}>More</ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
  },
  loadingText: {
    fontSize: 16,
  },
  graphContainer: {
    maxHeight: 200,
  },
  graph: {
    minWidth: 700, // Ensure it's scrollable
  },
  monthLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    paddingLeft: 20,
  },
  monthLabel: {
    fontSize: 12,
  },
  dayLabelsContainer: {
    flexDirection: 'row',
  },
  dayLabels: {
    width: 20,
    justifyContent: 'space-around',
    height: 105, // 7 days * 15px
    marginRight: 4,
  },
  dayLabel: {
    fontSize: 10,
  },
  weeksContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  week: {
    marginRight: 2,
  },
  daySquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginBottom: 2,
  },
  emptyDay: {
    width: 12,
    height: 12,
    marginBottom: 2,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  legendText: {
    fontSize: 12,
  },
  legendSquares: {
    flexDirection: 'row',
  },
  legendSquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginHorizontal: 1,
  },
}); 