import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const onboardingSlides = [
  {
    key: '1',
    title: 'Welcome to Growmoji!',
    description: 'Overwhelmed by complex to-do lists and habit trackers? We believe simplicity is the key to consistency and lasting success.',
  },
  {
    key: '2',
    title: 'Unlock Effortless Productivity',
    description: 'Clarity helps you build sustainable habits and manage tasks with focused ease. Say goodbye to clutter, hello to progress.',
  },
  {
    key: '3',
    title: 'Small Steps, Monumental Wins',
    description: 'Break down your ambitious goals into simple, manageable actions. Witness your progress, stay motivated, and transform your daily routine.',
  },
  {
    key: '4',
    title: "Let's Get Started!",
    description: 'Ready to simplify your life and amplify your achievements? Tap below to begin your journey with Clarity.',
  },
];

export default function OnboardingScreen() {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < onboardingSlides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // Navigate to the paywall screen
      router.replace('/'); 
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    slide: {
      width: width,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
    },
    title: {
      fontSize: typography.fontSize.xxxl,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    description: {
      fontSize: typography.fontSize.lg,
      color: colors.secondary,
      textAlign: 'center',
      marginBottom: spacing.xxl,
      lineHeight: typography.fontSize.lg * 1.5,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      minWidth: '60%',
      alignItems: 'center',
      marginTop: spacing.lg,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: typography.fontSize.md,
      fontWeight: '600',
    },
    paginationContainer: {
      position: 'absolute',
      bottom: spacing.xxl + spacing.lg + 60, // Adjust based on button height + desired spacing
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    paginationDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.border,
      marginHorizontal: spacing.xs,
    },
    activeDot: {
      backgroundColor: colors.primary,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: spacing.xl,
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    }
  });

  const renderItem = ({ item }: { item: typeof onboardingSlides[0] }) => (
    <View style={styles.slide}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        ref={flatListRef}
        data={onboardingSlides}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        decelerationRate="fast"
      />
      <View style={styles.paginationContainer}>
        {onboardingSlides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              currentIndex === index && styles.activeDot,
            ]}
          />
        ))}
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === onboardingSlides.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
} 