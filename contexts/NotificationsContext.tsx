import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

interface NotificationsContextType {
  notificationsEnabled: boolean;
  toggleNotifications: () => Promise<void>;
  soundEnabled: boolean;
  toggleSound: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
    checkNotificationPermissions();
  }, []);

  const loadSettings = async () => {
    try {
      const notifEnabled = await AsyncStorage.getItem('notificationsEnabled');
      const soundEnabled = await AsyncStorage.getItem('soundEnabled');
      setNotificationsEnabled(notifEnabled === 'true');
      setSoundEnabled(soundEnabled !== 'false'); // Default to true
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const checkNotificationPermissions = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus === 'granted') {
      setNotificationsEnabled(true);
      await AsyncStorage.setItem('notificationsEnabled', 'true');
    }
  };

  const toggleNotifications = async () => {
    try {
      if (!notificationsEnabled) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          return; // Don't toggle if permission not granted
        }
      }
      
      const newValue = !notificationsEnabled;
      setNotificationsEnabled(newValue);
      await AsyncStorage.setItem('notificationsEnabled', String(newValue));
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  const toggleSound = async () => {
    try {
      const newValue = !soundEnabled;
      setSoundEnabled(newValue);
      await AsyncStorage.setItem('soundEnabled', String(newValue));
    } catch (error) {
      console.error('Error toggling sound:', error);
    }
  };

  return (
    <NotificationsContext.Provider
      value={{
        notificationsEnabled,
        toggleNotifications,
        soundEnabled,
        toggleSound,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}; 