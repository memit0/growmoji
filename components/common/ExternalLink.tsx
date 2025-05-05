import React from 'react';
import { Linking, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../ui/ThemedText';

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
}

export function ExternalLink({ href, children }: ExternalLinkProps) {
  return (
    <TouchableOpacity
      onPress={() => Linking.openURL(href)}
      style={styles.link}>
      <ThemedText style={styles.text}>
        {children} ↗
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  link: {
    marginVertical: 4,
  },
  text: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
}); 