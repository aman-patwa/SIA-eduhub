// app/index.tsx
import { api } from "@/convex/_generated/api";
import { registerForPushNotificationsAsync } from "@/lib/registerForPushNotifications";
import { useAuth } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import { Redirect } from "expo-router";
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  const me = useQuery(api.users.getMe, isLoaded && isSignedIn ? {} : "skip");

  const upsertMyPushToken = useMutation(api.pushTokens.upsertMyPushToken);
  const registeredRef = useRef(false);

  useEffect(() => {
    const run = async () => {
      if (!isLoaded || !isSignedIn || !me || registeredRef.current) return;

      try {
        const result = await registerForPushNotificationsAsync();
        await upsertMyPushToken(result);
        registeredRef.current = true;
      } catch (e) {
        console.log("Push registration skipped:", e);
      }
    };

    run();
  }, [isLoaded, isSignedIn, me, upsertMyPushToken]);

  if (!isLoaded) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!isSignedIn) return <Redirect href="/(auth)/login" />;

  if (me === undefined) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator />
      </View>
    );
  }

  if (me === null) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator />
      </View>
    );
  }

  if (
    me.role === "student" &&
    (!me.studentProfile ||
      !me.studentProfile.dept ||
      !me.studentProfile.class ||
      !me.studentProfile.rollno)
  ) {
    return <Redirect href="../(auth)/finish-profile" />;
  }

  if (me.role === "teacher" || me.role === "admin") {
    return <Redirect href="/(admin)" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
});
