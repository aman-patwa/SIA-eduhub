import { AppInput, Card, Label, PrimaryButton, Screen } from "@/components/ui";
import { api } from "@/convex/_generated/api";
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

const APP_TYPES: { type: AppType; title: string; desc: string }[] = [
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

export default function ApplicationsScreen() {
  const myApps = useQuery(api.applications.myApplications);

  const createApp = useMutation(api.applications.createApplication);

  const [selected, setSelected] = useState<AppType | null>(null);

  // common
  const [reason, setReason] = useState("");

  // railway specific
  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const selectedMeta = useMemo(
    () => APP_TYPES.find((a) => a.type === selected) || null,
    [selected],
  );

  const resetForm = () => {
    setReason("");
    setFromStation("");
    setToStation("");
  };

  const onSubmit = async () => {
    if (!selectedMeta) return;

    // validation
    if (selected === "railway") {
      if (!fromStation.trim() || !toStation.trim()) {
        Alert.alert(
          "Missing Details",
          "Please enter From station and To station.",
        );
        return;
      }
    }

    try {
      setSubmitting(true);

      await createApp({
        type: selectedMeta.type,
        title: selectedMeta.title,
        reason: reason.trim() ? reason.trim() : undefined,
        fromStation: selected === "railway" ? fromStation.trim() : undefined,
        toStation: selected === "railway" ? toStation.trim() : undefined,
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
    <Screen>
      <Card>
        <Text style={styles.title}>Applications</Text>
        <Text style={styles.sub}>
          Apply for certificates and requests. Track status below.
        </Text>

        {/* Select type */}
        {!selected ? (
          <View style={{ gap: 12, marginTop: 10 }}>
            {APP_TYPES.map((a) => (
              <Pressable
                key={a.type}
                onPress={() => setSelected(a.type)}
                style={({ pressed }) => [
                  styles.tile,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={styles.tileTitle}>{a.title}</Text>
                <Text style={styles.tileDesc}>{a.desc}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={{ marginTop: 10 }}>
            <View style={styles.formHead}>
              <Text style={styles.formTitle}>{selectedMeta?.title}</Text>
              <Text
                style={styles.changeLink}
                onPress={() => {
                  setSelected(null);
                  resetForm();
                }}
              >
                Change
              </Text>
            </View>

            {/* Railway fields */}
            {selected === "railway" && (
              <>
                <Label>From Station</Label>
                <AppInput
                  value={fromStation}
                  onChangeText={setFromStation}
                  placeholder="e.g., Dadar"
                />

                <Label>To Station</Label>
                <AppInput
                  value={toStation}
                  onChangeText={setToStation}
                  placeholder="e.g., Andheri"
                />
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

        {/* My applications */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Applications</Text>
        </View>

        {myApps === undefined ? (
          <View style={{ paddingVertical: 10 }}>
            <ActivityIndicator />
          </View>
        ) : myApps.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No applications yet.</Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {myApps.slice(0, 10).map((app: any) => (
              <View key={app._id} style={styles.appRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.appTitle}>{app.title}</Text>
                  <Text style={styles.appMeta}>
                    {new Date(app.createdAt).toLocaleDateString()} •{" "}
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
      return { backgroundColor: "rgba(255,255,255,0.55)" }; // pending
  }
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

  tile: {
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tileTitle: {
    color: COLORS.textDark,
    fontWeight: "900",
    fontSize: 14,
  },
  tileDesc: {
    marginTop: 4,
    color: "#334155",
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.9,
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
    color: COLORS.textDark,
  },
  changeLink: {
    color: COLORS.link,
    fontWeight: "900",
    textDecorationLine: "underline",
    fontSize: 12,
  },

  sectionHeader: {
    marginTop: 18,
    marginBottom: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.textDark,
  },

  emptyBox: {
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    color: "#334155",
    fontWeight: "700",
    fontSize: 12,
    textAlign: "center",
  },

  appRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  appTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.textDark,
  },
  appMeta: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
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
