import { Card, PrimaryButton, Screen } from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { COLORS } from "@/styles/theme";
import { useClerk } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useClerk();
  const me = useQuery(api.users.getMe);

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
    <Screen>
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
  rowValue: { marginTop: 4, fontSize: 14, fontWeight: "700", color: "#111827" },
});
