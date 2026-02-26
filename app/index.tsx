// app/index.tsx
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  // This returns:
  // - undefined while loading
  // - null if not found (you can design getMe to return null)
  // - user object when found
  const me = useQuery(api.users.getMe);

  // Clerk still loading
  if (!isLoaded) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator />
      </View>
    );
  }

  // Not signed in -> login
  if (!isSignedIn) return <Redirect href="/(auth)/login" />;

  // Convex still fetching
  if (me === undefined) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator />
      </View>
    );
  }

  // Webhook delay: signed in but user not yet created in Convex
  // (wait instead of redirecting somewhere wrong)
  if (me === null) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator />
      </View>
    );
  }

  // If student profile incomplete (should be rare now, but keep safety)
  // Best is to redirect to a dedicated finish-profile screen.
  if (me.role === "student" && (!me.dept || !me.class || !me.rollno)) {
    return <Redirect href="../(auth)/finish-profile" />;
    // If you don't have finish-profile, use:
    // return <Redirect href="/(tabs)/profile" />;
  }

  // Teacher/Admin
  if (me.role === "teacher" || me.role === "admin") {
    return <Redirect href="/(admin)" />;
  }

  // Student
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
});
