import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { borderRadius, colors, shadows, spacing, typography } from '../constants/theme';

type ThemeType = 'light' | 'dark';
type AppearanceMode = 'system' | 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  appearanceMode: AppearanceMode;
  setAppearanceMode: (mode: AppearanceMode) => Promise<void>;
  isDark: boolean;
  colors: typeof colors.light | typeof colors.dark;
  spacing: typeof spacing;
  typography: typeof typography;
  shadows: typeof shadows.light | typeof shadows.dark;
  borderRadius: typeof borderRadius;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [actualTheme, setActualTheme] = useState<ThemeType>(systemColorScheme || 'light');
  const [currentAppearanceMode, setCurrentAppearanceMode] = useState<AppearanceMode>('system');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('appearanceMode');
        if (savedMode) {
          setCurrentAppearanceMode(savedMode as AppearanceMode);
        }
      } catch (error) {
        console.error('ThemeProvider: Error loading appearance settings:', error);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    let newTheme: ThemeType;
    if (currentAppearanceMode === 'light') {
      newTheme = 'light';
    } else if (currentAppearanceMode === 'dark') {
      newTheme = 'dark';
    } else {
      newTheme = systemColorScheme || 'light';
    }
    setActualTheme(newTheme);
  }, [currentAppearanceMode, systemColorScheme]);

  const handleSetAppearanceMode = React.useCallback(async (mode: AppearanceMode) => {
    setCurrentAppearanceMode(mode);
    try {
      await AsyncStorage.setItem('appearanceMode', mode);
    } catch (error) {
      console.error('ThemeProvider: Error saving appearance settings:', error);
    }
  }, []);

  const value = {
    theme: actualTheme,
    appearanceMode: currentAppearanceMode,
    setAppearanceMode: handleSetAppearanceMode,
    isDark: actualTheme === 'dark',
    colors: colors[actualTheme],
    spacing,
    typography,
    shadows: shadows[actualTheme],
    borderRadius,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 