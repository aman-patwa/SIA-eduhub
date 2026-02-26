import { api } from "@/convex/_generated/api";
import { useConvexAuth, useMutation } from "convex/react";
import { Redirect, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";

export default function FinishProfile() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const completeProfile = useMutation(api.users.completeStudentProfile);

  const { dept, className } = useLocalSearchParams<{
    dept: string;
    className: string;
  }>();

  const [done, setDone] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (done) return;
      if (isLoading) return;
      if (!isAuthenticated) return;

      if (!dept || !className) {
        Alert.alert("Missing data", "Department / Class missing.");
        return;
      }

      try {
        await completeProfile({
          dept,
          class: className,
        });
        setDone(true);
      } catch (e: any) {
        Alert.alert("Profile setup failed", e?.message ?? "Try again");
      }
    };

    run();
  }, [isAuthenticated, isLoading, dept, className, completeProfile, done]);

  if (done) return <Redirect href="/(tabs)" />;

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
    </View>
  );
}
