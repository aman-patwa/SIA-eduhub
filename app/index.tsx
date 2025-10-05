import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image source={require("../assets/images/sia_clg_logo.png")} style={styles.logo} />
      
      <Text style={styles.title}>Welcome to SIA EduHub</Text>
      <Text style={styles.subtitle}>Your all-in-one student portal</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/login")} // 👈 Navigate to login page
      >
        <Text style={styles.buttonText}>Go to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F0FF",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    resizeMode: "contain",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#002B5B",
  },
  subtitle: {
    fontSize: 15,
    color: "#555",
    marginTop: 8,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4C74E6",
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
