import { Ionicons } from '@expo/vector-icons';
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
import { ProfileModal } from '../components/ProfileModal';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

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
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        // For native apps, you might need to specify a redirectTo URL
        // if your OAuth flow requires it, or handle deep linking.
        // redirectTo: 'YOUR_APP_DEEP_LINK_CALLBACK_URL' 
        // For Expo Go, WebBrowser.maybeCompleteAuthSession() should handle it.
      },
    });

    if (error) {
      Alert.alert(`Error with ${provider} login`, error.message);
    } 
    // if (data.url) { WebBrowser.openAuthSessionAsync(data.url) } // Might be needed for some flows
    setLoading(false);
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
    profileButton: {
      position: 'absolute',
      top: spacing.lg,
      right: spacing.lg,
      zIndex: 1,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => setIsProfileModalVisible(true)}
      >
        <Ionicons name="person-circle-outline" size={32} color={colors.text} />
      </TouchableOpacity>

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

      <ProfileModal
        isVisible={isProfileModalVisible}
        onClose={() => setIsProfileModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
} 