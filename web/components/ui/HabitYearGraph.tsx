'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Habit, HabitLog } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface HabitYearGraphProps {
  habit: Habit;
}

interface DayData {
  date: string;
  count: number;
  isToday: boolean;
}

export function HabitYearGraph({ habit }: HabitYearGraphProps) {
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearData, setYearData] = useState<DayData[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/habits/${habit.id}/logs`);
        if (response.ok) {
          const logsData = await response.json();
          setLogs(logsData);
        }
      } catch (error) {
        console.error('Error fetching habit logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [habit.id]);

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
    oneYearAgo.setDate(oneYearAgo.getDate() + 1); // Start from exactly one year ago + 1 day

    const data: DayData[] = [];
    const logMap = new Map<string, number>();

    // Create a map of log dates to count (in case there are multiple logs per day)
    habitLogs.forEach(log => {
      const dateStr = log.log_date;
      logMap.set(dateStr, (logMap.get(dateStr) || 0) + 1);
    });

    // Generate data for each day in the past year
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

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-gray-100 hover:bg-gray-200';
    if (count === 1) return 'bg-green-200 hover:bg-green-300';
    if (count === 2) return 'bg-green-400 hover:bg-green-500';
    if (count >= 3) return 'bg-green-600 hover:bg-green-700';
    return 'bg-gray-100 hover:bg-gray-200';
  };

  const getBorderClass = (isToday: boolean) => {
    return isToday ? 'ring-2 ring-blue-500' : '';
  };

  const getWeeksArray = () => {
    const weeks: DayData[][] = [];
    let currentWeek: DayData[] = [];

    yearData.forEach((day, index) => {
      const dayOfWeek = new Date(day.date).getDay();
      
      // If it's Sunday (0) and we have data in currentWeek, start a new week
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      currentWeek.push(day);
      
      // If it's the last day, push the current week
      if (index === yearData.length - 1) {
        weeks.push(currentWeek);
      }
    });

    return weeks;
  };

  const getMonthLabels = () => {
    const months: { month: string; weekIndex: number }[] = [];
    const weeks = getWeeksArray();
    
    weeks.forEach((week, weekIndex) => {
      const firstDay = week[0];
      if (firstDay) {
        const date = new Date(firstDay.date);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        
        // Only add if it's a new month or the first week
        if (weekIndex === 0 || months[months.length - 1]?.month !== monthName) {
          months.push({ month: monthName, weekIndex });
        }
      }
    });

    return months;
  };

  const totalLogs = logs.length;
  const currentStreak = habit.current_streak || 0;
  const weeks = getWeeksArray();
  const monthLabels = getMonthLabels();

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{habit.emoji}</span>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{habit.emoji}</span>
            <div>
              <CardTitle className="text-lg">Habit Progress</CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <span>{totalLogs} total completions</span>
                <span>{currentStreak} day streak</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Month labels */}
        <div className="flex gap-1 text-xs text-gray-500 mb-2">
          {monthLabels.map((label, index) => (
            <div
              key={index}
              className="text-center"
              style={{ 
                width: `${100 / 52}%`,
                marginLeft: `${(label.weekIndex * 100) / 52}%`,
                position: index === 0 ? 'static' : 'absolute'
              }}
            >
              {label.month}
            </div>
          ))}
        </div>

        {/* Day labels */}
        <div className="flex">
          <div className="flex flex-col gap-1 text-xs text-gray-500 mr-2 w-8">
            <div className="h-3"></div>
            <div>Mon</div>
            <div className="h-3"></div>
            <div>Wed</div>
            <div className="h-3"></div>
            <div>Fri</div>
            <div className="h-3"></div>
          </div>

          {/* Graph grid */}
          <div className="flex gap-1 flex-1 overflow-x-auto">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {/* Fill empty days at the beginning of the first week */}
                {weekIndex === 0 && week.length > 0 && (() => {
                  const firstDay = new Date(week[0].date);
                  const dayOfWeek = firstDay.getDay();
                  const emptyDays = [];
                  for (let i = 0; i < dayOfWeek; i++) {
                    emptyDays.push(
                      <div key={`empty-${i}`} className="w-3 h-3"></div>
                    );
                  }
                  return emptyDays;
                })()}
                
                {week.map((day) => (
                  <div
                    key={day.date}
                    className={`w-3 h-3 rounded-sm cursor-pointer transition-colors ${getIntensityClass(day.count)} ${getBorderClass(day.isToday)}`}
                    title={`${day.date}: ${day.count} completion${day.count !== 1 ? 's' : ''}`}
                  />
                ))}
                
                {/* Fill empty days at the end of the last week */}
                {weekIndex === weeks.length - 1 && week.length > 0 && (() => {
                  const lastDay = new Date(week[week.length - 1].date);
                  const dayOfWeek = lastDay.getDay();
                  const emptyDays = [];
                  for (let i = dayOfWeek + 1; i < 7; i++) {
                    emptyDays.push(
                      <div key={`empty-end-${i}`} className="w-3 h-3"></div>
                    );
                  }
                  return emptyDays;
                })()}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-gray-100"></div>
            <div className="w-3 h-3 rounded-sm bg-green-200"></div>
            <div className="w-3 h-3 rounded-sm bg-green-400"></div>
            <div className="w-3 h-3 rounded-sm bg-green-600"></div>
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
} 