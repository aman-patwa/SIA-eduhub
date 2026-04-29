/*
 * Description:
 * This layout file manages the protected admin navigation
 * system for the application using tab-based routing.
 * It verifies user authentication, fetches the logged-in
 * user's profile, restricts access to admin and teacher
 * roles only, and redirects unauthorized users.
 * After successful verification, it displays the admin
 * dashboard tabs such as applications, notices,
 * attendance, and profile.
 */

import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

export default function AdminLayout() {
  // Get authentication status from Clerk
  const { isLoaded, isSignedIn } = useAuth();

  // Fetch the currently logged-in user's data only after auth is ready
  const me = useQuery(api.users.getMe, isLoaded && isSignedIn ? {} : "skip");

  // Show loading indicator while authentication state is being resolved
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // Redirect unauthenticated users to the login page
  if (!isSignedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  // Wait until user profile data is fetched from Convex
  if (me === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // Restrict access to only admin and teacher roles
  if (!me || (me.role !== "admin" && me.role !== "teacher")) {
    return <Redirect href="/(tabs)" />;
  }

  // Render admin tab navigation for authorized users
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0,
          elevation: 0,
          height: 56,
          paddingBottom: 8,
        },
      }}
    >
      {/* Admin dashboard home screen */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />

      {/* Student applications management screen */}
      <Tabs.Screen
        name="applications"
        options={{
          title: "Applications",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
        }}
      />

      {/* Notice and announcements management screen */}
      <Tabs.Screen
        name="notices"
        options={{
          title: "Notices",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />

      {/* Attendance management screen */}
      <Tabs.Screen
        name="attendance"
        options={{
          title: "Attendance",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />

      {/* Admin profile screen */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden route for adding teacher accounts */}
      <Tabs.Screen
        name="add-teacher"
        options={{
          href: null,
        }}
      />

      {/* Hidden route for exam management module */}
      <Tabs.Screen
        name="exam"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
