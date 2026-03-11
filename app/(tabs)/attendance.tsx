import { Card, Screen } from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { COLORS } from "@/styles/theme";
import { useQuery } from "convex/react";
import React from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View
} from "react-native";

export default function StudentAttendanceScreen() {
  const summary = useQuery(api.attendance.getMyAttendanceSummary);

  if (summary === undefined) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Screen scroll contentStyle={{ padding: 16, paddingBottom: 40 }}>
      <Card>
        <Text style={styles.title}>My Attendance</Text>
        <Text style={styles.sub}>
          View your overall and subject-wise attendance
        </Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Student Details</Text>

        <InfoRow label="Name" value={summary.student.fullname || "-"} />
        <InfoRow label="Department" value={summary.student.dept || "-"} />
        <InfoRow label="Class" value={summary.student.class || "-"} />
        <InfoRow label="Roll No" value={summary.student.rollno || "-"} />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Overall Attendance</Text>

        <View style={styles.overallBox}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{summary.overall.present}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{summary.overall.total}</Text>
            <Text style={styles.statLabel}>Total Classes</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{summary.overall.percentage}%</Text>
            <Text style={styles.statLabel}>Percentage</Text>
          </View>
        </View>

        <View
          style={[
            styles.attendanceStatusBox,
            summary.overall.percentage >= 75
              ? styles.goodAttendance
              : styles.lowAttendance,
          ]}
        >
          <Text
            style={[
              styles.attendanceStatusText,
              summary.overall.percentage >= 75
                ? styles.goodAttendanceText
                : styles.lowAttendanceText,
            ]}
          >
            {summary.overall.percentage >= 75
              ? "Good attendance status"
              : "Warning: Attendance below 75%"}
          </Text>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Subject-wise Attendance</Text>

        {summary.subjectWise.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              No attendance records available yet.
            </Text>
          </View>
        ) : (
          <View style={styles.subjectList}>
            {summary.subjectWise.map((item) => (
              <View key={item.subject} style={styles.subjectCard}>
                <View style={styles.subjectTopRow}>
                  <Text style={styles.subjectName}>{item.subject}</Text>
                  <Text
                    style={[
                      styles.subjectPercentage,
                      item.percentage >= 75
                        ? styles.goodPercentage
                        : styles.lowPercentage,
                    ]}
                  >
                    {item.percentage}%
                  </Text>
                </View>

                <Text style={styles.subjectMeta}>
                  Present: {item.present} / {item.total}
                </Text>

                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.max(0, Math.min(item.percentage, 100))}%`,
                      },
                      item.percentage >= 75
                        ? styles.progressGood
                        : styles.progressLow,
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>
    </Screen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
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

  title: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.textDark,
  },
  sub: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.text,
    opacity: 0.9,
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
  infoLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    maxWidth: "50%",
    textAlign: "right",
  },

  overallBox: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.textDark,
  },
  statLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },

  attendanceStatusBox: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  goodAttendance: {
    backgroundColor: "#DCFCE7",
    borderColor: "#22C55E",
  },
  lowAttendance: {
    backgroundColor: "#FEE2E2",
    borderColor: "#EF4444",
  },
  attendanceStatusText: {
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },
  goodAttendanceText: {
    color: "#166534",
  },
  lowAttendanceText: {
    color: "#991B1B",
  },

  emptyBox: {
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },

  subjectList: {
    gap: 10,
  },
  subjectCard: {
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  subjectTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subjectName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.textDark,
    paddingRight: 10,
  },
  subjectPercentage: {
    fontSize: 13,
    fontWeight: "900",
  },
  goodPercentage: {
    color: "#166534",
  },
  lowPercentage: {
    color: "#991B1B",
  },
  subjectMeta: {
    marginTop: 6,
    fontSize: 12,
    color: "#475569",
    fontWeight: "700",
  },

  progressTrack: {
    marginTop: 10,
    height: 10,
    width: "100%",
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  progressGood: {
    backgroundColor: "#22C55E",
  },
  progressLow: {
    backgroundColor: "#EF4444",
  },
});
