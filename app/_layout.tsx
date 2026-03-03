import ClerkAndConvexProvider from "@/provider/ClerkAndConvexProvider";
import { ClerkProvider } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

<ClerkProvider publishableKey="pk_test_c21pbGluZy1yYXktOTUuY2xlcmsuYWNjb3VudHMuZGV2JA">
  <Stack />
</ClerkProvider>;

export default function RootLayout() {
  return (
    <ClerkAndConvexProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }} />
          <StatusBar style="auto" />
        </SafeAreaView>
      </SafeAreaProvider>
    </ClerkAndConvexProvider>
  );
}
