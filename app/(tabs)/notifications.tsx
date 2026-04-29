/**
 * Description:
 * This screen displays department notices and notifications
 * for the logged-in student. It also allows opening
 * attached files or links from each notice.
 */

import { Card, Screen } from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { useTabTheme } from "@/provider/TabThemeProvider";
import { COLORS } from "@/styles/theme";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function NotificationsScreen() {
  const { theme } = useTabTheme();
  const { isLoaded, isSignedIn } = useAuth();
  const notices = useQuery(
    api.notices.listMyDeptNotices,
    isLoaded && isSignedIn ? {} : "skip",
  );

  if (!isLoaded || notices === undefined) {
    return (
      <Screen>
        <View style={styles.loader}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll contentStyle={styles.content}>
      <Card>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Announcement
        </Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>
          Department announcements for you
        </Text>

        {notices.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No notices found.
          </Text>
        ) : (
          <View style={styles.noticeList}>
            {notices.map((notice: any) => (
              <View
                key={notice._id}
                style={[
                  styles.noticeCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.surfaceBorder,
                  },
                ]}
              >
                <Text style={[styles.noticeTitle, { color: theme.textPrimary }]}>
                  {notice.title}
                </Text>

                <Text style={[styles.noticeMeta, { color: theme.textMuted }]}>
                  {notice.dept} | {notice.createdByName}
                </Text>

                <Text style={[styles.noticeBody, { color: theme.surfaceText }]}>
                  {notice.body}
                </Text>

                <Text style={[styles.noticeDate, { color: theme.textMuted }]}>
                  {new Date(notice.createdAt).toLocaleString()}
                </Text>

                {!!notice.attachments?.length && (
                  <View style={styles.attachmentList}>
                    {notice.attachments.map((url: string, idx: number) => (
                      <Text
                        key={idx}
                        style={[styles.link, { color: theme.link }]}
                        onPress={async () => {
                          const supported = await Linking.canOpenURL(url);

                          if (supported) {
                            await Linking.openURL(url);
                          } else {
                            Alert.alert(
                              "Invalid link",
                              "Unable to open this attachment.",
                            );
                          }
                        }}
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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
  },
  sub: {
    marginTop: 4,
    marginBottom: 12,
    fontSize: 13,
    textAlign: "center",
    opacity: 0.85,
  },
  emptyText: {
    textAlign: "center",
    fontWeight: "700",
  },
  noticeList: {
    gap: 10,
    marginTop: 10,
  },
  noticeCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: "900",
  },
  noticeMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
  },
  noticeBody: {
    marginTop: 6,
    fontSize: 13,
  },
  noticeDate: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: "700",
  },
  attachmentList: {
    marginTop: 8,
    gap: 6,
  },
  link: {
    fontWeight: "800",
    textDecorationLine: "underline",
  },
});
