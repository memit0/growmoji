import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Habit, HabitLog, habitsService } from '../../lib/services/habits';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface HabitMonthGraphProps {
  habit: Habit;
  onHabitUpdated?: () => void;
}

interface DayData {
  date: string;
  count: number;
  isToday: boolean;
  dayOfMonth: number;
}

export function HabitYearGraph({ habit, onHabitUpdated }: HabitMonthGraphProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthData, setMonthData] = useState<DayData[]>([]);
  const [currentMonth, setCurrentMonth] = useState('');

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
      generateMonthData([]);
      return;
    }
    generateMonthData(logs);
  }, [logs, loading]);

  const generateMonthData = (habitLogs: HabitLog[]) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonthIndex = today.getMonth();
    
    // Set the current month name for display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    setCurrentMonth(monthNames[currentMonthIndex]);
    
    // Get first and last day of current month
    const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonthIndex + 1, 0);

    const data: DayData[] = [];
    const logMap = new Map<string, number>();

    habitLogs.forEach(log => {
      const dateStr = log.log_date;
      logMap.set(dateStr, (logMap.get(dateStr) || 0) + 1);
    });

    for (let d = new Date(firstDayOfMonth); d <= lastDayOfMonth; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const isToday = dateStr === today.toISOString().split('T')[0];
      
      data.push({
        date: dateStr,
        count: logMap.get(dateStr) || 0,
        isToday,
        dayOfMonth: d.getDate()
      });
    }

    setMonthData(data);
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
    return colors.primary; // Single color for any logged day
  };

  const getWeeksArray = () => {
    const weeks: DayData[][] = [];
    let currentWeek: DayData[] = [];

    // Add empty days at the beginning of the first week
    if (monthData.length > 0) {
      const firstDay = new Date(monthData[0].date);
      const dayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push({
          date: '',
          count: 0,
          isToday: false,
          dayOfMonth: 0
        });
      }
    }

    monthData.forEach((day, index) => {
      const dayOfWeek = new Date(day.date).getDay();
      
      if (dayOfWeek === 0 && currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      currentWeek.push(day);
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      if (index === monthData.length - 1 && currentWeek.length > 0) {
        // Fill remaining days of the last week
        while (currentWeek.length < 7) {
          currentWeek.push({
            date: '',
            count: 0,
            isToday: false,
            dayOfMonth: 0
          });
        }
        weeks.push(currentWeek);
      }
    });

    return weeks;
  };

  const totalLogs = logs.filter(log => {
    const logDate = new Date(log.log_date);
    const today = new Date();
    return logDate.getMonth() === today.getMonth() && logDate.getFullYear() === today.getFullYear();
  }).length;
  
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
            {currentMonth} Progress
          </ThemedText>
          <View style={styles.statsRow}>
            <ThemedText style={[styles.statText, { color: colors.secondary }]}>
              {totalLogs} this month • {currentStreak} day streak
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.graphContainer}>
        <View style={styles.graph}>
          {/* Day labels */}
          <View style={styles.dayLabels}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <ThemedText key={index} style={[styles.dayLabel, { color: colors.secondary }]}>
                {day}
              </ThemedText>
            ))}
          </View>

          {/* Graph grid */}
          <View style={styles.weeksContainer}>
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.week}>
                {week.map((day, dayIndex) => (
                  day.date ? (
                    <TouchableOpacity
                      key={day.date}
                      style={[
                        styles.daySquare,
                        { 
                          backgroundColor: getIntensityColor(day.count),
                          borderColor: day.isToday ? colors.primary : 'transparent',
                          borderWidth: day.isToday ? 2 : 1,
                        }
                      ]}
                      activeOpacity={0.7}
                      onPress={() => handleDayPress(day)}
                      disabled={day.date !== today}
                    >
                      <ThemedText style={[styles.dayNumber, { 
                        color: day.count > 0 ? colors.background : colors.text,
                        fontSize: 10
                      }]}>
                        {day.dayOfMonth}
                      </ThemedText>
                    </TouchableOpacity>
                  ) : (
                    <View key={`empty-${weekIndex}-${dayIndex}`} style={styles.emptyDay} />
                  )
                ))}
              </View>
            ))}
          </View>


        </View>
      </View>
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
    alignItems: 'center',
  },
  graph: {
    width: '100%',
  },
  dayLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  weeksContainer: {
    alignItems: 'center',
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  daySquare: {
    width: 36,
    height: 36,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  dayNumber: {
    fontWeight: 'bold',
  },
  emptyDay: {
    width: 36,
    height: 36,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendText: {
    fontSize: 10,
  },
  legendSquares: {
    flexDirection: 'row',
    marginHorizontal: 8,
  },
  legendSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginHorizontal: 2,
  },
}); 