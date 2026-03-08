import { useAuth } from "@clerk/clerk-expo";
import React from "react";
import { Text, View } from "react-native";

export default function notices() {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <View>
      <Text>notices page</Text>
    </View>
  );
}
