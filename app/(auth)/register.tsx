import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
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
  const { colors, spacing, typography, borderRadius } = useTheme();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

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
          // User is automatically signed in
          router.replace('/');
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
    console.log(`[RegisterScreen] handleSocialSignUp: Starting ${provider} sign-up flow`);
    console.log(`[RegisterScreen] handleSocialSignUp: Current state:`, {
      isLoading,
      isNavigating,
      timestamp: new Date().toISOString()
    });

    if (isLoading) {
      console.log(`[RegisterScreen] handleSocialSignUp: Skipping ${provider} - already loading`);
      return;
    }

    setIsLoading(true);
    console.log(`[RegisterScreen] handleSocialSignUp: Set loading state for ${provider}`);

    try {
      console.log(`[RegisterScreen] handleSocialSignUp: Calling AuthService.signInWithOAuth for ${provider}`);
      const { success, data, error } = await AuthService.signInWithOAuth(provider);

      console.log(`[RegisterScreen] handleSocialSignUp: AuthService response for ${provider}:`, {
        success,
        hasData: !!data,
        hasError: !!error,
        dataKeys: data ? Object.keys(data) : [],
        errorMessage: error?.message
      });

      if (!success || error) {
        console.error(`[RegisterScreen] handleSocialSignUp: ${provider} sign-up failed:`, {
          success,
          error: error?.message || 'Unknown error',
          fullError: error
        });
        throw error || new Error('Social sign-up failed');
      }

      console.log(`[RegisterScreen] handleSocialSignUp: ${provider} sign-up initiated successfully`);

      // OAuth will handle the redirect. If data.url exists, it's the URL to open.
      if (data?.url) {
        console.log(`[RegisterScreen] handleSocialSignUp: OAuth redirect URL received for ${provider}:`, data.url);
      } else {
        console.warn(`[RegisterScreen] handleSocialSignUp: No redirect URL in response for ${provider}`);
      }

    } catch (err: any) {
      console.error(`[RegisterScreen] handleSocialSignUp: Exception during ${provider} sign-up:`, {
        name: err.name,
        message: err.message,
        stack: err.stack,
        fullError: err
      });

      const errorMessage = err.message || "An unexpected error occurred during social sign-up.";
      console.error(`[RegisterScreen] handleSocialSignUp: Showing error alert for ${provider}:`, errorMessage);
      Alert.alert("Registration Error", errorMessage);
    } finally {
      console.log(`[RegisterScreen] handleSocialSignUp: Cleaning up loading state for ${provider}`);
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
    socialButton: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: 'center',
      marginTop: spacing.md,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    socialButtonText: {
      color: colors.primary,
      fontSize: typography.fontSize.md,
      fontWeight: 'bold',
    },
  });

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
            <TouchableOpacity style={styles.button} onPress={onSignUpPress} disabled={isLoading}>
              <Text style={styles.buttonText}>{isLoading ? 'Loading...' : 'Create Account'}</Text>
            </TouchableOpacity>

            <View style={styles.socialLoginContainer}>
              <View style={styles.socialLoginSeparator}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>Or sign up with</Text>
                <View style={styles.separatorLine} />
              </View>

              <TouchableOpacity
                onPress={() => handleSocialSignUp('google')}
                style={styles.socialButton}
                disabled={isLoading}
              >
                <Text style={styles.socialButtonText}>Sign Up with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSocialSignUp('apple')}
                style={styles.socialButton}
                disabled={isLoading}
              >
                <Text style={styles.socialButtonText}>Sign Up with Apple</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={handleNavigateToLogin} disabled={isNavigating || isLoading}>
                <Text style={[styles.footerLink, (isNavigating || isLoading) && { opacity: 0.5 }]}>Login</Text>
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
                <Text style={[styles.footerLink, (isNavigating || isLoading) && { opacity: 0.5 }]}>Login</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}