import { HabitProgressDashboard } from '@/components/ui/HabitProgressDashboard';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ProfileModal } from '../components';

export default function TimerScreen() {
  const { colors } = useTheme();
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HabitProgressDashboard onRefresh={() => {}} />
      <ProfileModal
        isVisible={isProfileModalVisible}
        onClose={() => setIsProfileModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 