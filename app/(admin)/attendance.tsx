import { useAuth } from "@clerk/clerk-expo";
import React from "react";
import { Text, View } from "react-native";

export default function attendance() {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <View>
      <Text>attendance page</Text>
    </View>
  );
}
