/**
 * File Name: _layout.tsx
 * Description: Root layout file of the application.
 * This file wraps the entire app with required providers,
 * handles notification settings, safe area support,
 * navigation stack, and status bar configuration.
 */

import ClerkAndConvexProvider from "@/provider/ClerkAndConvexProvider";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

/**
 * Global notification handler
 * Configures how notifications are displayed when received.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Displays alert popup
    shouldPlaySound: true, // Plays notification sound
    shouldSetBadge: false, // Does not update app badge count
    shouldShowBanner: true, // Shows banner notification
    shouldShowList: true, // Adds notification to list
  }),
});

/**
 * RootLayout Component
 * Wraps the complete application with providers and navigation stack.
 */
export default function RootLayout() {
  return (
    <ClerkAndConvexProvider>
      {/* Provides safe screen area for all devices */}
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Main navigation stack */}
          <Stack screenOptions={{ headerShown: false }} />

          {/* Controls status bar appearance */}
          <StatusBar style="auto" />
        </SafeAreaView>
      </SafeAreaProvider>
    </ClerkAndConvexProvider>
  );
}
