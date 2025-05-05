import { View, ViewProps, useColorScheme } from 'react-native';

export function ThemedView(props: ViewProps) {
  const { style, ...otherProps } = props;
  const backgroundColor = useColorScheme() === 'dark' ? '#1D3D47' : '#fff';

  return (
    <View
      style={[
        {
          backgroundColor,
        },
        style,
      ]}
      {...otherProps}
    />
  );
} 