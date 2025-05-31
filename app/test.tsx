import { UserSubscriptionTester } from '@/components/ui/UserSubscriptionTester';
import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import { SafeAreaView } from 'react-native';

export default function TestScreen() {
    const { colors } = useTheme();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <UserSubscriptionTester />
        </SafeAreaView>
    );
}
