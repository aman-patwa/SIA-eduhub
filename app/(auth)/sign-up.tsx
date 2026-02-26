import { api } from "@/convex/_generated/api";
import { useSignUp } from "@clerk/clerk-expo";
import { Picker } from "@react-native-picker/picker";
import { useMutation } from "convex/react";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const CLASS_OPTIONS = ["FY", "SY", "TY"];
const DEPT_OPTIONS = ["B.Sc. IT", "B.M.S", "B.A.F", "B.B.I", "B.A.M.M.C"];

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const completeProfile = useMutation(api.users.completeStudentProfile);

  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [dept, setDept] = useState("");
  const [className, setClassName] = useState("");

  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // STEP 1: Create Clerk account
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    if (
      !fullname.trim() ||
      !username.trim() ||
      !emailAddress.trim() ||
      !password.trim() ||
      !dept ||
      !className
    ) {
      Alert.alert("Missing Details", "Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      await signUp.create({
        emailAddress: emailAddress.trim(),
        password: password.trim(),
        username: username.trim(),
        firstName: fullname.trim(),
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);
    } catch (err: any) {
      Alert.alert("Signup Failed", err?.errors?.[0]?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify + complete profile in Convex
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    const cleanCode = code.replace(/\s/g, "");
    if (!cleanCode) {
      Alert.alert("Missing Code", "Enter the verification code.");
      return;
    }

    try {
      setVerifying(true);

      const res = await signUp.attemptEmailAddressVerification({
        code: cleanCode,
      });

      if (res.createdSessionId) {
        await setActive({ session: res.createdSessionId });
        if (res.createdSessionId) {
          await setActive({ session: res.createdSessionId });

          router.replace({
            pathname: "../(auth)/finish-profile",
            params: { dept, className },
          });

          return;
        }

        router.replace("/(tabs)");
      } else {
        Alert.alert("Not Completed", `Status: ${res.status}`);
      }
    } catch (err: any) {
      Alert.alert("Verification Failed", err?.errors?.[0]?.message || "Error");
    } finally {
      setVerifying(false);
    }
  };

  if (pendingVerification) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Verify Email</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter verification code"
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
        />

        <Pressable
          style={[styles.button, verifying && { opacity: 0.6 }]}
          onPress={onVerifyPress}
          disabled={verifying}
        >
          {verifying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify</Text>
          )}
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Student Signup</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={fullname}
        onChangeText={setFullname}
      />

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={emailAddress}
        onChangeText={setEmailAddress}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={{ marginBottom: 4 }}>Class</Text>
      <View style={styles.dropdown}>
        <Picker selectedValue={className} onValueChange={setClassName}>
          <Picker.Item label="Select Class" value="" />
          {CLASS_OPTIONS.map((c) => (
            <Picker.Item key={c} label={c} value={c} />
          ))}
        </Picker>
      </View>

      <Text style={{ marginBottom: 4 }}>Department</Text>
      <View style={styles.dropdown}>
        <Picker selectedValue={dept} onValueChange={setDept}>
          <Picker.Item label="Select Department" value="" />
          {DEPT_OPTIONS.map((d) => (
            <Picker.Item key={d} label={d} value={d} />
          ))}
        </Picker>
      </View>

      <Pressable
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={onSignUpPress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </Pressable>

      <View style={{ flexDirection: "row", marginTop: 10 }}>
        <Text>Already have an account? </Text>
        <Link href="/(auth)/login">
          <Text style={{ color: "#4C74E6" }}>Login</Text>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#4C74E6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
});
