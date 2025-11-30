import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface QuizOption {
  id: string;
  text: string;
  emoji: string;
}

interface OnboardingSlide {
  key: string;
  type: 'welcome' | 'quiz' | 'result' | 'feature' | 'paywall-lead' | 'account-choice';
  title: string;
  description?: string;
  question?: string;
  options?: QuizOption[];
  feature?: {
    icon: string;
    benefits: string[];
  };
}

const onboardingSlides: OnboardingSlide[] = [
  {
    key: '1',
    type: 'welcome',
    title: '🌱 Welcome to Growmoji!',
    description: 'Your journey to better habits and productivity starts here. Let\'s discover what matters most to you.',
  },
  {
    key: '2',
    type: 'quiz',
    title: '🤔 What\'s your biggest challenge?',
    question: 'Be honest - what stops you from being your best self?',
    options: [
      { id: 'procrastination', text: 'I procrastinate too much', emoji: '😴' },
      { id: 'overwhelming', text: 'Too many things to track', emoji: '🌊' },
      { id: 'consistency', text: 'I start but don\'t stick', emoji: '💔' },
      { id: 'motivation', text: 'I lose motivation quickly', emoji: '😞' },
    ],
  },
  {
    key: '3',
    type: 'quiz',
    title: '⏰ When do you feel most productive?',
    question: 'Understanding your rhythm helps build better habits',
    options: [
      { id: 'morning', text: 'Early morning (5-9 AM)', emoji: '🌅' },
      { id: 'midday', text: 'Mid-day (10 AM-2 PM)', emoji: '☀️' },
      { id: 'afternoon', text: 'Afternoon (3-6 PM)', emoji: '🌤️' },
      { id: 'evening', text: 'Evening (7-11 PM)', emoji: '🌙' },
    ],
  },
  {
    key: '4',
    type: 'quiz',
    title: '🎯 What\'s your primary goal?',
    question: 'Let\'s focus on what matters most to you right now',
    options: [
      { id: 'health', text: 'Better health & fitness', emoji: '💪' },
      { id: 'productivity', text: 'Higher productivity', emoji: '🚀' },
      { id: 'mindfulness', text: 'Mental well-being', emoji: '🧘' },
      { id: 'learning', text: 'Learning new skills', emoji: '📚' },
    ],
  },
  {
    key: '5',
    type: 'quiz',
    title: '📱 How do you prefer to track progress?',
    question: 'Everyone has their style - what resonates with you?',
    options: [
      { id: 'visual', text: 'Visual charts & graphs', emoji: '📊' },
      { id: 'streaks', text: 'Streak counters', emoji: '🔥' },
      { id: 'simple', text: 'Simple checkmarks', emoji: '✅' },
      { id: 'gamified', text: 'Points & achievements', emoji: '🏆' },
    ],
  },
  {
    key: '6',
    type: 'result',
    title: '🎉 Perfect! We understand you',
    description: 'Based on your answers, we\'ll customize Growmoji to match your style and goals perfectly.',
  },
  {
    key: '7',
    type: 'feature',
    title: '📋 Smart Todo Management',
    description: 'Never lose track of what matters most',
    feature: {
      icon: '📋',
      benefits: [
        'Intelligent prioritization',
        'Due date reminders',
        'Category organization',
        'Progress tracking'
      ],
    },
  },
  {
    key: '8',
    type: 'feature',
    title: '🏃‍♀️ Habit Tracking',
    description: 'Build lasting habits with ease',
    feature: {
      icon: '🏃‍♀️',
      benefits: [
        'Streak visualization',
        'Flexible scheduling',
        'Habit stacking',
        'Progress analytics'
      ],
    },
  },
  {
    key: '9',
    type: 'feature',
    title: '⏲️ Pomodoro Timer',
    description: 'Stay focused and productive',
    feature: {
      icon: '⏲️',
      benefits: [
        'Customizable intervals',
        'Break reminders',
        'Session statistics',
        'Focus insights'
      ],
    },
  },
  {
    key: '10',
    type: 'account-choice',
    title: '🚀 Ready to get started?',
    description: 'Choose how you\'d like to use Growmoji',
  },
];

