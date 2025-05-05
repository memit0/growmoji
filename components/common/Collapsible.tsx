import React, { ReactNode, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { ThemedText } from '../ui/ThemedText';

interface CollapsibleProps {
  title: string;
  children: ReactNode;
  initiallyExpanded?: boolean;
}

export function Collapsible({
  title,
  children,
  initiallyExpanded = false,
}: CollapsibleProps) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const height = useSharedValue(initiallyExpanded ? 1 : 0);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    height.value = withTiming(isExpanded ? 0 : 1, { duration: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      maxHeight: height.value === 0 ? 0 : 1000,
      opacity: height.value,
    };
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleExpand} style={styles.header}>
        <ThemedText type="subtitle">{title}</ThemedText>
        <ThemedText>{isExpanded ? '▼' : '▶'}</ThemedText>
      </TouchableOpacity>
      <Animated.View style={[styles.content, animatedStyle]}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  content: {
    overflow: 'hidden',
  },
}); 