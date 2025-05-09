import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
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
import { supabase } from '../../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Login Error", error.message);
    }
    // Navigation is handled by the effect in _layout.tsx
    setLoading(false);
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    console.log(`[Social Login] Attempting ${provider} login`);
    setLoading(true);
    console.log('[Social Login] setLoading(true)');
    try {
      if (provider === 'apple') {
        console.log('[Apple Sign-In] Attempting AppleAuthentication.signInAsync in login.tsx');
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });
        console.log('[Apple Sign-In] signInAsync successful in login.tsx. Credential:', credential);
        if (credential.identityToken) {
          console.log('[Apple Sign-In] Got identityToken in login.tsx. Calling supabase.auth.signInWithIdToken.');
          const { error: signInError, data: signInData } = await supabase.auth.signInWithIdToken({
            provider: 'apple',
            token: credential.identityToken,
          });
          console.log('[Apple Sign-In] Supabase signInWithIdToken response in login.tsx. Error:', signInError, 'Data:', signInData);
          if (signInError) {
            Alert.alert('Error with Apple Sign-In', signInError.message);
            console.error('[Apple Sign-In] Supabase signInWithIdToken error in login.tsx:', signInError.message);
          }
          // Navigation handled by _layout.tsx
        } else {
          Alert.alert('Error with Apple Sign-In', 'No identity token received from Apple.');
          console.error('[Apple Sign-In] No identity token received from Apple in login.tsx.', credential);
        }
      } else { // For Google or other OAuth providers
        console.log('[Social Login] Calling supabase.auth.signInWithOAuth...');
        const redirectTo = 'habittracker://callback'; // Define it once
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: provider,
          options: {
            redirectTo: redirectTo
          },
        });

        console.log('[Social Login] signInWithOAuth response:');
        console.log('[Social Login] Data:', data);
        console.log('[Social Login] Error:', error);

        if (error) {
          Alert.alert(`Error with ${provider} login`, error.message);
          console.error(`[Social Login] ${provider} login error:`, error.message);
        }
        if (data && data.url) {
          console.log('[Social Login] Supabase returned a URL for Google:', data.url);
          // Explicitly pass the redirect URI to openAuthSessionAsync
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
          console.log('[Social Login] WebBrowser.openAuthSessionAsync result:', result);
          // Supabase's onAuthStateChange listener should handle the session
          // once the app receives the redirect with the token/code.
        }
      }
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        console.log('[Apple Sign-In] User cancelled Apple Sign-In.');
        // Handle user cancellation (e.g., do nothing or show a message)
      } else {
        console.error('[Social Login] Unexpected error in handleSocialLogin:', e);
        console.error('[Social Login] Full error object (login):', JSON.stringify(e, null, 2));
        Alert.alert('Login Error', 'An unexpected error occurred during social login.');
      }
    } finally {
      setLoading(false);
      console.log('[Social Login] setLoading(false)');
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
      opacity: loading ? 0.7 : 1,
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
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing.xl,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      color: colors.text,
      marginHorizontal: spacing.md,
      fontSize: typography.fontSize.sm,
    },
    socialButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      opacity: loading ? 0.7 : 1,
    },
    socialButtonText: {
      color: colors.text,
      fontSize: typography.fontSize.md,
      marginLeft: spacing.sm,
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
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.border}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.border}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity 
          style={styles.socialButton}
          onPress={() => handleSocialLogin('google')}
          disabled={loading}
        >
          <Ionicons name="logo-google" size={24} color={colors.text} />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.socialButton}
          onPress={() => handleSocialLogin('apple')}
          disabled={loading}
        >
          <Ionicons name="logo-apple" size={24} color={colors.text} />
          <Text style={styles.socialButtonText}>Continue with Apple</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
} 