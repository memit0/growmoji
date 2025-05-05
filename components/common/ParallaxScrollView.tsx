import React, { ReactNode } from 'react';
import {
    ScrollView,
    StyleSheet,
    View,
    useWindowDimensions
} from 'react-native';
import Animated, {
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';

interface ParallaxScrollViewProps {
  children: ReactNode;
  headerImage?: ReactNode;
  headerBackgroundColor?: {
    light: string;
    dark: string;
  };
}

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor = { light: '#fff', dark: '#000' },
}: ParallaxScrollViewProps) {
  const { height: windowHeight } = useWindowDimensions();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: scrollY.value * 0.5,
        },
      ],
    };
  });

  return (
    <ScrollView
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      style={styles.container}>
      <View
        style={[
          styles.header,
          {
            height: windowHeight * 0.3,
            backgroundColor: headerBackgroundColor.light,
          },
        ]}>
        <Animated.View style={[styles.headerImage, headerStyle]}>
          {headerImage}
        </Animated.View>
      </View>
      <View style={styles.content}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    overflow: 'hidden',
  },
  headerImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 16,
  },
}); 