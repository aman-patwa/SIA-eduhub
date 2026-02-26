import { useSSO, useSignIn } from "@clerk/clerk-expo";
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

  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState(""); // email or username
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

      router.replace("/(tabs)");
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

  const onContinue = () => {
    const id = identifier.trim();
    if (!id) {
      Alert.alert("Missing Details", "Please enter email or username.");
      return;
    }
    setStep(2);
  };

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
        router.replace("/(tabs)");
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
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Logo */}
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

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Sign in to SIAeduHub</Text>
          <Text style={styles.subtitle}>
            Welcome back! Please sign in to continue
          </Text>

          {/* Google Button */}
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

          {/* Divider */}
          {/* 
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.line} />
          </View>
          */}

          {/* Identifier */}
          <Text style={styles.label}>Email address or username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email or username"
            placeholderTextColor="#6B7280"
            autoCapitalize="none"
            value={identifier}
            onChangeText={setIdentifier}
            keyboardType="email-address"
          />

          {/* Step 2: Password */}
          {step === 2 && (
            <>
              <Text style={[styles.label, { marginTop: 10 }]}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor="#6B7280"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </>
          )}

          {/* Continue / Sign in Button */}
          {step === 1 ? (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onContinue}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryText}>Continue ➜</Text>
            </TouchableOpacity>
          ) : (
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
          )}

          {/* Footer */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don’t have an account?</Text>
            <Text
              style={styles.footerLink}
              onPress={() => router.push("/(auth)/sign-up")}
            >
              Sign up
            </Text>
          </View>

          {/* Back to Step 1 */}
          {step === 2 && (
            <Text style={styles.backLink} onPress={() => setStep(1)}>
              ← Change email/username
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#E6F0FF",
    alignItems: "center",
    padding: 20,
    paddingTop: 30,
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

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
    gap: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(0,43,91,0.25)",
  },
  orText: {
    color: "#002B5B",
    fontWeight: "700",
    opacity: 0.7,
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
  backLink: {
    marginTop: 10,
    textAlign: "center",
    color: "#002B5B",
    fontWeight: "700",
    opacity: 0.8,
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
