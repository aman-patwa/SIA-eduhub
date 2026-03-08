import { AppInput, Card, Label, PrimaryButton } from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { COLORS } from "@/styles/theme";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { Redirect, router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function AdminProfileScreen() {
  const me = useQuery(api.users.getMe);
  const updateMyProfile = useMutation(api.users.updateMyProfile);
  const { signOut } = useAuth();
  const { user, isLoaded } = useUser();

  if (me === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!me) return <Redirect href="/(auth)/login" />;

  if (me.role !== "admin" && me.role !== "teacher") {
    return <Redirect href="/(tabs)" />;
  }

  const [fullname, setFullname] = useState(me.fullname ?? "");
  const [phone, setPhone] = useState(me.phone ?? "");

  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    setFullname(me.fullname ?? "");
    setPhone(me.phone ?? "");
  }, [me.fullname, me.phone]);

  const canSave = useMemo(() => fullname.trim().length > 0, [fullname]);

  const onSave = async () => {
    if (!canSave) {
      Alert.alert("Missing", "Full name is required");
      return;
    }
    try {
      setSaving(true);
      await updateMyProfile({
        fullname: fullname.trim(),
        phone: phone.trim() || undefined,
      });
      Alert.alert("Saved ✅", "Profile updated");
    } catch (e: any) {
      Alert.alert("Failed", e?.message ?? "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async () => {
    if (!isLoaded || !user) {
      Alert.alert("Please wait", "User not loaded yet");
      return;
    }
    if (!currentPassword.trim() || !newPassword.trim()) {
      Alert.alert("Missing", "Enter current password and new password");
      return;
    }
    if (newPassword.trim().length < 8) {
      Alert.alert(
        "Weak password",
        "New password must be at least 8 characters",
      );
      return;
    }

    try {
      setChangingPw(true);

      await user.updatePassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      } as any);

      setCurrentPassword("");
      setNewPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);

      Alert.alert("Done ✅", "Password updated");
    } catch (e: any) {
      Alert.alert(
        "Password change failed",
        e?.errors?.[0]?.message || e?.message || "Try again",
      );
    } finally {
      setChangingPw(false);
    }
  };

  const onSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch {
      Alert.alert("Error", "Could not sign out");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Profile</Text>

        <Card>
          <Text style={styles.roleLine}>
            Role: <Text style={styles.roleValue}>{me.role.toUpperCase()}</Text>
          </Text>

          <Label>Full Name</Label>
          <AppInput
            value={fullname}
            onChangeText={setFullname}
            placeholder="Full name"
          />

          <Label>Email (read-only)</Label>
          <AppInput value={me.email} editable={false} />

          <Label>Mobile Number</Label>
          <AppInput
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g. 9876543210"
            keyboardType="phone-pad"
          />

          <PrimaryButton
            title={saving ? "Saving..." : "Save Changes"}
            onPress={onSave}
            disabled={!canSave || saving}
          />
        </Card>

        <View style={{ height: 12 }} />

        <Card>
          <Text style={styles.sectionTitle}>Change Password</Text>

          <Label>Current Password</Label>
          <View style={styles.passwordWrap}>
            <AppInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Current password"
              secureTextEntry={!showCurrentPassword}
              style={styles.passwordInput}
            />
            <Pressable
              onPress={() => setShowCurrentPassword((prev) => !prev)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showCurrentPassword ? "eye-off" : "eye"}
                size={20}
                color="#475569"
              />
            </Pressable>
          </View>

          <Label>New Password</Label>
          <View style={styles.passwordWrap}>
            <AppInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New password"
              secureTextEntry={!showNewPassword}
              style={styles.passwordInput}
            />
            <Pressable
              onPress={() => setShowNewPassword((prev) => !prev)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showNewPassword ? "eye-off" : "eye"}
                size={20}
                color="#475569"
              />
            </Pressable>
          </View>

          <PrimaryButton
            title={changingPw ? "Updating..." : "Update Password"}
            onPress={onChangePassword}
            disabled={changingPw}
          />

          <Text style={styles.helper}>
            If password change fails due to Clerk settings, we’ll add a reset
            password flow.
          </Text>
        </Card>

        <View style={{ height: 14 }} />

        <Pressable
          onPress={onSignOut}
          style={({ pressed }) => [
            styles.signOutBtn,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },

  header: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 12,
    color: COLORS.textDark,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  roleLine: { fontWeight: "800", marginBottom: 10, color: "#0f172a" },
  roleValue: { color: COLORS.primary },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 10,
    color: "#0f172a",
  },
  helper: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.7,
    color: "#0f172a",
  },

  passwordWrap: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    paddingRight: 42,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  signOutBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#ef4444",
    alignItems: "center",
  },
  signOutText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});
