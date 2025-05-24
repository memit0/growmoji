import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PaywallModal } from '../components/ui/PaywallModal';
import { useSubscription } from '../contexts/SubscriptionContext';
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
    title: 'Choose Your Experience',
    description: 'Start with our free plan (3 habits) or unlock unlimited potential with premium features.',
  },
];

export default function OnboardingScreen() {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const { isPremium } = useSubscription();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < onboardingSlides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // On last slide, show options
      setShowPaywall(true);
    }
  };

  const handleStartFree = () => {
    setShowPaywall(false);
    router.replace('/');
  };

  const handlePaywallClose = () => {
    setShowPaywall(false);
    // If they subscribed, go to app, otherwise stay
    if (isPremium) {
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
    lastSlideButtons: {
      width: '100%',
      alignItems: 'center',
      marginTop: spacing.lg,
    },
    premiumButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      width: '80%',
      alignItems: 'center',
      marginBottom: spacing.md,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    freeButton: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      width: '80%',
      alignItems: 'center',
    },
    premiumButtonText: {
      color: '#FFFFFF',
      fontSize: typography.fontSize.md,
      fontWeight: '600',
    },
    freeButtonText: {
      color: colors.text,
      fontSize: typography.fontSize.md,
      fontWeight: '500',
    },
    freeSubtext: {
      fontSize: typography.fontSize.sm,
      color: colors.secondary,
      textAlign: 'center',
      marginTop: spacing.xs,
      marginBottom: spacing.md,
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
      
      {currentIndex === onboardingSlides.length - 1 && (
        <View style={styles.lastSlideButtons}>
          <TouchableOpacity style={styles.premiumButton} onPress={() => setShowPaywall(true)}>
            <Text style={styles.premiumButtonText}>🚀 Go Premium</Text>
          </TouchableOpacity>
          <Text style={styles.freeSubtext}>or</Text>
          <TouchableOpacity style={styles.freeButton} onPress={handleStartFree}>
            <Text style={styles.freeButtonText}>Start Free (3 habits)</Text>
          </TouchableOpacity>
        </View>
      )}
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
      {currentIndex < onboardingSlides.length - 1 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}

      <PaywallModal
        visible={showPaywall}
        onClose={handlePaywallClose}
        title="Unlock Unlimited Potential"
        subtitle="Get unlimited habits, widgets, and premium features"
        showCloseButton={true}
      />
    </SafeAreaView>
  );
} 