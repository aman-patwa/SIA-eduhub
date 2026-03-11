import { Card, Screen } from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { COLORS } from "@/styles/theme";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import React from "react";
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function NotificationsScreen() {
  const { isLoaded, isSignedIn } = useAuth();

  const notices = useQuery(
    api.notices.listMyDeptNotices,
    isLoaded && isSignedIn ? {} : "skip",
  );

  if (!isLoaded || notices === undefined) {
    return (
      <Screen>
        <View style={styles.loader}>
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll contentStyle={{ padding: 16, paddingBottom: 40 }}>
      <Card>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.sub}>Department notices for you</Text>

        {notices.length === 0 ? (
          <Text style={styles.emptyText}>No notices found.</Text>
        ) : (
          <View style={{ gap: 10, marginTop: 10 }}>
            {notices.map((notice: any) => (
              <View key={notice._id} style={styles.noticeCard}>
                <Text style={styles.noticeTitle}>{notice.title}</Text>
                <Text style={styles.noticeMeta}>
                  {notice.dept} • {notice.createdByName}
                </Text>
                <Text style={styles.noticeBody}>{notice.body}</Text>
                <Text style={styles.noticeDate}>
                  {new Date(notice.createdAt).toLocaleString()}
                </Text>

                {!!notice.attachments?.length && (
                  <View style={{ marginTop: 8, gap: 6 }}>
                    {notice.attachments.map((url: string, idx: number) => (
                      <Text
                        key={idx}
                        style={styles.link}
                        onPress={() => Linking.openURL(url)}
                      >
                        Open Attachment {idx + 1}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.textDark,
    textAlign: "center",
  },
  sub: {
    marginTop: 4,
    marginBottom: 12,
    fontSize: 13,
    color: COLORS.text,
    textAlign: "center",
    opacity: 0.85,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.text,
    fontWeight: "700",
  },
  noticeCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.55)",
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
    fontWeight: "700",
    color: "#334155",
  },
  noticeBody: {
    marginTop: 6,
    fontSize: 13,
    color: "#111827",
  },
  noticeDate: {
    marginTop: 8,
    fontSize: 11,
    color: "#64748B",
    fontWeight: "700",
  },
  link: {
    color: COLORS.link,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
});
