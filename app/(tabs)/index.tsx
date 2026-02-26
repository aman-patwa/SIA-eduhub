import { useClerk } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();

    // After sign out → go to root
    router.replace("/(auth)/login");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TouchableOpacity onPress={handleSignOut}>
        <Text style={{ color: "red", fontSize: 18 }}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}
