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
  View
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { AuthService } from '../../lib/auth/AuthService';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isAppleSignInAvailable, setIsAppleSignInAvailable] = useState(false);

  // Check Apple Sign-In availability on component mount
  useEffect(() => {
    AuthService.isAppleSignInAvailable().then(setIsAppleSignInAvailable);
  }, []);

  const handleNavigateToRegister = () => {
    if (isNavigating || isLoading) return;
    setIsNavigating(true);
    router.push('/(auth)/register');
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

  const onSignInPress = async () => {
    if (isLoading) {
      return;
    }

    if (!emailAddress || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailAddress,
        password: password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        router.replace('/');
      }
    } catch (err: any) {
      console.error("Supabase SignIn Error:", err);
      const errorMessage = err.message || "An unexpected error occurred. Please try again.";
      Alert.alert("Login Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = React.useCallback(async (provider: 'google' | 'apple') => {
    console.log(`[LoginScreen] handleSocialSignIn: Starting ${provider} sign-in flow`);
    console.log(`[LoginScreen] handleSocialSignIn: Current state:`, {
      isLoading,
      isNavigating,
      timestamp: new Date().toISOString()
    });

    if (isLoading) {
      console.log(`[LoginScreen] handleSocialSignIn: Skipping ${provider} - already loading`);
      return;
    }

    setIsLoading(true);
    console.log(`[LoginScreen] handleSocialSignIn: Set loading state for ${provider}`);

    try {
      console.log(`[LoginScreen] handleSocialSignIn: Calling AuthService.signInWithOAuth for ${provider}`);
      const { success, data, error } = await AuthService.signInWithOAuth(provider);

      console.log(`[LoginScreen] handleSocialSignIn: AuthService response for ${provider}:`, {
        success,
        hasData: !!data,
        hasError: !!error,
        dataKeys: data ? Object.keys(data) : [],
        errorMessage: error?.message
      });

      if (!success || error) {
        console.error(`[LoginScreen] handleSocialSignIn: ${provider} sign-in failed:`, {
          success,
          error: error?.message || 'Unknown error',
          fullError: error
        });
        throw error || new Error('Social sign-in failed');
      }

      console.log(`[LoginScreen] handleSocialSignIn: ${provider} sign-in initiated successfully`);

      // OAuth will handle the redirect. If data.url exists, it's the URL to open.
      if (data && 'url' in data && data.url) {
        console.log(`[LoginScreen] handleSocialSignIn: OAuth redirect URL received for ${provider}:`, data.url);
      } else if (data && 'user' in data && data.user) {
        console.log(`[LoginScreen] handleSocialSignIn: User signed in directly for ${provider}:`, data.user.id);
        // For native sign-in, user is already authenticated, navigate to home
        router.replace('/');
      } else {
        console.warn(`[LoginScreen] handleSocialSignIn: No redirect URL or user in response for ${provider}`);
      }

    } catch (err: any) {
      console.error(`[LoginScreen] handleSocialSignIn: Exception during ${provider} sign-in:`, {
        name: err.name,
        message: err.message,
        stack: err.stack,
        fullError: err
      });

      const errorMessage = err.message || "An unexpected error occurred during social sign-in.";
      console.error(`[LoginScreen] handleSocialSignIn: Showing error alert for ${provider}:`, errorMessage);
      Alert.alert("Login Error", errorMessage);
    } finally {
      console.log(`[LoginScreen] handleSocialSignIn: Cleaning up loading state for ${provider}`);
      setIsLoading(false);
    }
  }, [isLoading, router]);

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
        <Text style={styles.title}>Welcome Back</Text>

        <TextInput
          autoCapitalize="none"
          value={emailAddress}
          style={styles.input}
          placeholder="Enter email"
          placeholderTextColor={colors.border}
          onChangeText={(email) => setEmailAddress(email)}
          editable={!isLoading}
        />
        <TextInput
          value={password}
          style={styles.input}
          placeholder="Enter password"
          placeholderTextColor={colors.border}
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
          editable={!isLoading}
        />
        <TouchableOpacity onPress={onSignInPress} style={styles.button} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? 'Loading...' : 'Login'}</Text>
        </TouchableOpacity>

        <View style={styles.socialLoginContainer}>
          <View style={styles.socialLoginSeparator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>Or continue with</Text>
            <View style={styles.separatorLine} />
          </View>

          <TouchableOpacity
            onPress={() => handleSocialSignIn('google')}
            style={styles.socialButton}
            disabled={isLoading}
          >
            <Text style={styles.socialButtonText}>Sign In with Google</Text>
          </TouchableOpacity>

          {isAppleSignInAvailable && (
            <TouchableOpacity
              onPress={() => handleSocialSignIn('apple')}
              style={styles.socialButton}
              disabled={isLoading}
            >
              <Text style={styles.socialButtonText}>Sign In with Apple</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={handleNavigateToRegister} disabled={isNavigating || isLoading}>
            <Text style={[styles.footerLink, (isNavigating || isLoading) && { opacity: 0.5 }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}