import { Text, TextProps, useColorScheme } from 'react-native';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'defaultSemiBold' | 'title' | 'subtitle' | 'link';
};

export function ThemedText(props: ThemedTextProps) {
  const { style, type = 'default', ...otherProps } = props;
  const color = useColorScheme() === 'dark' ? '#fff' : '#000';
  
  const getFontSize = () => {
    switch (type) {
      case 'title':
        return 24;
      case 'subtitle':
        return 20;
      default:
        return 16;
    }
  };

  const getFontWeight = () => {
    switch (type) {
      case 'defaultSemiBold':
        return '600';
      case 'title':
      case 'subtitle':
        return '700';
      case 'link':
        return '500';
      default:
        return '400';
    }
  };

  return (
    <Text
      style={[
        {
          color: type === 'link' ? '#007AFF' : color,
          fontSize: getFontSize(),
          fontWeight: getFontWeight(),
          textDecorationLine: type === 'link' ? 'underline' : 'none',
        },
        style,
      ]}
      {...otherProps}
    />
  );
} 