/**
 * File Name: _layout.tsx
 * Project: SIA EduHub
 * Author: AMAN PATWA
 * Description:
 * This file defines the bottom tab navigation layout
 * for student users. It controls the tab bar design,
 * icons, hidden screens, and navigation flow between tabs.
 */

import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { TabThemeProvider, useTabTheme } from "@/provider/TabThemeProvider";

/**
 * TabLayout Component
 * Creates bottom tab navigation for the student dashboard.
 */
export default function TabLayout() {
  return (
    <TabThemeProvider>
      <StudentTabs />
    </TabThemeProvider>
  );
}

function StudentTabs() {
  const { theme } = useTabTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Hides default top header
        tabBarShowLabel: false, // Hides tab text labels
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.tabBarBg, // Theme background
          borderTopWidth: 0, // Removes top border line
          elevation: 0, // Removes shadow (Android)
          height: 50, // Tab bar height
          position: "absolute", // Keeps it floating at bottom
          paddingBottom: 8, // Bottom spacing
        },
      }}
    >
      {/* Home Screen Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* Applications Screen Tab */}
      <Tabs.Screen
        name="Applications"
        options={{
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="briefcase" size={size} color={color} />
          ),
        }}
      />

      {/* Notifications Screen Tab */}
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />

      {/* Exam Details Screen Tab */}
      <Tabs.Screen
        name="exam_details"
        options={{
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />

      {/* Profile Screen Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden Attendance Screen (not shown in tab bar) */}
      <Tabs.Screen
        name="attendance"
        options={{
          href: null, // Removes it from visible tab navigation
        }}
      />
    </Tabs>
  );
}
