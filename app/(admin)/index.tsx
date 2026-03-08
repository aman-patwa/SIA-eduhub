import { Card, Screen } from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { COLORS } from "@/styles/theme";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function AdminDashboard() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  const me = useQuery(api.users.getMe, isLoaded && isSignedIn ? {} : "skip");

  const apps = useQuery(
    api.admin.listApplications,
    isLoaded && isSignedIn ? { status: "pending" } : "skip",
  );

  // Loader while auth initializing
  if (!isLoaded) {
    return (
      <Screen>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Admin Panel</Text>
        <Text style={styles.sub}>
          Manage applications, notices & attendance
        </Text>

        {apps === undefined ? (
          <View style={{ paddingVertical: 12 }}>
            <ActivityIndicator />
          </View>
        ) : (
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Pending Applications</Text>
            <Text style={styles.statValue}>{apps.length}</Text>
          </View>
        )}
      </Card>

      <Card>
        {me?.role === "admin" && (
          <Pressable
            onPress={() => router.push("/(admin)/add-teacher")}
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.primaryBtnText}>+ Add Teacher</Text>
          </Pressable>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  },
  statBox: {
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.textDark,
    opacity: 0.85,
  },
  statValue: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
  },
  primaryBtn: {
    marginTop: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#4C74E6",
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});
