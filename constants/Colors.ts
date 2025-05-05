/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Color system for the Habit Tracker app.
 * Defines colors for both light and dark modes with semantic naming.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    // Base colors
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,

    // Semantic colors
    primary: '#0a7ea4',
    secondary: '#687076',
    success: '#2E7D32',
    warning: '#ED6C02',
    error: '#D32F2F',
    info: '#0288D1',

    // UI Elements
    card: '#FFFFFF',
    border: '#E1E3E5',
    input: '#F8F9FA',
    placeholder: '#9BA1A6',

    // Habit specific
    streak: '#FF9800',
    completed: '#4CAF50',
    missed: '#F44336',
    upcoming: '#2196F3',
  },
  dark: {
    // Base colors
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,

    // Semantic colors
    primary: '#0a7ea4',
    secondary: '#9BA1A6',
    success: '#4CAF50',
    warning: '#FFA726',
    error: '#EF5350',
    info: '#29B6F6',

    // UI Elements
    card: '#1C1E1F',
    border: '#2D2F30',
    input: '#2D2F30',
    placeholder: '#687076',

    // Habit specific
    streak: '#FFB74D',
    completed: '#66BB6A',
    missed: '#EF5350',
    upcoming: '#42A5F5',
  },
};
