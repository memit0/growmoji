import { HabitProgressDashboard } from '@/components/ui/HabitProgressDashboard';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ProfileModal } from '../../app/components';
import { useTheme } from '../../contexts/ThemeContext';

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