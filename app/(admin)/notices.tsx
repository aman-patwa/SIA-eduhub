import { AppInput, Card, Label, PrimaryButton, Screen } from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { COLORS } from "@/styles/theme";
import { useAuth } from "@clerk/clerk-expo";
import { useAction, useMutation, useQuery } from "convex/react";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const DEPT_OPTIONS = ["B.Sc. IT", "B.M.S", "B.A.F", "B.B.I", "B.A.M.M.C"];

export default function NoticesScreen() {
  const { isLoaded, isSignedIn } = useAuth();

  const me = useQuery(api.users.getMe, isLoaded && isSignedIn ? {} : "skip");

  const notices = useQuery(
    api.notices.listStaffNotices,
    isLoaded && isSignedIn && me ? {} : "skip",
  );

  const createNotice = useMutation(api.notices.createNotice);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [dept, setDept] = useState<string>("");
  const [attachmentText, setAttachmentText] = useState("");
  const [saving, setSaving] = useState(false);
  const sendNoticePush = useAction(api.pushNotifications.sendNoticePush);

  const allowedDepts = useMemo(() => {
    if (!me) return [];
    if (me.role === "admin") return DEPT_OPTIONS;
    return me.teacherProfile?.depts ?? [];
  }, [me]);

  const canSubmit = title.trim() && body.trim() && dept.trim() && !saving;

  const onPost = async () => {
    if (!canSubmit) {
      Alert.alert("Missing", "Please fill title, body and department.");
      return;
    }

    try {
      setSaving(true);

      const attachments = attachmentText
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

      await createNotice({
        title: title.trim(),
        body: body.trim(),
        dept: dept.trim(),
        attachments,
      });
      await sendNoticePush({
        dept: dept.trim(),
        title: title.trim(),
        body: body.trim(),
      });

      Alert.alert("Success", "Notice posted successfully.");
      setTitle("");
      setBody("");
      setDept("");
      setAttachmentText("");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to post notice");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || me === undefined) {
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
        <Text style={styles.title}>Post Notice</Text>
        <Text style={styles.sub}>
          Teacher and admin can post department-wise notices.
        </Text>

        <Label>Title</Label>
        <AppInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter notice title"
        />

        <Label>Body</Label>
        <AppInput
          value={body}
          onChangeText={setBody}
          placeholder="Enter notice details"
          multiline
        />

        <Label>Department</Label>
        <View style={styles.chipWrap}>
          {allowedDepts.map((d) => (
            <Pressable
              key={d}
              onPress={() => setDept(d)}
              style={[styles.chip, dept === d && styles.chipActive]}
            >
              <Text
                style={[styles.chipText, dept === d && styles.chipTextActive]}
              >
                {d}
              </Text>
            </Pressable>
          ))}
        </View>

        <Label>Attachments (optional)</Label>
        <AppInput
          value={attachmentText}
          onChangeText={setAttachmentText}
          placeholder="Paste image/PDF URLs separated by comma"
        />

        <PrimaryButton
          title={saving ? "Posting..." : "Post Notice"}
          onPress={onPost}
          disabled={!canSubmit}
        />
      </Card>

      <View style={{ height: 12 }} />

      <Card>
        <Text style={styles.sectionTitle}>Recent Notices</Text>

        {notices === undefined ? (
          <ActivityIndicator />
        ) : notices.length === 0 ? (
          <Text style={styles.emptyText}>No notices yet.</Text>
        ) : (
          <View style={{ gap: 10 }}>
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
    marginTop: 6,
    marginBottom: 12,
    fontSize: 13,
    color: COLORS.text,
    textAlign: "center",
    opacity: 0.85,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.textDark,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.text,
    fontWeight: "700",
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
