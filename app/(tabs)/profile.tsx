import { AppInput, Card, Label, PrimaryButton, Screen } from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { COLORS } from "@/styles/theme";
import { useClerk } from "@clerk/clerk-expo";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useClerk();

  const me = useQuery(api.users.getMe);
  const updateStudentProfile = useMutation(api.users.updateStudentProfile);

  const [phone, setPhone] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");
  const [documents, setDocuments] = useState("");
  const [saving, setSaving] = useState(false);

  const [showDobPicker, setShowDobPicker] = useState(false);
  const [dobDate, setDobDate] = useState(new Date(2005, 0, 1));

  useEffect(() => {
    if (!me) return;

    setPhone(me.phone ?? "");
    setParentName(me.studentProfile?.parentName ?? "");
    setParentPhone(me.studentProfile?.parentPhone ?? "");
    setAddress(me.studentProfile?.address ?? "");
    setDob(me.studentProfile?.dob ?? "");
    setDocuments((me.studentProfile?.documents ?? []).join(", "));

    const parsed = parseDobString(me.studentProfile?.dob);
    if (parsed) setDobDate(parsed);
  }, [me]);

  const canSave = useMemo(() => !!me, [me]);

  function formatDate(date: Date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function parseDobString(value?: string) {
    if (!value) return null;
    const parts = value.split("/");
    if (parts.length !== 3) return null;

    const day = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const year = Number(parts[2]);

    if (
      Number.isNaN(day) ||
      Number.isNaN(month) ||
      Number.isNaN(year) ||
      day < 1 ||
      day > 31 ||
      month < 0 ||
      month > 11 ||
      year < 1900
    ) {
      return null;
    }

    const parsed = new Date(year, month, day);
    if (Number.isNaN(parsed.getTime())) return null;

    return parsed;
  }

  const handleDobChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDobPicker(false);
    }

    if (event.type === "dismissed") return;
    if (!selectedDate) return;

    setDobDate(selectedDate);
    setDob(formatDate(selectedDate));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const docsArray = documents
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);

      await updateStudentProfile({
        phone: phone.trim() || undefined,
        parentName: parentName.trim() || undefined,
        parentPhone: parentPhone.trim() || undefined,
        address: address.trim() || undefined,
        dob: dob || undefined,
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
    await signOut();
    router.replace("/(auth)/login");
  };

  if (me === undefined) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator />
      </View>
    );
  }

  if (me === null) {
    return (
      <Screen>
        <Card>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.sub}>No user found.</Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen scroll contentStyle={{ padding: 16, paddingBottom: 40 }}>
      <Card>
        <View style={styles.header}>
          {me.image ? (
            <Image source={{ uri: me.image }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>
                {(me.fullname?.[0] || me.username?.[0] || "S").toUpperCase()}
              </Text>
            </View>
          )}

          <Text style={styles.title}>{me.fullname || "Student"}</Text>
          <Text style={styles.sub}>
            @{me.username} • {me.role?.toUpperCase()}
          </Text>
        </View>

        <Info label="Email" value={me.email} />
        <Info label="Class" value={me.studentProfile?.class || "—"} />
        <Info label="Department" value={me.studentProfile?.dept || "—"} />
        <Info label="Roll No" value={me.studentProfile?.rollno || "—"} />

        <View style={{ height: 8 }} />

        <Label>Phone Number</Label>
        <AppInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
        />

        <Label>Parent Name</Label>
        <AppInput
          value={parentName}
          onChangeText={setParentName}
          placeholder="Enter parent name"
        />

        <Label>Parent Phone Number</Label>
        <AppInput
          value={parentPhone}
          onChangeText={setParentPhone}
          placeholder="Enter parent phone number"
          keyboardType="phone-pad"
        />

        <Label>Address</Label>
        <AppInput
          value={address}
          onChangeText={setAddress}
          placeholder="Enter address"
        />

        <Label>Date of Birth</Label>
        <Pressable
          onPress={() => setShowDobPicker(true)}
          style={({ pressed }) => [
            styles.dateField,
            pressed && { opacity: 0.9 },
          ]}
        >
          <Text style={[styles.dateText, !dob && styles.datePlaceholder]}>
            {dob || "Select date of birth"}
          </Text>
        </Pressable>

        {showDobPicker && Platform.OS === "ios" && (
          <View style={styles.iosPickerBox}>
            <View style={styles.iosPickerHeader}>
              <Text style={styles.iosPickerTitle}>Select Date of Birth</Text>
              <Pressable onPress={() => setShowDobPicker(false)}>
                <Text style={styles.iosDone}>Done</Text>
              </Pressable>
            </View>

            <DateTimePicker
              value={dobDate}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onChange={handleDobChange}
            />
          </View>
        )}

        {showDobPicker && Platform.OS === "android" && (
          <DateTimePicker
            value={dobDate}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={handleDobChange}
          />
        )}

        <Label>Documents</Label>
        <AppInput
          value={documents}
          onChangeText={setDocuments}
          placeholder="Enter document URLs or names separated by comma"
        />

        <PrimaryButton
          title={saving ? "Saving..." : "Save Changes"}
          onPress={handleSave}
          disabled={!canSave || saving}
        />

        <View style={{ height: 10 }} />

        <PrimaryButton title="Sign out" onPress={handleSignOut} />
      </Card>
    </Screen>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.bg,
  },

  header: { alignItems: "center", marginBottom: 14 },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.inputBg,
    marginBottom: 10,
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

  row: {
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
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

  dateField: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  datePlaceholder: {
    color: "#6B7280",
    fontWeight: "500",
  },

  iosPickerBox: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  iosPickerHeader: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iosPickerTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  iosDone: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.primary,
  },
});
