import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SubscriptionProvider } from '../../contexts/SubscriptionContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ProfileModal } from '../components/ProfileModal';

export default function TabsLayout() {
  const { colors } = useTheme();
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

  return (
    <SubscriptionProvider>
      <Tabs
        screenOptions={{
          headerTitle: '',
          headerShadowVisible: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.text,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setIsProfileModalVisible(true)}
              style={{ marginRight: 15 }}
            >
              <Ionicons name="person-circle-outline" size={28} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Habits & Todos',
            headerTitle: '',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="timer"
          options={{
            title: 'Dashboard',
            headerTitle: '',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="analytics-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      <ProfileModal
        isVisible={isProfileModalVisible}
        onClose={() => setIsProfileModalVisible(false)}
      />
    </SubscriptionProvider>
  );
}
