/**
 * Description:
 * This screen acts as the main dashboard for students.
 * It displays welcome information, quick navigation actions,
 * and the latest department notice.
 */

import { Card, Screen } from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { useTabTheme } from "@/provider/TabThemeProvider";
import { COLORS, TabTheme } from "@/styles/theme";
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

/**
 * Student Home Screen Component
 * Main dashboard for student users.
 */
export default function StudentHomeScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTabTheme();

  const me = useQuery(api.users.getMe);
  const notices = useQuery(api.notices.listMyDeptNotices);

  if (me === undefined || notices === undefined) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.screenBg }]}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  if (!me) {
    return (
      <Screen style={{ backgroundColor: theme.screenBg }}>
        <Card style={{ backgroundColor: theme.cardBg }}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Student Home
          </Text>
          <Text style={[styles.sub, { color: theme.textSecondary }]}>
            Unable to load student data.
          </Text>
        </Card>
      </Screen>
    );
  }

  const latestNotice = notices[0];

  return (
    <Screen
      scroll
      style={{ backgroundColor: theme.screenBg }}
      contentStyle={{ padding: 16, paddingBottom: 40 }}
    >
      <Card style={{ backgroundColor: theme.cardBg }}>
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>
              Welcome back,
            </Text>
            <Text style={[styles.name, { color: theme.textPrimary }]}>
              {me.fullname || "Student"}
            </Text>
          </View>

          <Pressable
            onPress={toggleTheme}
            style={({ pressed }) => [
              styles.themeToggle,
              { backgroundColor: theme.toggleBg },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Ionicons
              name={isDark ? "sunny-outline" : "moon-outline"}
              size={18}
              color={theme.toggleIcon}
            />
            <Text
              style={[styles.themeToggleText, { color: theme.textPrimary }]}
            >
              {isDark ? "Light" : "Dark"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.badgeRow}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{me.role?.toUpperCase()}</Text>
          </View>
        </View>
      </Card>

      <Card style={{ backgroundColor: theme.cardBg }}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Quick Actions
        </Text>

        <View style={styles.grid}>
          <QuickAction
            icon="document-text-outline"
            title="Applications"
            onPress={() => router.push("/(tabs)/Applications")}
            theme={theme}
          />
          <QuickAction
            icon="notifications-outline"
            title="Notifications"
            onPress={() => router.push("/(tabs)/notifications")}
            theme={theme}
          />
          <QuickAction
            icon="calendar-outline"
            title="Exam Details"
            onPress={() => router.push("/(tabs)/exam_details")}
            theme={theme}
          />
          <QuickAction
            icon="person-outline"
            title="Profile"
            onPress={() => router.push("/(tabs)/profile")}
            theme={theme}
          />
          <QuickAction
            icon="checkmark-done-circle-outline"
            title="Attendance"
            onPress={() => router.push("/(tabs)/attendance")}
            theme={theme}
          />
        </View>
      </Card>

      <Card style={{ backgroundColor: theme.cardBg }}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Latest Notice
        </Text>

        {latestNotice ? (
          <Pressable
            onPress={() => router.push("/(tabs)/notifications")}
            style={({ pressed }) => [
              styles.noticeBox,
              {
                backgroundColor: theme.surface,
                borderColor: theme.surfaceBorder,
              },
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={[styles.noticeTitle, { color: theme.textPrimary }]}>
              {latestNotice.title}
            </Text>

            <Text style={[styles.noticeMeta, { color: theme.textMuted }]}>
              {latestNotice.dept} |{" "}
              {new Date(latestNotice.createdAt).toLocaleDateString()}
            </Text>

            <Text
              style={[styles.noticeBody, { color: theme.surfaceText }]}
              numberOfLines={3}
            >
              {latestNotice.body}
            </Text>

            <Text style={[styles.linkText, { color: theme.link }]}>
              View all notices
            </Text>
          </Pressable>
        ) : (
          <View
            style={[
              styles.noticeBox,
              {
                backgroundColor: theme.surface,
                borderColor: theme.surfaceBorder,
              },
            ]}
          >
            <Text style={[styles.sub, { color: theme.textSecondary }]}>
              No notices available right now.
            </Text>
          </View>
        )}
      </Card>
    </Screen>
  );
}

function QuickAction({
  icon,
  title,
  onPress,
  theme,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  theme: TabTheme;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.surfaceBorder,
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      <Ionicons name={icon} size={24} color={COLORS.primary} />
      <Text style={[styles.actionText, { color: theme.textPrimary }]}>
        {title}
      </Text>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  headerCopy: {
    flex: 1,
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
  themeToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  themeToggleText: {
    fontSize: 12,
    fontWeight: "800",
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
});
