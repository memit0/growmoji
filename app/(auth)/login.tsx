import { useOAuth, useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
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

export default function LoginScreen() {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');

  const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startAppleOAuthFlow } = useOAuth({ strategy: 'oauth_apple' });

  const onSignInPress = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/');
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
        Alert.alert("Login Error", "Please check your credentials or complete other steps if required.");
      }
    } catch (err: any) {
      console.error("Clerk SignIn Error:", JSON.stringify(err, null, 2));
      const errorMessage = err.errors && err.errors[0] && err.errors[0].message 
                         ? err.errors[0].message 
                         : "An unexpected error occurred. Please try again.";
      Alert.alert("Login Error", errorMessage);
    }
  };

  const handleSocialSignIn = React.useCallback(async (strategy: 'oauth_google' | 'oauth_apple') => {
    if (!isLoaded) {
      return;
    }

    const oauthFlowFunction = strategy === 'oauth_google' ? startGoogleOAuthFlow : startAppleOAuthFlow;

    try {
      const { createdSessionId, setActive: setOAuthActive, signIn: oauthSignIn, signUp: oauthSignUp } = await oauthFlowFunction();

      if (createdSessionId && setOAuthActive) {
        await setOAuthActive({ session: createdSessionId });
        router.replace('/');
      } else {
        console.warn("OAuth flow did not complete fully or did not create a session directly.", { oauthSignIn, oauthSignUp });
        Alert.alert(
          "OAuth Action Needed", 
          "The sign-in process may require additional steps. Please try email/password or check your details."
        );
      }
    } catch (err: any) {
      console.error(`OAuth error (${strategy}):`, JSON.stringify(err, null, 2));
      const errorMessage = err.errors?.[0]?.longMessage || err.message || "An unexpected error occurred during social sign-in.";
      Alert.alert("Login Error", errorMessage);
    }
  }, [isLoaded, startGoogleOAuthFlow, startAppleOAuthFlow, router, setActive]);

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
      opacity: !isLoaded ? 0.7 : 1,
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
          editable={isLoaded}
        />
        <TextInput
          value={password}
          style={styles.input}
          placeholder="Enter password"
          placeholderTextColor={colors.border}
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
          editable={isLoaded}
        />
        <TouchableOpacity onPress={onSignInPress} style={styles.button} disabled={!isLoaded}>
          <Text style={styles.buttonText}>{!isLoaded ? 'Loading...' : 'Login'}</Text>
        </TouchableOpacity>

        <View style={styles.socialLoginContainer}>
          <View style={styles.socialLoginSeparator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>Or continue with</Text>
            <View style={styles.separatorLine} />
          </View>

          <TouchableOpacity 
            onPress={() => handleSocialSignIn('oauth_google')} 
            style={styles.socialButton} 
            disabled={!isLoaded}
          >
            <Text style={styles.socialButtonText}>Sign In with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => handleSocialSignIn('oauth_apple')} 
            style={styles.socialButton} 
            disabled={!isLoaded}
          >
            <Text style={styles.socialButtonText}>Sign In with Apple</Text>
          </TouchableOpacity>
        </View>

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