/*
 * Description:
 * This screen allows students to submit different types
 * of applications such as railway concession, bonafide
 * certificate, and marksheet requests.
 * It also displays the status of previously submitted
 * applications.
 */

import { AppInput, Card, Label, PrimaryButton, Screen } from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { useTabTheme } from "@/provider/TabThemeProvider";
import { COLORS } from "@/styles/theme";
import { useMutation, useQuery } from "convex/react";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type AppType = "railway" | "bonafide" | "result";

const APP_TYPES = [
  {
    type: "railway",
    title: "Railway Concession",
    desc: "Apply for student railway concession form.",
  },
  {
    type: "bonafide",
    title: "Bonafide Certificate",
    desc: "Request bonafide certificate for official use.",
  },
  {
    type: "result",
    title: "Result / Marks Copy",
    desc: "Request result / marksheet copy.",
  },
];

const TO_STATION = "Dombivli";

export default function ApplicationsScreen() {
  const { theme } = useTabTheme();
  const myApps = useQuery(api.applications.myApplications);
  const createApp = useMutation(api.applications.createApplication);

  const [selected, setSelected] = useState<AppType | null>(null);
  const [reason, setReason] = useState("");
  const [fromStation, setFromStation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedMeta = useMemo(
    () => APP_TYPES.find((item) => item.type === selected) || null,
    [selected],
  );

  const resetForm = () => {
    setReason("");
    setFromStation("");
  };

  const onSubmit = async () => {
    if (!selectedMeta) return;

    if (selected === "railway" && !fromStation.trim()) {
      Alert.alert("Missing Details", "Please enter From station.");
      return;
    }

    try {
      setSubmitting(true);

      await createApp({
        type: selectedMeta.type,
        title: selectedMeta.title,
        reason: reason.trim() ? reason.trim() : undefined,
        fromStation: selected === "railway" ? fromStation.trim() : undefined,
        toStation: selected === "railway" ? TO_STATION : undefined,
      });

      Alert.alert("Submitted", "Your application has been submitted.");
      setSelected(null);
      resetForm();
    } catch (err: any) {
      Alert.alert("Failed", err?.message || "Could not submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <Card>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Applications
        </Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>
          Apply for certificates and requests. Track status below.
        </Text>

        {!selected ? (
          <View style={styles.tileList}>
            {APP_TYPES.map((item) => (
              <Pressable
                key={item.type}
                onPress={() => setSelected(item.type as AppType)}
                style={({ pressed }) => [
                  styles.tile,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.surfaceBorder,
                  },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={[styles.tileTitle, { color: theme.textPrimary }]}>
                  {item.title}
                </Text>
                <Text style={[styles.tileDesc, { color: theme.textMuted }]}>
                  {item.desc}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.formWrap}>
            <View style={styles.formHead}>
              <Text style={[styles.formTitle, { color: theme.textPrimary }]}>
                {selectedMeta?.title}
              </Text>
              <Text
                style={[styles.changeLink, { color: theme.link }]}
                onPress={() => {
                  setSelected(null);
                  resetForm();
                }}
              >
                Change
              </Text>
            </View>

            {selected === "railway" && (
              <>
                <Label>From Station</Label>
                <AppInput
                  value={fromStation}
                  onChangeText={setFromStation}
                  placeholder="e.g. Dadar"
                />

                <Label>To Station</Label>
                <AppInput value={TO_STATION} editable={false} />
              </>
            )}

            <Label>Reason (optional)</Label>
            <AppInput
              value={reason}
              onChangeText={setReason}
              placeholder="Write a short reason"
            />

            <PrimaryButton
              title={submitting ? "Submitting..." : "Submit Application"}
              onPress={onSubmit}
              disabled={submitting}
            />
          </View>
        )}
      </Card>

      <Card>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            My Applications
          </Text>
        </View>

        {myApps === undefined ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator color={COLORS.primary} />
          </View>
        ) : myApps.length === 0 ? (
          <View
            style={[
              styles.emptyBox,
              {
                backgroundColor: theme.surface,
                borderColor: theme.surfaceBorder,
              },
            ]}
          >
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              No applications yet.
            </Text>
          </View>
        ) : (
          <View style={styles.appList}>
            {myApps.slice(0, 10).map((app: any) => (
              <View
                key={app._id}
                style={[
                  styles.appRow,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.surfaceBorder,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.appTitle, { color: theme.textPrimary }]}>
                    {app.title}
                  </Text>
                  <Text style={[styles.appMeta, { color: theme.textMuted }]}>
                    {new Date(app.createdAt).toLocaleDateString()} |{" "}
                    {app.type.toUpperCase()}
                  </Text>
                </View>

                <View style={[styles.badge, badgeStyle(app.status)]}>
                  <Text style={styles.badgeText}>
                    {String(app.status).toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>
    </Screen>
  );
}

function badgeStyle(status: string) {
  switch (status) {
    case "approved":
      return { backgroundColor: "#D1FAE5" };
    case "rejected":
      return { backgroundColor: "#FEE2E2" };
    case "ready":
      return { backgroundColor: "#FEF3C7" };
    default:
      return { backgroundColor: "rgba(255,255,255,0.55)" };
  }
}

const styles = StyleSheet.create({
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
    marginTop: 6,
    fontSize: 13,
    opacity: 0.85,
    textAlign: "center",
  },
  tileList: {
    gap: 12,
    marginTop: 10,
  },
  tile: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  tileTitle: {
    fontWeight: "900",
    fontSize: 14,
  },
  tileDesc: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.9,
  },
  formWrap: {
    marginTop: 10,
  },
  formHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: "900",
  },
  changeLink: {
    fontWeight: "900",
    textDecorationLine: "underline",
    fontSize: 12,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
  },
  loaderWrap: {
    paddingVertical: 10,
  },
  emptyBox: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  emptyText: {
    fontWeight: "700",
    fontSize: 12,
    textAlign: "center",
  },
  appList: {
    gap: 10,
  },
  appRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  appTitle: {
    fontSize: 13,
    fontWeight: "900",
  },
  appMeta: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    opacity: 0.85,
  },
  badge: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#111827",
  },
});
