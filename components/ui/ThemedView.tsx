import { View, ViewProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export function ThemedView(props: ViewProps) {
  const { style, ...otherProps } = props;
  const { colors } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.background,
        },
        style,
      ]}
      {...otherProps}
    />
  );
} 