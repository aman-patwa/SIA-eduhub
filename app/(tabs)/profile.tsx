/**
 * Description:
 * This screen displays and updates the student's profile.
 * It allows editing personal details such as phone number,
 * parent details, address, and date of birth.
 * It also provides sign-out functionality.
 */

import { AppInput, Card, Label, PrimaryButton, Screen } from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { useTabTheme } from "@/provider/TabThemeProvider";
import { COLORS } from "@/styles/theme";
import { useClerk } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import { Redirect, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

/**
 * Profile Screen Component
 * Shows student details and edit form.
 */
export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { theme } = useTabTheme();
  const me = useQuery(api.users.getMe);
  const updateStudentProfile = useMutation(api.users.updateStudentProfile);

  const [phone, setPhone] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");
  const [documents, setDocuments] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!me) return;

    setPhone(me.phone ?? "");
    setParentName(me.studentProfile?.parentName ?? "");
    setParentPhone(me.studentProfile?.parentPhone ?? "");
    setAddress(me.studentProfile?.address ?? "");
    setDob(me.studentProfile?.dob ?? "");
    setDocuments((me.studentProfile?.documents ?? []).join(", "));
  }, [me]);

  const canSave = useMemo(() => !!me, [me]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const docsArray = documents
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      await updateStudentProfile({
        phone: phone.trim() || undefined,
        parentName: parentName.trim() || undefined,
        parentPhone: parentPhone.trim() || undefined,
        address: address.trim() || undefined,
        dob: dob.trim() || undefined,
        documents: docsArray,
      });

      Alert.alert("Saved", "Profile updated successfully.");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch {
      Alert.alert("Error", "Could not sign out.");
    }
  };

  if (me === undefined) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.screenBg }]}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  if (!me) return <Redirect href="/(auth)/login" />;

  if (me.role !== "student") return <Redirect href="/(admin)" />;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
    >
      <Screen scroll contentStyle={styles.content}>
        <Text style={[styles.header, { color: theme.textPrimary }]}>
          My Profile
        </Text>

        <Card>
          <View style={styles.headerBlock}>
            <View
              style={[
                styles.avatarFallback,
                { backgroundColor: theme.surfaceStrong },
              ]}
            >
              <Text
                style={[styles.avatarFallbackText, { color: theme.textPrimary }]}
              >
                {(me.fullname || "S").charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              {me.fullname || "Student"}
            </Text>
            <Text style={[styles.sub, { color: theme.textSecondary }]}>
              {me.email}
            </Text>
          </View>

          <Info
            label="Department"
            value={me.studentProfile?.dept || "Not available"}
          />
          <Info
            label="Class"
            value={me.studentProfile?.class || "Not available"}
          />
          <Info
            label="Roll Number"
            value={me.studentProfile?.rollno || "Not available"}
          />
        </Card>

        <Card>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Update Details
          </Text>

          <Label>Mobile Number</Label>
          <AppInput
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g. 9876543210"
            keyboardType="phone-pad"
          />

          <Label>Parent Name</Label>
          <AppInput
            value={parentName}
            onChangeText={setParentName}
            placeholder="Parent or guardian name"
          />

          <Label>Parent Phone</Label>
          <AppInput
            value={parentPhone}
            onChangeText={setParentPhone}
            placeholder="Parent contact number"
            keyboardType="phone-pad"
          />

          <Label>Address</Label>
          <AppInput
            value={address}
            onChangeText={setAddress}
            placeholder="Current address"
            multiline
            style={styles.multilineInput}
          />

          <Label>Date of Birth</Label>
          <AppInput
            value={dob}
            onChangeText={setDob}
            placeholder="dd/mm/yyyy"
          />

          <Label>Documents</Label>
          <AppInput
            value={documents}
            onChangeText={setDocuments}
            placeholder="Comma separated documents"
            multiline
            style={styles.multilineInput}
          />

          <PrimaryButton
            title={saving ? "Saving..." : "Save Changes"}
            onPress={handleSave}
            disabled={!canSave || saving}
          />
        </Card>

        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [
            styles.signOutBtn,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </Screen>
    </KeyboardAvoidingView>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  const { theme } = useTabTheme();

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: theme.surface,
          borderColor: theme.surfaceBorder,
        },
      ]}
    >
      <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: theme.surfaceText }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    width: "100%",
    maxWidth: 420,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 12,
    color: COLORS.textDark,
  },
  headerBlock: {
    alignItems: "center",
    marginBottom: 14,
  },
  avatarFallback: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.inputBg,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.textDark,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.textDark,
    textAlign: "center",
  },
  sub: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.text,
    opacity: 0.85,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.textDark,
    marginBottom: 12,
  },
  row: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textDark,
    opacity: 0.85,
  },
  rowValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  multilineInput: {
    minHeight: 72,
    textAlignVertical: "top",
  },
  signOutBtn: {
    width: "100%",
    maxWidth: 420,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#ef4444",
    alignItems: "center",
    marginTop: 14,
  },
  signOutText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
});
