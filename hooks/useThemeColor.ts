/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from 'react-native';

export function useThemeColor() {
  const colorScheme = useColorScheme();
  
  return {
    isDark: colorScheme === 'dark',
    text: colorScheme === 'dark' ? '#fff' : '#000',
    background: colorScheme === 'dark' ? '#1D3D47' : '#fff',
    primary: colorScheme === 'dark' ? '#A1CEDC' : '#007AFF',
  };
}
