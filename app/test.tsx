import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TestScreen() {
  const router = useRouter();

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('hasSeenOnboarding');
      Alert.alert(
        "Onboarding Reset",
        "Onboarding flag has been reset. The onboarding will show again for new/logged out users.",
        [
          {
            text: "Go to Onboarding",
            onPress: () => router.push('/onboarding')
          },
          {
            text: "OK",
            style: "cancel"
          }
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to reset onboarding flag");
      console.error('Error resetting onboarding:', error);
    }
  };

  const resetWalkthrough = async () => {
    try {
      // Get all AsyncStorage keys and remove any walkthrough keys
      const keys = await AsyncStorage.getAllKeys();
      const walkthroughKeys = keys.filter(key => key.includes('app_walkthrough_seen_'));
      if (walkthroughKeys.length > 0) {
        await AsyncStorage.multiRemove(walkthroughKeys);
      }
      Alert.alert(
        "App Walkthrough Reset",
        "App walkthrough flags have been reset. The walkthrough will show again for all users on the main screen.",
        [
          {
            text: "Go to Home",
            onPress: () => router.push('/(tabs)')
          },
          {
            text: "OK",
            style: "cancel"
          }
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to reset walkthrough flags");
      console.error('Error resetting walkthrough:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Utilities</Text>
      <TouchableOpacity style={styles.button} onPress={resetOnboarding}>
        <Text style={styles.buttonText}>🔄 Reset Onboarding Flag</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={resetWalkthrough}>
        <Text style={styles.buttonText}>🔄 Reset App Walkthrough</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    minWidth: 200,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
