import { AppInput, Card, Label, PrimaryButton } from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { DEPARTMENTS, SUBJECTS_BY_DEPT_AND_CLASS } from "@/lib/academicData";
import { COLORS } from "@/styles/theme";
import { useAuth } from "@clerk/clerk-expo";
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

type DeptSubjectMap = Record<string, string[]>;

export default function AddTeacherScreen() {
  const router = useRouter();
  const { getToken } = useAuth();

  const completeTeacher = useMutation(
    api.adminTeachers.adminCompleteTeacherProfile,
  );
  const me = useQuery(api.users.getMe);

  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [selectedDept, setSelectedDept] = useState("");
  const [deptSubjectMap, setDeptSubjectMap] = useState<DeptSubjectMap>({});

  const [creating, setCreating] = useState(false);
  const [createdClerkId, setCreatedClerkId] = useState<string | null>(null);

  const TEMP_PASSWORD = "Teacher@1234";

  if (me === undefined) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!me) return null;
  if (me.role !== "admin") return <Redirect href="/(admin)" />;

  const subjectOptions = useMemo(() => {
    if (!selectedDept) return [];

    const deptClassMap = SUBJECTS_BY_DEPT_AND_CLASS[selectedDept] ?? {};
    const allSubjects = Object.values(deptClassMap).flat();

    return Array.from(new Set(allSubjects));
  }, [selectedDept]);

  const selectedSubjectsForCurrentDept = deptSubjectMap[selectedDept] ?? [];

  const allSelectedForCurrentDept =
    subjectOptions.length > 0 &&
    subjectOptions.every((subject) =>
      selectedSubjectsForCurrentDept.includes(subject),
    );

  const finalDepts = Object.keys(deptSubjectMap).filter(
    (dept) => deptSubjectMap[dept]?.length > 0,
  );

  const finalSubjects = Array.from(
    new Set(Object.values(deptSubjectMap).flat()),
  );

  const canSubmit = useMemo(() => {
    return (
      fullname.trim() &&
      username.trim() &&
      email.trim() &&
      finalDepts.length > 0 &&
      finalSubjects.length > 0
    );
  }, [fullname, username, email, finalDepts, finalSubjects]);

  function toggleSubjectForSelectedDept(subject: string) {
    if (!selectedDept) return;

    const currentSubjects = deptSubjectMap[selectedDept] ?? [];

    const nextSubjects = currentSubjects.includes(subject)
      ? currentSubjects.filter((s) => s !== subject)
      : [...currentSubjects, subject];

    setDeptSubjectMap((prev) => ({
      ...prev,
      [selectedDept]: nextSubjects,
    }));
  }

  function toggleAllSubjectsForSelectedDept() {
    if (!selectedDept) return;

    setDeptSubjectMap((prev) => ({
      ...prev,
      [selectedDept]: allSelectedForCurrentDept ? [] : [...subjectOptions],
    }));
  }

  function removeDeptAssignment(dept: string) {
    setDeptSubjectMap((prev) => {
      const copy = { ...prev };
      delete copy[dept];
      return copy;
    });

    if (selectedDept === dept) {
      setSelectedDept("");
    }
  }

  async function onCreateTeacher() {
    if (!canSubmit) {
      Alert.alert(
        "Missing Details",
        "Fill all fields and assign at least one department with subjects.",
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
        depts: finalDepts,
        subjects: finalSubjects,
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
  }

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
          <Text style={styles.title}>ADD TEACHER</Text>
          <Text style={styles.sub}>
            Admin-only. Create teacher and assign department-wise subjects.
          </Text>

          <Label>Full Name</Label>
          <AppInput
            value={fullname}
            onChangeText={setFullname}
            placeholder="Teacher name"
          />

          <Label>Username</Label>
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

          <Label>Select Department</Label>
          <View style={styles.chipWrap}>
            {DEPARTMENTS.map((dept) => (
              <Chip
                key={dept}
                text={dept}
                active={selectedDept === dept}
                onPress={() => setSelectedDept(dept)}
              />
            ))}
          </View>

          <Label>Subjects for Selected Department</Label>
          {!selectedDept ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                First select a department to load subjects.
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.selectedDeptText}>
                Current Department: {selectedDept}
              </Text>

              <Pressable
                onPress={toggleAllSubjectsForSelectedDept}
                style={[
                  styles.allChip,
                  allSelectedForCurrentDept && styles.allChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.allChipText,
                    allSelectedForCurrentDept && styles.allChipTextActive,
                  ]}
                >
                  {allSelectedForCurrentDept ? "Unselect ALL" : "Select ALL"}
                </Text>
              </Pressable>

              <View style={styles.chipWrap}>
                {subjectOptions.map((subject) => (
                  <Chip
                    key={subject}
                    text={subject}
                    active={selectedSubjectsForCurrentDept.includes(subject)}
                    onPress={() => toggleSubjectForSelectedDept(subject)}
                  />
                ))}
              </View>
            </>
          )}

          <Label>Assigned Department-Subject Mapping</Label>
          {finalDepts.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                No department assignments added yet.
              </Text>
            </View>
          ) : (
            <View style={styles.assignmentWrap}>
              {finalDepts.map((dept) => (
                <View key={dept} style={styles.assignmentCard}>
                  <View style={styles.assignmentHeader}>
                    <Text style={styles.assignmentDept}>{dept}</Text>

                    <Pressable
                      onPress={() => removeDeptAssignment(dept)}
                      style={styles.removeBtn}
                    >
                      <Text style={styles.removeBtnText}>Remove</Text>
                    </Pressable>
                  </View>

                  <Text style={styles.assignmentSubjects}>
                    {(deptSubjectMap[dept] ?? []).join(", ")}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <PrimaryButton
            title={creating ? "Creating..." : "Create Teacher"}
            onPress={onCreateTeacher}
            disabled={!canSubmit || creating}
          />

          {creating && (
            <View style={styles.loaderSmall}>
              <ActivityIndicator />
            </View>
          )}

          <Text style={styles.note}>
            Temp Password: <Text style={styles.noteBold}>{TEMP_PASSWORD}</Text>
            {"\n"}
            Teacher must verify email on first login.
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
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.bg,
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
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#111827",
  },
  chipTextActive: {
    color: "#fff",
  },

  allChip: {
    alignSelf: "flex-start",
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: "#EEF2FF",
  },
  allChipActive: {
    backgroundColor: COLORS.primary,
  },
  allChipText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.primary,
  },
  allChipTextActive: {
    color: "#fff",
  },

  selectedDeptText: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.textDark,
    marginBottom: 10,
  },

  emptyBox: {
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 12,
  },
  emptyText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },

  assignmentWrap: {
    gap: 10,
    marginBottom: 14,
  },
  assignmentCard: {
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  assignmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  assignmentDept: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.textDark,
  },
  assignmentSubjects: {
    marginTop: 8,
    fontSize: 12,
    color: "#334155",
    fontWeight: "700",
    lineHeight: 18,
  },

  removeBtn: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  removeBtnText: {
    color: "#991B1B",
    fontSize: 11,
    fontWeight: "900",
  },

  loaderSmall: {
    marginTop: 10,
  },

  note: {
    marginTop: 12,
    fontSize: 12,
    color: "#334155",
    fontWeight: "700",
    textAlign: "center",
  },
  noteBold: {
    fontWeight: "900",
  },
  note2: {
    marginTop: 6,
    fontSize: 11,
    color: "#334155",
    opacity: 0.8,
    textAlign: "center",
  },
});
