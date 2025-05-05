import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface IconSymbolProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

export function IconSymbol({ name, size = 24, color, style }: IconSymbolProps) {
  return (
    <View style={[styles.container, style]}>
      <ThemedText
        style={[
          styles.symbol,
          {
            fontSize: size,
            color: color,
          },
        ]}>
        {name}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    textAlign: 'center',
  },
}); 