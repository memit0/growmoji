import { AntDesign } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Linking,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { AuthService } from '../../lib/auth/AuthService';
import { supabase } from '../../lib/supabase';

export default function RegisterScreen() {
  const { colors, spacing, typography, borderRadius, isDark } = useTheme();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isAppleSignInAvailable, setIsAppleSignInAvailable] = useState(false);
  const [isGoogleSignInAvailable, setIsGoogleSignInAvailable] = useState(false);

  // Check Apple and Google Sign-In availability on component mount
  useEffect(() => {
    AuthService.isAppleSignInAvailable().then(setIsAppleSignInAvailable);
    AuthService.isGoogleSignInAvailable().then(setIsGoogleSignInAvailable);
  }, []);

  const handleNavigateToLogin = () => {
    if (isNavigating || isLoading) return;
    setIsNavigating(true);
    router.push('/(auth)/login');
    // Reset after a short delay to prevent rapid navigation
    setTimeout(() => setIsNavigating(false), 500);
  };

  // Cleanup navigation state on unmount
  useEffect(() => {
    return () => {
      setIsNavigating(false);
      setIsLoading(false);
    };
  }, []);

  // Reset navigation state when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setIsNavigating(false);
    }, [])
  );

  const onSignUpPress = async () => {
    if (isLoading) {
      return;
    }

    if (!emailAddress || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: emailAddress,
        password: password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Check if email confirmation is required
        if (!data.session) {
          setPendingVerification(true);
          Alert.alert(
            "Check your email",
            "We've sent you a confirmation link. Please check your email and click the link to verify your account."
          );
        } else {
          // User is automatically signed in - redirect to main app
          router.replace('/(tabs)');
        }
      }
    } catch (err: any) {
      console.error("Supabase SignUp Error:", err);
      const errorMessage = err.message || "An unexpected error occurred during sign up. Please try again.";
      Alert.alert("Registration Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = React.useCallback(async (provider: 'google' | 'apple') => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const { success, data, error } = await AuthService.signInWithOAuth(provider);

      if (!success || error) {
        throw error || new Error('Social sign-up failed');
      }

      // OAuth will handle the redirect. If data.url exists, it's the URL to open.
      if (data && 'url' in data && data.url) {
      } else if (data && 'user' in data && data.user) {
        // For native sign-in, user is already authenticated, navigate to main app
        router.replace('/(tabs)');
      } else {
      }

    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred during social sign-up.";
      Alert.alert("Registration Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, router]);

  const resendConfirmation = async () => {
    if (!emailAddress) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailAddress,
      });

      if (error) {
        throw error;
      }

      Alert.alert("Success", "Confirmation email sent! Please check your inbox.");
    } catch (err: any) {
      console.error("Resend confirmation error:", err);
      Alert.alert("Error", err.message || "Failed to resend confirmation email");
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.lg,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
    },
    title: {
      fontSize: typography.fontSize.xxxl,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: spacing.xl,
      textAlign: 'center',
    },
    input: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      color: colors.text,
      fontSize: typography.fontSize.md,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: 'center',
      marginTop: spacing.md,
      opacity: isLoading ? 0.7 : 1,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: typography.fontSize.md,
      fontWeight: 'bold',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: spacing.xl,
    },
    footerText: {
      color: colors.text,
      marginHorizontal: spacing.xs,
      fontSize: typography.fontSize.sm,
    },
    footerLink: {
      color: colors.primary,
      marginLeft: spacing.xs,
      fontSize: typography.fontSize.sm,
    },
    socialLoginContainer: {
      marginTop: spacing.lg,
      marginBottom: spacing.md,
    },
    socialLoginSeparator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing.lg,
    },
    separatorLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    separatorText: {
      color: colors.border,
      marginHorizontal: spacing.sm,
      fontSize: typography.fontSize.sm,
    },
    // Apple Sign in with Apple button - theme-aware following Apple's design guidelines
    appleSignInButton: {
      backgroundColor: isDark ? '#FFFFFF' : '#000000', // White in dark mode, black in light mode (inverse)
      borderRadius: 8, // Apple's recommended corner radius
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      marginTop: spacing.md,
      minHeight: 44, // Apple's minimum touch target
      borderWidth: isDark ? 1 : 0, // Add border in dark mode for contrast
      borderColor: isDark ? colors.border : 'transparent',
      shadowColor: isDark ? colors.text : '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    appleSignInButtonText: {
      color: isDark ? '#000000' : '#FFFFFF', // Black in dark mode, white in light mode (inverse)
      fontSize: 16, // Apple's recommended font size
      fontWeight: '600', // Semi-bold as per Apple guidelines
      marginLeft: 8, // Space between logo and text
      letterSpacing: -0.32, // Apple's system font letter spacing
    },
    // Google button - theme-aware while maintaining Google branding
    googleSignInButton: {
      backgroundColor: isDark ? colors.card : '#FFFFFF',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      marginTop: spacing.md,
      minHeight: 44,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#DADCE0', // Adapt border color to theme
      shadowColor: isDark ? '#000' : colors.text,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    googleSignInButtonText: {
      color: isDark ? colors.text : '#3C4043', // Use theme text color in dark mode
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
      letterSpacing: -0.32,
    },
    socialButtonDisabled: {
      opacity: 0.6,
    },
    termsContainer: {
      marginTop: spacing.lg,
      alignItems: 'center',
    },
    termsText: {
      color: colors.text,
      opacity: 0.7,
      fontSize: typography.fontSize.xs,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    linkText: {
      color: colors.primary,
      fontWeight: 'bold',
      fontSize: typography.fontSize.sm,
    },
  });

  const openTerms = () => {
    // Replace with your actual terms and conditions URL
    Linking.openURL('https://example.com/terms');
  };

  const openPrivacyPolicy = () => {
    // Replace with your actual privacy policy URL
    Linking.openURL('https://example.com/privacy');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {!pendingVerification && (
          <>
            <Text style={styles.title}>Create Account</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.border}
              value={emailAddress}
              onChangeText={setEmailAddress}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.border}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor={colors.border}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!isLoading}
            />
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By registering, you agree to our{' '}
                <Text style={styles.linkText} onPress={openTerms}>
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text style={styles.linkText} onPress={openPrivacyPolicy}>
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={onSignUpPress} disabled={isLoading}>
              <Text style={styles.buttonText}>{isLoading ? 'Loading...' : 'Create Account'}</Text>
            </TouchableOpacity>

            <View style={styles.socialLoginContainer}>
              <View style={styles.socialLoginSeparator}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>Or sign up with</Text>
                <View style={styles.separatorLine} />
              </View>

              {isGoogleSignInAvailable && (
                <TouchableOpacity
                  onPress={() => handleSocialSignUp('google')}
                  style={[styles.googleSignInButton, isLoading && styles.socialButtonDisabled]}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <AntDesign name="google" size={18} color="#4285F4" />
                  <Text style={styles.googleSignInButtonText}>Continue with Google</Text>
                </TouchableOpacity>
              )}

              {isAppleSignInAvailable && (
                <TouchableOpacity
                  onPress={() => handleSocialSignUp('apple')}
                  style={[styles.appleSignInButton, isLoading && styles.socialButtonDisabled]}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <AntDesign name="apple1" size={18} color={isDark ? "#000000" : "#FFFFFF"} />
                  <Text style={styles.appleSignInButtonText}>Continue with Apple</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={handleNavigateToLogin} disabled={isNavigating || isLoading}>
                <Text style={styles.linkText}>Login</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {pendingVerification && (
          <>
            <Text style={styles.title}>Check Your Email</Text>
            <Text style={[styles.footerText, { textAlign: 'center', marginBottom: spacing.lg }]}>
              We've sent a confirmation link to {emailAddress}. Please check your email and click the link to verify your account.
            </Text>

            <TouchableOpacity style={styles.button} onPress={resendConfirmation} disabled={isLoading}>
              <Text style={styles.buttonText}>{isLoading ? 'Sending...' : 'Resend Confirmation Email'}</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already verified?</Text>
              <TouchableOpacity onPress={handleNavigateToLogin} disabled={isNavigating || isLoading}>
                <Text style={styles.linkText}>Login</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}