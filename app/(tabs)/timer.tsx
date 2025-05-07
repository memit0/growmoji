import { PomodoroTimer } from '@/components/ui/PomodoroTimer';
import { Colors } from '@/constants/Colors';
import { StyleSheet, View, useColorScheme } from 'react-native';

export default function TimerScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PomodoroTimer onComplete={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 