export default function OnboardingScreen() {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const router = useRouter();
  const { enableAnonymousMode } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const flatListRef = useRef<FlatList>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const markOnboardingAsSeen = async () => {
    try {
      console.log('[OnboardingScreen] Saving onboarding status to AsyncStorage');
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      console.log('[OnboardingScreen] Successfully saved onboarding status to AsyncStorage');
      
      // Verify the save was successful
      const saved = await AsyncStorage.getItem('hasSeenOnboarding');
      console.log('[OnboardingScreen] Verification - hasSeenOnboarding value:', saved);
      
      if (saved !== 'true') {
        console.warn('[OnboardingScreen] Warning: AsyncStorage verification failed, but continuing anyway');
      }
    } catch (error) {
      console.error('[OnboardingScreen] Error saving onboarding status:', error);
      // Don't throw - just log the error and continue
    }
  };

  const handleNext = () => {
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (currentIndex < onboardingSlides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // On last slide, this shouldn't be called since account-choice has its own buttons
      handleCreateAccount();
    }
  };

  const handleQuizAnswer = (slideKey: string, optionId: string) => {
    setSelectedAnswers(prev => ({ ...prev, [slideKey]: optionId }));
    
    // Auto-advance after a short delay for quiz questions
    setTimeout(() => {
      handleNext();
    }, 800);
  };

  const handleCreateAccount = async () => {
    if (isCompleting) {
      console.log('[OnboardingScreen] Already completing, ignoring duplicate call');
      return;
    }

    try {
      setIsCompleting(true);
      console.log('[OnboardingScreen] Starting account creation process...');
      await markOnboardingAsSeen();
      console.log('[OnboardingScreen] Onboarding marked as seen, navigating to login');
      
      // Small delay to ensure AsyncStorage write is completed
      setTimeout(() => {
        console.log('[OnboardingScreen] Navigating to login screen');
        router.replace('/(auth)/login');
      }, 150);
    } catch (error) {
      console.error('[OnboardingScreen] Error completing onboarding:', error);
      // Still navigate even if there's an error to prevent getting stuck
      router.replace('/(auth)/login');
    }
  };

  const handleContinueAnonymous = async () => {
    if (isCompleting) {
      console.log('[OnboardingScreen] Already completing, ignoring duplicate call');
      return;
    }

    try {
      setIsCompleting(true);
      console.log('[OnboardingScreen] Starting anonymous mode...');
      
      // Enable anonymous mode
      await enableAnonymousMode();
      await markOnboardingAsSeen();
      
      console.log('[OnboardingScreen] Anonymous mode enabled, navigating to main app');
      
      // Small delay to ensure everything is set up
      setTimeout(() => {
        console.log('[OnboardingScreen] Navigating to main app');
        router.replace('/(tabs)');
      }, 150);
    } catch (error) {
      console.error('[OnboardingScreen] Error enabling anonymous mode:', error);
      // Fallback to main app anyway
      router.replace('/(tabs)');
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const canProceed = () => {
    const currentSlide = onboardingSlides[currentIndex];
    if (currentSlide.type === 'quiz') {
      return selectedAnswers[currentSlide.key] !== undefined;
    }
    return true;
  };

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
    question: {
      fontSize: typography.fontSize.md,
      color: colors.secondary,
      textAlign: 'center',
      marginBottom: spacing.xl,
      fontStyle: 'italic',
    },
    optionsContainer: {
      width: '100%',
      maxWidth: 300,
    },
    option: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 2,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
    },
    selectedOption: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '20',
    },
    optionEmoji: {
      fontSize: 24,
      marginRight: spacing.md,
    },
    optionText: {
      fontSize: typography.fontSize.md,
      color: colors.text,
      flex: 1,
    },
    featureContainer: {
      alignItems: 'center',
      width: '100%',
    },
    featureIcon: {
      fontSize: 64,
      marginBottom: spacing.lg,
    },
    benefitsList: {
      width: '100%',
      maxWidth: 280,
    },
    benefit: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    benefitIcon: {
      fontSize: 20,
      marginRight: spacing.md,
    },
    benefitText: {
      fontSize: typography.fontSize.md,
      color: colors.text,
      flex: 1,
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
    disabledButton: {
      backgroundColor: colors.border,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: typography.fontSize.md,
      fontWeight: '600',
    },
    accountChoiceButtons: {
      width: '100%',
      alignItems: 'center',
      marginTop: spacing.xl,
    },
    accountChoiceCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.md,
      width: '90%',
      borderWidth: 2,
      borderColor: colors.border,
    },
    accountChoiceTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
      textAlign: 'center',
    },
    accountChoiceDescription: {
      fontSize: typography.fontSize.md,
      color: colors.secondary,
      marginBottom: spacing.md,
      textAlign: 'center',
    },
    accountChoiceBenefits: {
      marginBottom: spacing.md,
    },
    accountChoiceBenefit: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    accountChoiceBenefitText: {
      fontSize: typography.fontSize.sm,
      color: colors.text,
      marginLeft: spacing.xs,
    },
    primaryChoiceButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
    },
    secondaryChoiceButton: {
      backgroundColor: 'transparent',
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
    },
    primaryChoiceButtonText: {
      color: '#FFFFFF',
      fontSize: typography.fontSize.md,
      fontWeight: '600',
    },
    secondaryChoiceButtonText: {
      color: colors.text,
      fontSize: typography.fontSize.md,
      fontWeight: '500',
    },
    paywallLeadButtons: {
      width: '100%',
      alignItems: 'center',
      marginTop: spacing.xl,
    },
    premiumButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      width: '85%',
      alignItems: 'center',
      marginBottom: spacing.md,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 6,
    },
    freeButton: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      width: '85%',
      alignItems: 'center',
    },
    premiumButtonText: {
      color: '#FFFFFF',
      fontSize: typography.fontSize.lg,
      fontWeight: '700',
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
      marginVertical: spacing.sm,
    },
    paginationContainer: {
      position: 'absolute',
      bottom: spacing.xxl + spacing.lg + 60,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    paginationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
      marginHorizontal: spacing.xs,
    },
    activeDot: {
      backgroundColor: colors.primary,
      width: 24,
      borderRadius: 4,
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingBottom: spacing.xl,
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
    },
    progressText: {
      position: 'absolute',
      top: spacing.xl,
      right: spacing.lg,
      fontSize: typography.fontSize.sm,
      color: colors.secondary,
    },
    skipButton: {
      position: 'absolute',
      top: spacing.xl,
      left: spacing.lg,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      backgroundColor: colors.card,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      opacity: 0.7,
    },
    skipButtonText: {
      fontSize: typography.fontSize.xs,
      color: colors.secondary,
      fontWeight: '500',
    },
  });

  const renderItem = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <TouchableOpacity style={styles.skipButton} onPress={handleCreateAccount} disabled={isCompleting}>
        <Text style={[styles.skipButtonText, isCompleting && { opacity: 0.5 }]}>
          {isCompleting ? 'Loading...' : 'Skip'}
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.progressText}>
        {currentIndex + 1} / {onboardingSlides.length}
      </Text>
      
      <Text style={styles.title}>{item.title}</Text>
      
      {item.description && (
        <Text style={styles.description}>{item.description}</Text>
      )}

      {item.type === 'quiz' && (
        <>
          <Text style={styles.question}>{item.question}</Text>
          <View style={styles.optionsContainer}>
            {item.options?.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.option,
                  selectedAnswers[item.key] === option.id && styles.selectedOption,
                ]}
                onPress={() => handleQuizAnswer(item.key, option.id)}
              >
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <Text style={styles.optionText}>{option.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {item.type === 'feature' && item.feature && (
        <View style={styles.featureContainer}>
          <Text style={styles.featureIcon}>{item.feature.icon}</Text>
          <View style={styles.benefitsList}>
            {item.feature.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefit}>
                <Text style={styles.benefitIcon}>✨</Text>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {item.type === 'account-choice' && (
        <View style={styles.accountChoiceButtons}>
          <TouchableOpacity 
            style={[styles.accountChoiceCard, isCompleting && { opacity: 0.7 }]} 
            onPress={handleCreateAccount}
            disabled={isCompleting}
          >
            <Text style={styles.accountChoiceTitle}>☁️ Create Account</Text>
            <Text style={styles.accountChoiceDescription}>Sync across devices & backup your data</Text>
            <View style={styles.accountChoiceBenefits}>
              <View style={styles.accountChoiceBenefit}>
                <Text>🔄</Text>
                <Text style={styles.accountChoiceBenefitText}>Data backup & sync</Text>
              </View>
              <View style={styles.accountChoiceBenefit}>
                <Text>📱</Text>
                <Text style={styles.accountChoiceBenefitText}>Access on multiple devices</Text>
              </View>
              <View style={styles.accountChoiceBenefit}>
                <Text>⭐</Text>
                <Text style={styles.accountChoiceBenefitText}>Premium features available</Text>
              </View>
            </View>
            <View style={styles.primaryChoiceButton}>
              <Text style={styles.primaryChoiceButtonText}>
                {isCompleting ? 'Setting up...' : 'Create Account'}
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.accountChoiceCard, isCompleting && { opacity: 0.7 }]} 
            onPress={handleContinueAnonymous}
            disabled={isCompleting}
          >
            <Text style={styles.accountChoiceTitle}>📱 Continue without Account</Text>
            <Text style={styles.accountChoiceDescription}>Use locally, create account later</Text>
            <View style={styles.accountChoiceBenefits}>
              <View style={styles.accountChoiceBenefit}>
                <Text>⚡</Text>
                <Text style={styles.accountChoiceBenefitText}>Start using immediately</Text>
              </View>
              <View style={styles.accountChoiceBenefit}>
                <Text>🔒</Text>
                <Text style={styles.accountChoiceBenefitText}>No registration required</Text>
              </View>
              <View style={styles.accountChoiceBenefit}>
                <Text>🔄</Text>
                <Text style={styles.accountChoiceBenefitText}>Upgrade to account anytime</Text>
              </View>
            </View>
            <View style={styles.secondaryChoiceButton}>
              <Text style={styles.secondaryChoiceButtonText}>
                {isCompleting ? 'Starting app...' : 'Continue Without Account'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {item.type === 'paywall-lead' && (
        <View style={styles.paywallLeadButtons}>
          <TouchableOpacity 
            style={[styles.premiumButton, isCompleting && { opacity: 0.7 }]} 
            onPress={handleCreateAccount}
            disabled={isCompleting}
          >
            <Text style={styles.premiumButtonText}>
              {isCompleting ? '🚀 Setting up your account...' : '🚀 Create Account & Unlock Premium'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.freeSubtext}>or</Text>
          <TouchableOpacity 
            style={[styles.freeButton, isCompleting && { opacity: 0.7 }]} 
            onPress={handleCreateAccount}
            disabled={isCompleting}
          >
            <Text style={styles.freeButtonText}>
              {isCompleting ? 'Continue with Basic...' : 'Continue with Basic (3 habits)'}
            </Text>
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
        scrollEnabled={false} // Disable manual scrolling for quiz flow
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
      
      {(currentIndex < onboardingSlides.length - 1 && 
        onboardingSlides[currentIndex].type !== 'quiz' && 
        onboardingSlides[currentIndex].type !== 'paywall-lead' &&
        onboardingSlides[currentIndex].type !== 'account-choice') && (
        <View style={styles.footer}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity 
              style={[styles.button, !canProceed() && styles.disabledButton]} 
              onPress={handleNext}
              disabled={!canProceed()}
            >
              <Text style={styles.buttonText}>
                {currentIndex === onboardingSlides.length - 2 ? 'Get Started' : 'Continue'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}


    </SafeAreaView>
  );
} 