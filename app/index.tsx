/**
 * File Name: index.tsx
 * Project: SIA EduHub
 * Author: AMAN PATWA
 * Description:
 * This is the entry screen of the application.
 * It checks authentication status, fetches user data,
 * registers push notifications, and redirects users
 * to the appropriate screen based on their role.
 */

import { api } from "@/convex/_generated/api";
import { registerForPushNotificationsAsync } from "@/lib/registerForPushNotifications";
import { useAuth } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import { Redirect } from "expo-router";
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

/**
 * Index Component
 * This component acts as the initial route of the app.
 * It handles authentication check, user data loading,
 * push token registration, and role-based redirection.
 */
export default function Index() {
  // Gets authentication loading state and sign-in status from Clerk
  const { isLoaded, isSignedIn } = useAuth();

  /**
   * Fetches current logged-in user details from Convex
   * Query runs only when authentication is loaded
   * and user is signed in.
   */
  const me = useQuery(api.users.getMe, isLoaded && isSignedIn ? {} : "skip");

  /**
   * Mutation to store/update push notification token
   * in the database.
   */
  const upsertMyPushToken = useMutation(api.pushTokens.upsertMyPushToken);

  /**
   * Prevents duplicate push token registration
   */
  const registeredRef = useRef(false);

  /**
   * Registers device for push notifications
   * after successful login and user data fetch.
   */
  useEffect(() => {
    const run = async () => {
      if (!isLoaded || !isSignedIn || !me || registeredRef.current) return;

      try {
        const result = await registerForPushNotificationsAsync();

        // Save push token in backend
        await upsertMyPushToken(result);

        // Prevent multiple registrations
        registeredRef.current = true;
      } catch (e) {
        console.log("Push registration skipped:", e);
      }
    };

    run();
  }, [isLoaded, isSignedIn, me, upsertMyPushToken]);

  /**
   * Show loading spinner while authentication is loading
   */
  if (!isLoaded) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator />
      </View>
    );
  }

  /**
   * Redirect user to login page if not signed in
   */
  if (!isSignedIn) return <Redirect href="/(auth)/login" />;

  /**
   * Show loader while user data is being fetched
   */
  if (me === undefined) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator />
      </View>
    );
  }

  /**
   * Show loader if user record is null
   */
  if (me === null) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator />
      </View>
    );
  }

  /**
   * Redirect student to complete profile
   * if required fields are missing
   */
  if (
    me.role === "student" &&
    (!me.studentProfile ||
      !me.studentProfile.dept ||
      !me.studentProfile.class ||
      !me.studentProfile.rollno)
  ) {
    return <Redirect href="../(auth)/finish-profile" />;
  }

  /**
   * Redirect admin and teacher users
   * to admin dashboard
   */
  if (me.role === "teacher" || me.role === "admin") {
    return <Redirect href="/(admin)" />;
  }

  /**
   * Redirect students to main tab dashboard
   */
  return <Redirect href="/(tabs)" />;
}

/**
 * Stylesheet for loader screen
 */
const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
