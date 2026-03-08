import { useSSO, useSignIn } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onGooglePress = useCallback(async () => {
    if (!isLoaded) return;

    try {
      setGoogleLoading(true);

      const { createdSessionId, setActive: setActiveSSO } = await startSSOFlow({
        strategy: "oauth_google",
      });

      if (!createdSessionId || !setActiveSSO) {
        Alert.alert("Login cancelled", "Google sign-in was not completed.");
        return;
      }

      await setActiveSSO({ session: createdSessionId });
      router.replace("/");
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Google sign-in failed.";
      Alert.alert("Google Sign-in", msg);
    } finally {
      setGoogleLoading(false);
    }
  }, [isLoaded, startSSOFlow, router]);

  const onSignIn = useCallback(async () => {
    if (!isLoaded) return;

    const id = identifier.trim();
    const pw = password.trim();

    if (!id || !pw) {
      Alert.alert(
        "Missing Details",
        "Please enter email/username and password.",
      );
      return;
    }

    try {
      setLoading(true);

      const res = await signIn.create({
        identifier: id,
        password: pw,
      });

      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        router.replace("/");
      } else {
        Alert.alert(
          "Login Needs Extra Step",
          "Please complete remaining steps.",
        );
      }
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Invalid credentials or user not found.";
      Alert.alert("Login Failed", msg);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, setActive, router, identifier, password]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require("../../assets/images/sia_clg_logo.png")}
          style={styles.logo}
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            The S.I.A. College Of Higher Education {"\n"}(Autonomous)
          </Text>
          <Text style={styles.infoText}>
            Affiliated to University of Mumbai {"\n"}NAAC Re-Accredited ‘B+’
            Grade
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Sign in to SIAeduHub</Text>
          <Text style={styles.subtitle}>
            Welcome back! Please sign in to continue
          </Text>

          {/*
          <TouchableOpacity
            style={[styles.googleBtn, googleLoading && { opacity: 0.7 }]}
            onPress={onGooglePress}
            disabled={!isLoaded || googleLoading}
            activeOpacity={0.8}
          >
            {googleLoading ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.googleText}>Continue with Google</Text>
            )}
          </TouchableOpacity>
          */}

          <Text style={styles.label}>Email address or username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email or username"
            placeholderTextColor="#6B7280"
            autoCapitalize="none"
            value={identifier}
            onChangeText={setIdentifier}
            keyboardType="default"
            returnKeyType="next"
          />

          <Text style={[styles.label, { marginTop: 10 }]}>Password</Text>
          <View style={styles.passwordWrap}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter password"
              placeholderTextColor="#6B7280"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={onSignIn}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              style={styles.eyeIcon}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#475569"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              (loading || !isLoaded) && { opacity: 0.7 },
            ]}
            onPress={onSignIn}
            disabled={loading || !isLoaded}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>Sign in ➜</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don’t have an account?</Text>
            <Text
              style={styles.footerLink}
              onPress={() => router.push("/(auth)/sign-up")}
            >
              Sign up
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#E6F0FF",
    alignItems: "center",
    padding: 20,
    paddingTop: 30,
    paddingBottom: 40,
    justifyContent: "center",
  },
  logo: {
    width: 110,
    height: 110,
    resizeMode: "contain",
    marginBottom: 14,
  },

  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#BFD8FF",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#002B5B",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#123A63",
    textAlign: "center",
    opacity: 0.85,
    marginBottom: 14,
  },

  googleBtn: {
    backgroundColor: "#E8ECF1",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  googleText: {
    color: "#111827",
    fontWeight: "700",
  },

  label: {
    color: "#002B5B",
    fontWeight: "800",
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    width: "100%",
    backgroundColor: "#E8ECF1",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },

  passwordWrap: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    width: "100%",
    backgroundColor: "#E8ECF1",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    paddingRight: 42,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  primaryBtn: {
    backgroundColor: "#4C74E6",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
    alignItems: "center",
  },
  footerText: {
    color: "#123A63",
    fontSize: 13,
  },
  footerLink: {
    color: "#0047AB",
    fontWeight: "800",
    fontSize: 13,
    textDecorationLine: "underline",
  },

  infoBox: {
    backgroundColor: "#CDE2FF",
    borderRadius: 15,
    padding: 10,
    marginTop: 16,
    marginBottom: 16,
    alignItems: "center",
    width: "100%",
    maxWidth: 420,
  },
  infoText: {
    textAlign: "center",
    color: "#002B5B",
    fontSize: 12.5,
    fontWeight: "600",
  },
});
