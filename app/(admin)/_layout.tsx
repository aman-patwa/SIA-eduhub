import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

export default function AdminLayout() {
  const me = useQuery(api.users.getMe);

  if (me === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // ✅ allow admin + teacher
  if (!me || (me.role !== "admin" && me.role !== "teacher")) {
    return <Redirect href="/(tabs)" />;
  }

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
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="applications"
        options={{
          title: "Applications",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notices"
        options={{
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="attendance"
        options={{
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

      {/* ✅ keep route, but hide from tab bar */}
      <Tabs.Screen
        name="add-teacher"
        options={{
          href: null, // 👈 hides it from tab bar
          title: "Add Teacher",
        }}
      />
    </Tabs>
  );
}
