import { useOAuth, useSignUp } from '@clerk/clerk-expo';
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
  View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function RegisterScreen() {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');

  const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startAppleOAuthFlow } = useOAuth({ strategy: 'oauth_apple' });

  const onSignUpPress = async () => {
    if (!isLoaded) {
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      setPendingVerification(true);
    } catch (err: any) {
      console.error("Clerk SignUp Error:", JSON.stringify(err, null, 2));
      const errorMessage = err.errors && err.errors[0] && err.errors[0].longMessage 
                         ? err.errors[0].longMessage 
                         : "An unexpected error occurred during sign up. Please try again.";
      Alert.alert("Registration Error", errorMessage);
    }
  };

  const handleSocialSignUp = React.useCallback(async (strategy: 'oauth_google' | 'oauth_apple') => {
    if (!isLoaded) {
      return;
    }

    const oauthFlowFunction = strategy === 'oauth_google' ? startGoogleOAuthFlow : startAppleOAuthFlow;

    try {
      const { createdSessionId, setActive: setOAuthActive, signUp: oauthSignUp, signIn: oauthSignIn } = await oauthFlowFunction();

      if (createdSessionId && setOAuthActive) {
        await setOAuthActive({ session: createdSessionId });
        router.replace('/');
      } else {
        console.warn("OAuth flow did not complete fully or did not create/activate a session directly.", { oauthSignUp, oauthSignIn });
        Alert.alert(
          "OAuth Action Needed",
          "The sign-up/sign-in process may require additional steps or information. Please try email/password or check your details."
        );
      }
    } catch (err: any) {
      console.error(`OAuth error (${strategy}):`, JSON.stringify(err, null, 2));
      const errorMessage = err.errors?.[0]?.longMessage || err.message || "An unexpected error occurred during social sign-up.";
      Alert.alert("Registration Error", errorMessage);
    }
  }, [isLoaded, startGoogleOAuthFlow, startAppleOAuthFlow, router, setActive]);

  const onVerifyPress = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace('/');
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
        Alert.alert("Verification Error", "Could not complete verification. Please check the code and try again.");
      }
    } catch (err: any) {
      console.error("Clerk Verification Error:", JSON.stringify(err, null, 2));
       const errorMessage = err.errors && err.errors[0] && err.errors[0].longMessage 
                         ? err.errors[0].longMessage 
                         : "An unexpected error occurred during verification. Please try again.";
      Alert.alert("Verification Error", errorMessage);
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
              editable={isLoaded}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.border}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={isLoaded}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor={colors.border}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={isLoaded}
            />
            <TouchableOpacity style={styles.button} onPress={onSignUpPress} disabled={!isLoaded}>
              <Text style={styles.buttonText}>{!isLoaded ? 'Loading...' : 'Create Account'}</Text>
            </TouchableOpacity>

            <View style={styles.socialLoginContainer}>
              <View style={styles.socialLoginSeparator}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>Or sign up with</Text>
                <View style={styles.separatorLine} />
              </View>

              <TouchableOpacity 
                onPress={() => handleSocialSignUp('oauth_google')} 
                style={styles.socialButton} 
                disabled={!isLoaded}
              >
                <Text style={styles.socialButtonText}>Sign Up with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => handleSocialSignUp('oauth_apple')} 
                style={styles.socialButton} 
                disabled={!isLoaded}
              >
                <Text style={styles.socialButtonText}>Sign Up with Apple</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <Link href="/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>Login</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </>
        )}

        {pendingVerification && (
          <>
            <Text style={styles.title}>Verify Your Email</Text>
            <TextInput
              value={code}
              style={styles.input}
              placeholder="Verification Code"
              placeholderTextColor={colors.border}
              onChangeText={(code) => setCode(code)}
              keyboardType="number-pad"
              editable={isLoaded}
            />
            <TouchableOpacity style={styles.button} onPress={onVerifyPress} disabled={!isLoaded}>
              <Text style={styles.buttonText}>{!isLoaded ? 'Loading...' : 'Verify Email'}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
} 