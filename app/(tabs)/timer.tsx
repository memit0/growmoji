import { PomodoroTimer } from '@/components/ui/PomodoroTimer';
import { StyleSheet, View } from 'react-native';

export default function TimerScreen() {
  return (
    <View style={styles.container}>
      <PomodoroTimer onComplete={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 