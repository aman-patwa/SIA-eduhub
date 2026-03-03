import { AppInput, Card, Label, PrimaryButton } from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { COLORS } from "@/styles/theme";
import { useAuth } from "@clerk/clerk-expo"; // ✅ ADD
import { useMutation, useQuery } from "convex/react";
import { Redirect, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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

const DEPT_OPTIONS = ["B.Sc. IT", "B.M.S", "B.A.F", "B.B.I", "B.A.M.M.C"];
const SUBJECT_OPTIONS = [
  "DBMS",
  "OS",
  "Java",
  "Python",
  "Web Tech",
  "CN",
  "AI",
  "DSA",
];

export default function AddTeacherScreen() {
  const router = useRouter();

  const { getToken } = useAuth(); // ✅ ADD

  const completeTeacher = useMutation(
    api.adminTeachers.adminCompleteTeacherProfile,
  );
  const me = useQuery(api.users.getMe);

  if (!me) return null;
  if (me.role !== "admin") return <Redirect href="/(admin)" />;

  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [depts, setDepts] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);

  const [creating, setCreating] = useState(false);
  const [createdClerkId, setCreatedClerkId] = useState<string | null>(null);

  const TEMP_PASSWORD = "Teacher@1234";

  const canSubmit = useMemo(() => {
    return (
      fullname.trim() &&
      username.trim() &&
      email.trim() &&
      depts.length > 0 &&
      subjects.length > 0
    );
  }, [fullname, username, email, depts, subjects]);

  const toggle = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];

  const onCreateTeacher = async () => {
    if (!canSubmit) {
      Alert.alert(
        "Missing Details",
        "Fill all fields + select depts and subjects.",
      );
      return;
    }

    const base = process.env.EXPO_PUBLIC_CONVEX_SITE_URL;
    if (!base) {
      Alert.alert("Missing ENV", "EXPO_PUBLIC_CONVEX_SITE_URL is not set");
      return;
    }

    try {
      setCreating(true);

      const token = await getToken({ template: "convex" });

      const res = await fetch(`${base}/admin/create-teacher`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: email.trim(),
          username: username.trim(),
          fullname: fullname.trim(),
          tempPassword: TEMP_PASSWORD,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        Alert.alert("Create Failed", text);
        return;
      }

      const data = await res.json();

      await completeTeacher({
        clerkId: data.clerkId,
        phone: phone.trim() || undefined,
        depts,
        subjects,
      });

      setCreatedClerkId(data.clerkId);

      Alert.alert(
        "Teacher Added ✅",
        `Temporary Password: ${TEMP_PASSWORD}\nAsk teacher to login and verify email.`,
      );

      router.replace("/(admin)");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <Text style={styles.title}>ADD-TEACHER</Text>
          <Text style={styles.sub}>
            Admin-only. Creates teacher account with temp password.
          </Text>

          <Label>Full Name</Label>
          <AppInput
            value={fullname}
            onChangeText={setFullname}
            placeholder="Teacher name"
          />

          <Label>Username (auto-suggest later)</Label>
          <AppInput
            value={username}
            onChangeText={setUsername}
            placeholder="e.g. prof_raj"
            autoCapitalize="none"
          />

          <Label>Email</Label>
          <AppInput
            value={email}
            onChangeText={setEmail}
            placeholder="teacher@gmail.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Label>Phone (optional)</Label>
          <AppInput
            value={phone}
            onChangeText={setPhone}
            placeholder="9876543210"
            keyboardType="phone-pad"
          />

          <Label>Departments (multi)</Label>
          <View style={styles.chipWrap}>
            {DEPT_OPTIONS.map((d) => (
              <Chip
                key={d}
                text={d}
                active={depts.includes(d)}
                onPress={() => setDepts(toggle(depts, d))}
              />
            ))}
          </View>

          <Label>Subjects (multi)</Label>
          <View style={styles.chipWrap}>
            {SUBJECT_OPTIONS.map((s) => (
              <Chip
                key={s}
                text={s}
                active={subjects.includes(s)}
                onPress={() => setSubjects(toggle(subjects, s))}
              />
            ))}
          </View>

          <PrimaryButton
            title={creating ? "Creating..." : "Create Teacher"}
            onPress={onCreateTeacher}
            disabled={!canSubmit || creating}
          />

          {creating && (
            <View style={{ marginTop: 10 }}>
              <ActivityIndicator />
            </View>
          )}

          <Text style={styles.note}>
            Temp Password:{" "}
            <Text style={{ fontWeight: "900" }}>{TEMP_PASSWORD}</Text>
            {"\n"}Teacher must verify email on first login.
          </Text>

          {createdClerkId && (
            <Text style={styles.note2}>Created Clerk ID: {createdClerkId}</Text>
          )}
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Chip({
  text,
  active,
  onPress,
}: {
  text: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && { opacity: 0.9 },
      ]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {text}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },

  title: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.textDark,
    textAlign: "center",
  },
  sub: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.text,
    opacity: 0.85,
    textAlign: "center",
    marginBottom: 10,
  },

  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 11, fontWeight: "900", color: "#111827" },
  chipTextActive: { color: "#fff" },

  note: {
    marginTop: 12,
    fontSize: 12,
    color: "#334155",
    fontWeight: "700",
    textAlign: "center",
  },
  note2: {
    marginTop: 6,
    fontSize: 11,
    color: "#334155",
    opacity: 0.8,
    textAlign: "center",
  },
});
