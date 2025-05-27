import { SplashScreen, Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarBackground: TabBarBackground,
                tabBarStyle: Platform.select({
                    ios: {
                        // Use a transparent background on iOS to show the blur effect
                        position: 'absolute',
                    },
                    default: {},
            }),
        }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Camera',
                    tabBarIcon: ({ color }) => <MaterialIcons name="photo-camera-front" size={28} color={Colors[colorScheme ?? 'light'].tint} />,
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: 'History',
                    tabBarIcon: ({ color }) => <MaterialIcons size={28} name="lock-clock" color={color} />,
                }}
            />
            <Tabs.Screen
                name="conditions"
                options={{
                    title: 'Conditions',
                    tabBarIcon: ({ color }) => <MaterialIcons size={28} name="medical-services" color={color} />,
                }}
            />
            <Tabs.Screen
                name="doctors"
                options={{
                    title: 'Doctors',
                    tabBarIcon: ({ color }) => <MaterialIcons size={28} name="person" color={color} />,
                }}
            />
        </Tabs>
    );
}
