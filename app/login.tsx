import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
  if (username === "admin" && password === "1234") {
    Alert.alert("Login Successful", `Welcome ${username}`);
    router.push("/home"); // navigate to next page (you can make home.tsx)
  } else {
    Alert.alert("Login Failed", "Invalid username or password");
  }
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logo */}
      <Image source={require("../assets/images/sia_clg_logo.png")} style={styles.logo} />

      {/* College Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          The S.I.A. College Of Higher Education {"\n"}(Autonomous)
        </Text>
        <Text style={styles.infoText}>
          Affiliated to University of Mumbai {"\n"}NAAC Re-Accredited ‘B+’ Grade
        </Text>
      </View>

      {/* Login Box */}
      <View style={styles.loginBox}>
        <Text style={styles.loginTitle}>LOGIN</Text>

        <TextInput
          style={styles.input}
          placeholder="USER NAME"
          placeholderTextColor="#555"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder="PASSWORD"
          placeholderTextColor="#555"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>SUBMIT</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Don’t have Account? <Text style={styles.linkText}>Create Account</Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#E6F0FF",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginTop: 30,
    resizeMode: "contain",
  },
  infoBox: {
    backgroundColor: "#CDE2FF",
    borderRadius: 15,
    padding: 10,
    marginTop: 15,
    alignItems: "center",
  },
  infoText: {
    textAlign: "center",
    color: "#002B5B",
    fontSize: 13,
    fontWeight: "500",
  },
  loginBox: {
    backgroundColor: "#BFD8FF",
    borderRadius: 40,
    width: "90%",
    marginTop: 30,
    padding: 20,
    alignItems: "center",
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "90%",
    backgroundColor: "#E8ECF1",
    borderRadius: 15,
    padding: 10,
    marginVertical: 8,
    fontSize: 14,
  },
  button: {
    backgroundColor: "#4C74E6",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 40,
    marginTop: 15,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  footerText: {
    marginTop: 15,
    color: "#333",
    fontSize: 13,
  },
  linkText: {
    color: "#0047AB",
    fontWeight: "600",
  },
});
