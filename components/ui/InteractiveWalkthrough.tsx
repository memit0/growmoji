import { useTheme } from '@/contexts/ThemeContext';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  targetElement?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  position: 'top' | 'bottom' | 'center';
  action?: string; // Action hint for the user
}

interface InteractiveWalkthroughProps {
  visible: boolean;
  onClose: () => void;
  onStepChange?: (stepIndex: number) => void;
}

const walkthroughSteps: WalkthroughStep[] = [
  {
    id: 'welcome',
    title: '👋 Welcome to Your Productivity Hub!',
    description: 'Let\'s take a quick tour to get you started with tasks and habits.',
    position: 'center',
  },
  {
    id: 'daily-tasks',
    title: '📋 Daily Tasks Section',
    description: 'Here you can add up to 3 daily tasks. Type in the input field and tap "Add" to create a new task.',
    position: 'top',
    action: 'Try adding your first task!',
  },
  {
    id: 'task-actions',
    title: '✅ Task Actions',
    description: 'Tap a task to mark it complete, or swipe right on a task to delete it.',
    position: 'top',
    action: 'Try tapping a task to mark it done!',
  },
  {
    id: 'habits-section',
    title: '🏃‍♀️ Habits Section',
    description: 'Build lasting habits here! Track up to 3 habits (or unlimited with premium).',
    position: 'top',
    action: 'Tap "New Habit" to create your first habit!',
  },
  {
    id: 'habit-creation',
    title: '✨ Creating Habits',
    description: 'Choose an emoji that represents your habit. This makes tracking more fun and visual!',
    position: 'center',
  },
  {
    id: 'streak-system',
    title: '🔥 Streak System',
    description: 'When you tap a habit, it logs it for today and increases your streak. Consistency is key to building lasting habits!',
    position: 'bottom',
  },
  {
    id: 'habit-actions',
    title: '📊 Habit Management',
    description: 'Tap the habit emoji to log today\'s completion. Swipe right on a habit to remove it if you no longer want to track it.',
    position: 'bottom',
    action: 'Try logging a habit!',
  },
  {
    id: 'limits-premium',
    title: '⭐ Premium Features',
    description: 'Free users can track 3 tasks and 3 habits. Upgrade to premium for unlimited tracking and additional features!',
    position: 'center',
  },
  {
    id: 'completion',
    title: '🎉 You\'re All Set!',
    description: 'You now know the basics! Start building better habits and staying productive. Happy tracking!',
    position: 'center',
  },
];

export const InteractiveWalkthrough: React.FC<InteractiveWalkthroughProps> = ({
  visible,
  onClose,
  onStepChange,
}) => {
  const { colors } = useTheme();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const currentStep = walkthroughSteps[currentStepIndex];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [visible, currentStepIndex]);

  useEffect(() => {
    onStepChange?.(currentStepIndex);
  }, [currentStepIndex, onStepChange]);

  const handleNext = () => {
    if (currentStepIndex < walkthroughSteps.length - 1) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentStepIndex(0);
      onClose();
    });
  };

  const renderHighlight = () => {
    if (!currentStep.targetElement) return null;

    const { x, y, width, height } = currentStep.targetElement;
    const highlightStyle = {
      position: 'absolute' as const,
      left: x - 8,
      top: y - 8,
      width: width + 16,
      height: height + 16,
      borderRadius: 12,
      borderWidth: 3,
      borderColor: colors.primary,
      backgroundColor: 'transparent',
    };

    return <View style={highlightStyle} />;
  };

  const getTooltipPosition = () => {
    let tooltipStyle: any = {
      position: 'absolute',
      left: 20,
      right: 20,
      maxWidth: width - 40,
    };

    switch (currentStep.position) {
      case 'top':
        tooltipStyle.top = 100;
        break;
      case 'bottom':
        tooltipStyle.bottom = 120;
        break;
      case 'center':
      default:
        tooltipStyle.top = height / 2 - 150;
        break;
    }

    return tooltipStyle;
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <SafeAreaView style={styles.overlay}>
        <StatusBar backgroundColor="rgba(0, 0, 0, 0.7)" barStyle="light-content" />
        
        {/* Overlay background */}
        <Animated.View
          style={[
            styles.background,
            {
              opacity: fadeAnim,
            },
          ]}
        />

        {/* Highlight target element */}
        {renderHighlight()}

        {/* Tooltip */}
        <Animated.View
          style={[
            styles.tooltip,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
            getTooltipPosition(),
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            {currentStep.title}
          </Text>
          <Text style={[styles.description, { color: colors.secondary }]}>
            {currentStep.description}
          </Text>
          
          {currentStep.action && (
            <View style={[styles.actionContainer, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.actionText, { color: colors.primary }]}>
                💡 {currentStep.action}
              </Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.border }]}
              onPress={handleClose}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.secondary }]}>
                Skip Tour
              </Text>
            </TouchableOpacity>

            <View style={styles.navigationContainer}>
              {currentStepIndex > 0 && (
                <TouchableOpacity
                  style={[styles.navButton, { backgroundColor: colors.border }]}
                  onPress={handlePrevious}
                >
                  <Text style={[styles.navButtonText, { color: colors.text }]}>
                    Previous
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                onPress={handleNext}
              >
                <Text style={styles.primaryButtonText}>
                  {currentStepIndex === walkthroughSteps.length - 1 ? 'Get Started!' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            {walkthroughSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: index <= currentStepIndex ? colors.primary : colors.border,
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    position: 'relative',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  tooltip: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  actionContainer: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 16,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginLeft: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    alignSelf: 'center',
    marginBottom: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  navButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
}); 