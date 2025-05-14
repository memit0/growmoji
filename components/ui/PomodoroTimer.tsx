import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface PomodoroTimerProps {
  onComplete?: () => void;
}

export function PomodoroTimer({ onComplete }: PomodoroTimerProps) {
  const { colors } = useTheme();
  
  const [workDuration, setWorkDuration] = useState(25); // minutes
  const [breakDuration, setBreakDuration] = useState(5); // minutes
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const toggleTimer = useCallback(() => {
    setIsActive(prev => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(workDuration * 60);
    setIsBreak(false);
  }, [workDuration]);

  const adjustDuration = (type: 'work' | 'break', increment: boolean) => {
    if (type === 'work') {
      const newDuration = increment ? workDuration + 1 : workDuration - 1;
      if (newDuration >= 1 && newDuration <= 60) {
        setWorkDuration(newDuration);
        if (!isActive && !isBreak) {
          setTimeLeft(newDuration * 60);
        }
      }
    } else {
      const newDuration = increment ? breakDuration + 1 : breakDuration - 1;
      if (newDuration >= 1 && newDuration <= 30) {
        setBreakDuration(newDuration);
        if (!isActive && isBreak) {
          setTimeLeft(newDuration * 60);
        }
      }
    }
  };

  useEffect(() => {
    let interval: number;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (!isBreak) {
        setTimeLeft(breakDuration * 60);
        setIsBreak(true);
      } else {
        setTimeLeft(workDuration * 60);
        setIsBreak(false);
      }
      onComplete?.();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, isBreak, onComplete, workDuration, breakDuration]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.timerContainer}>
        <ThemedText type="defaultSemiBold" style={[styles.timerText, { color: colors.text }]}>
          {formatTime(timeLeft)}
        </ThemedText>
        <ThemedText style={[styles.statusText, { color: colors.secondary }]}>
          {isBreak ? 'Break Time' : 'Focus Time'}
        </ThemedText>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={toggleTimer}
        >
          <ThemedText style={styles.buttonText}>
            {isActive ? 'Pause' : 'Start'}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.error }]}
          onPress={resetTimer}
        >
          <ThemedText style={styles.buttonText}>Reset</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.secondary }]}
          onPress={() => setIsSettingsVisible(!isSettingsVisible)}
        >
          <ThemedText style={styles.buttonText}>Settings</ThemedText>
        </TouchableOpacity>
      </View>

      {isSettingsVisible && (
        <View style={styles.settingsContainer}>
          <View style={styles.settingRow}>
            <ThemedText style={[styles.settingLabel, { color: colors.text }]}>Work Duration (min)</ThemedText>
            <View style={styles.durationControls}>
              <TouchableOpacity
                style={[styles.durationButton, { backgroundColor: colors.primary }]}
                onPress={() => adjustDuration('work', false)}
              >
                <ThemedText style={styles.buttonText}>-</ThemedText>
              </TouchableOpacity>
              <ThemedText style={[styles.durationText, { color: colors.text }]}>{workDuration}</ThemedText>
              <TouchableOpacity
                style={[styles.durationButton, { backgroundColor: colors.primary }]}
                onPress={() => adjustDuration('work', true)}
              >
                <ThemedText style={styles.buttonText}>+</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingRow}>
            <ThemedText style={[styles.settingLabel, { color: colors.text }]}>Break Duration (min)</ThemedText>
            <View style={styles.durationControls}>
              <TouchableOpacity
                style={[styles.durationButton, { backgroundColor: colors.primary }]}
                onPress={() => adjustDuration('break', false)}
              >
                <ThemedText style={styles.buttonText}>-</ThemedText>
              </TouchableOpacity>
              <ThemedText style={[styles.durationText, { color: colors.text }]}>{breakDuration}</ThemedText>
              <TouchableOpacity
                style={[styles.durationButton, { backgroundColor: colors.primary }]}
                onPress={() => adjustDuration('break', true)}
              >
                <ThemedText style={styles.buttonText}>+</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  durationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  durationText: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
}); 