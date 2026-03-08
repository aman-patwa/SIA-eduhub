import { AppInput, Card, Label, PrimaryButton, Screen } from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { COLORS } from "@/styles/theme";
import { useAuth } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const CLASS_OPTIONS = ["FY", "SY", "TY"];
const DEPT_OPTIONS = ["B.Sc. IT", "B.M.S", "B.A.F", "B.B.I", "B.A.M.M.C"];
const STATUS_OPTIONS = ["pending", "approved", "rejected", "ready"];

export default function AdminApplications() {
  const [dept, setDept] = useState<string | undefined>(undefined);
  const [className, setClassName] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>("pending");

  const { isLoaded, isSignedIn } = useAuth();

  const me = useQuery(api.users.getMe, isLoaded && isSignedIn ? {} : "skip");

  const apps = useQuery(
    api.admin.listApplications,
    isLoaded &&
      isSignedIn &&
      me !== undefined &&
      !!me &&
      (me.role === "admin" || me.role === "teacher")
      ? {
          dept,
          class: className,
          status,
        }
      : "skip",
  );

  const updateStatus = useMutation(api.admin.updateApplicationStatus);
  const deleteApp = useMutation(api.admin.deleteApplication);

  const [note, setNote] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedApp = useMemo(() => {
    if (!apps || !selectedId) return null;
    return apps.find((a: any) => a._id === selectedId) || null;
  }, [apps, selectedId]);

  const doUpdate = async (newStatus: string) => {
    if (!selectedApp) return;

    if (newStatus === "rejected" && !note.trim()) {
      Alert.alert(
        "Reason required",
        "Please write a rejection reason in note.",
      );
      return;
    }

    try {
      setSaving(true);
      await updateStatus({
        applicationId: selectedApp._id,
        status: newStatus,
        adminNote: note.trim() ? note.trim() : undefined,
      });
      Alert.alert("Updated", `Marked as ${newStatus.toUpperCase()}`);
      setSelectedId(null);
      setNote("");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const doDelete = () => {
    if (!selectedApp) return;

    Alert.alert(
      "Delete application?",
      "This will permanently delete the application. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setSaving(true);
              await deleteApp({ applicationId: selectedApp._id });
              Alert.alert("Deleted", "Application deleted successfully.");
              setSelectedId(null);
              setNote("");
            } catch (e: any) {
              Alert.alert("Error", e?.message || "Failed to delete");
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  };

  // ✅ loader while auth / me is initializing
  if (!isLoaded || me === undefined) {
    return (
      <Screen scroll contentStyle={{ padding: 16, paddingBottom: 40 }}>
        <Card>
          <View style={{ paddingVertical: 20 }}>
            <ActivityIndicator />
          </View>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen scroll contentStyle={{ padding: 16, paddingBottom: 40 }}>
      <Card>
        <Text style={styles.title}>Applications Panel</Text>
        <Text style={styles.sub}>
          Filter and approve/reject student applications.
        </Text>

        {/* Filters */}
        <View style={{ gap: 10, marginTop: 12 }}>
          <FilterRow
            label="Status"
            options={STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
            allowAll
          />
          <FilterRow
            label="Class"
            options={CLASS_OPTIONS}
            value={className}
            onChange={setClassName}
            allowAll
          />
          <FilterRow
            label="Department"
            options={DEPT_OPTIONS}
            value={dept}
            onChange={setDept}
            allowAll
          />
        </View>

        {/* List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Applications</Text>
        </View>

        {apps === undefined ? (
          <View style={{ paddingVertical: 10 }}>
            <ActivityIndicator />
          </View>
        ) : apps.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No applications found.</Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {apps.slice(0, 25).map((a: any) => (
              <Pressable
                key={a._id}
                onPress={() => setSelectedId(a._id)}
                style={({ pressed }) => [
                  styles.appRow,
                  selectedId === a._id && styles.appRowSelected,
                  pressed && { opacity: 0.9 },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.appTitle}>{a.title}</Text>
                  <Text style={styles.appMeta}>
                    {a.rollno} • {a.class} • {a.dept}
                  </Text>
                  <Text style={styles.appMeta2}>
                    {new Date(a.createdAt).toLocaleString()}
                  </Text>
                </View>

                <View style={[styles.badge, badgeStyle(a.status)]}>
                  <Text style={styles.badgeText}>
                    {String(a.status).toUpperCase()}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Action Drawer */}
        {selectedApp && (
          <View style={styles.drawer}>
            <Text style={styles.drawerTitle}>Update Status</Text>
            <Text style={styles.drawerMeta}>
              {selectedApp.rollno} • {selectedApp.title}
            </Text>

            <Label>Admin Note (required for reject)</Label>
            <AppInput
              value={note}
              onChangeText={setNote}
              placeholder="Write note / reason..."
            />

            <View style={{ gap: 10 }}>
              <PrimaryButton
                title={saving ? "Saving..." : "Approve"}
                onPress={() => doUpdate("approved")}
                disabled={saving}
              />
              <PrimaryButton
                title={saving ? "Saving..." : "Mark Ready"}
                onPress={() => doUpdate("ready")}
                disabled={saving}
              />
              <PrimaryButton
                title={saving ? "Saving..." : "Reject"}
                onPress={() => doUpdate("rejected")}
                disabled={saving}
              />

              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  {
                    backgroundColor: "#DC2626",
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: "center",
                  },
                  saving && { opacity: 0.6 },
                ]}
                onPress={doDelete}
                disabled={saving}
              >
                <Text style={{ color: "#fff", fontWeight: "900" }}>
                  {saving ? "Working..." : "Delete Application"}
                </Text>
              </TouchableOpacity>

              <Text
                style={styles.cancelLink}
                onPress={() => {
                  setSelectedId(null);
                  setNote("");
                }}
              >
                Cancel
              </Text>
            </View>
          </View>
        )}
      </Card>
    </Screen>
  );
}

function FilterRow({
  label,
  options,
  value,
  onChange,
  allowAll,
}: {
  label: string;
  options: string[];
  value: string | undefined;
  onChange: (v: string | undefined) => void;
  allowAll?: boolean;
}) {
  return (
    <View>
      <Text style={styles.filterLabel}>{label}</Text>
      <View style={styles.filterRow}>
        {allowAll && (
          <Chip
            active={!value}
            text="All"
            onPress={() => onChange(undefined)}
          />
        )}
        {options.map((o) => (
          <Chip
            key={o}
            active={value === o}
            text={o.toUpperCase()}
            onPress={() => onChange(o)}
          />
        ))}
      </View>
    </View>
  );
}

function Chip({
  text,
  active,
  onPress,
}: {
  text: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && { opacity: 0.9 },
      ]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {text}
      </Text>
    </Pressable>
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

  sectionHeader: {
    marginTop: 18,
    marginBottom: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
    paddingTop: 12,
  },
  sectionTitle: { fontSize: 14, fontWeight: "900", color: COLORS.textDark },

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
  appRowSelected: { borderColor: COLORS.primary, borderWidth: 2 },

  appTitle: { fontSize: 13, fontWeight: "900", color: COLORS.textDark },
  appMeta: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "800",
    color: "#334155",
    opacity: 0.9,
  },
  appMeta2: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
    opacity: 0.75,
  },

  badge: { borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 },
  badgeText: { fontSize: 11, fontWeight: "900", color: "#111827" },

  drawer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  drawerTitle: { fontSize: 14, fontWeight: "900", color: COLORS.textDark },
  drawerMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "800",
    color: "#334155",
    opacity: 0.85,
  },

  cancelLink: {
    textAlign: "center",
    marginTop: 8,
    color: COLORS.link,
    fontWeight: "900",
    textDecorationLine: "underline",
  },

  filterLabel: {
    marginTop: 8,
    marginBottom: 6,
    color: COLORS.textDark,
    fontWeight: "900",
    fontSize: 12,
  },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  chip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 11, fontWeight: "900", color: "#111827" },
  chipTextActive: { color: "#fff" },
});
