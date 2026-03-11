import { Card, Screen } from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { COLORS } from "@/styles/theme";
import { Ionicons } from "@expo/vector-icons";
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

export default function StudentHomeScreen() {
  const router = useRouter();

  const me = useQuery(api.users.getMe);
  const notices = useQuery(api.notices.listMyDeptNotices);

  if (me === undefined || notices === undefined) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!me) {
    return (
      <Screen>
        <Card>
          <Text style={styles.title}>Student Home</Text>
          <Text style={styles.sub}>Unable to load student data.</Text>
        </Card>
      </Screen>
    );
  }

  const latestNotice = notices[0];

  return (
    <Screen scroll contentStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Welcome Card */}
      <Card>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.name}>{me.fullname || "Student"}</Text>

        <View style={styles.badgeRow}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{me.role?.toUpperCase()}</Text>
          </View>
        </View>
      </Card>

      {/* Quick Actions */}
      <Card>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.grid}>
          <QuickAction
            icon="document-text-outline"
            title="Applications"
            onPress={() => router.push("/(tabs)/Applications")}
          />
          <QuickAction
            icon="notifications-outline"
            title="Notifications"
            onPress={() => router.push("/(tabs)/notifications")}
          />
          <QuickAction
            icon="calendar-outline"
            title="Exam Details"
            onPress={() => router.push("/(tabs)/exam_details")}
          />
          <QuickAction
            icon="person-outline"
            title="Profile"
            onPress={() => router.push("/(tabs)/profile")}
          />
          <QuickAction
            icon="checkmark-done-circle-outline"
            title="Attendance"
            onPress={() => router.push("/(tabs)/attendance")}
          />
        </View>
      </Card>

      {/* Latest Notice */}
      <Card>
        <Text style={styles.sectionTitle}>Latest Notice</Text>

        {latestNotice ? (
          <Pressable
            onPress={() => router.push("/(tabs)/notifications")}
            style={({ pressed }) => [
              styles.noticeBox,
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={styles.noticeTitle}>{latestNotice.title}</Text>
            <Text style={styles.noticeMeta}>
              {latestNotice.dept} •{" "}
              {new Date(latestNotice.createdAt).toLocaleDateString()}
            </Text>
            <Text style={styles.noticeBody} numberOfLines={3}>
              {latestNotice.body}
            </Text>
            <Text style={styles.linkText}>View all notices</Text>
          </Pressable>
        ) : (
          <View style={styles.noticeBox}>
            <Text style={styles.sub}>No notices available right now.</Text>
          </View>
        )}
      </Card>
    </Screen>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon} size={18} color={COLORS.primary} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function QuickAction({
  icon,
  title,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.85 }]}
    >
      <Ionicons name={icon} size={24} color={COLORS.primary} />
      <Text style={styles.actionText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.bg,
  },

  greeting: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "700",
  },
  name: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.textDark,
  },

  badgeRow: {
    marginTop: 12,
    flexDirection: "row",
  },
  roleBadge: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  roleBadgeText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 11,
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
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.textDark,
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    maxWidth: "45%",
    textAlign: "right",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionCard: {
    width: "47%",
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textDark,
    textAlign: "center",
  },

  noticeBox: {
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.textDark,
  },
  noticeMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "#475569",
    fontWeight: "700",
  },
  noticeBody: {
    marginTop: 8,
    fontSize: 13,
    color: "#111827",
    lineHeight: 18,
  },
  linkText: {
    marginTop: 10,
    color: COLORS.link,
    fontWeight: "900",
    textDecorationLine: "underline",
  },

  signOutBtn: {
    marginTop: 8,
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  signOutText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 15,
  },
});
