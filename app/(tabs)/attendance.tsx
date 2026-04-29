/**
 * Description:
 * This screen displays the student's attendance details,
 * including personal information, overall attendance,
 * and subject-wise attendance records with progress bars.
 */

import { Card, Screen } from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { useTabTheme } from "@/provider/TabThemeProvider";
import { COLORS } from "@/styles/theme";
import { useQuery } from "convex/react";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function StudentAttendanceScreen() {
  const { theme } = useTabTheme();
  const summary = useQuery(api.attendance.getMyAttendanceSummary);

  if (summary === undefined) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.screenBg }]}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Screen scroll contentStyle={styles.content}>
      <Card>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          My Attendance
        </Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>
          View your overall and subject-wise attendance
        </Text>
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Student Details
        </Text>

        <InfoRow label="Name" value={summary.student.fullname || "-"} />
        <InfoRow label="Department" value={summary.student.dept || "-"} />
        <InfoRow label="Class" value={summary.student.class || "-"} />
        <InfoRow label="Roll No" value={summary.student.rollno || "-"} />
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Overall Attendance
        </Text>

        <View style={styles.overallBox}>
          <StatCard label="Present" value={summary.overall.present} />
          <StatCard label="Total Classes" value={summary.overall.total} />
          <StatCard label="Percentage" value={`${summary.overall.percentage}%`} />
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
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Subject-wise Attendance
        </Text>

        {summary.subjectWise.length === 0 ? (
          <View
            style={[
              styles.emptyBox,
              {
                backgroundColor: theme.surface,
                borderColor: theme.surfaceBorder,
              },
            ]}
          >
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No attendance records available yet.
            </Text>
          </View>
        ) : (
          <View style={styles.subjectList}>
            {summary.subjectWise.map((item) => (
              <View
                key={item.subject}
                style={[
                  styles.subjectCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.surfaceBorder,
                  },
                ]}
              >
                <View style={styles.subjectTopRow}>
                  <Text style={[styles.subjectName, { color: theme.textPrimary }]}>
                    {item.subject}
                  </Text>

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

                <Text style={[styles.subjectMeta, { color: theme.textMuted }]}>
                  Present: {item.present} / {item.total}
                </Text>

                <View
                  style={[
                    styles.progressTrack,
                    { backgroundColor: theme.progressTrack },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.max(
                          0,
                          Math.min(item.percentage, 100),
                        )}%`,
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
  const { theme } = useTabTheme();

  return (
    <View
      style={[
        styles.infoRow,
        {
          backgroundColor: theme.surface,
          borderColor: theme.surfaceBorder,
        },
      ]}
    >
      <Text style={[styles.infoLabel, { color: theme.textPrimary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: theme.surfaceText }]}>{value}</Text>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  const { theme } = useTabTheme();

  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.surfaceBorder,
        },
      ]}
    >
      <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
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
    fontSize: 22,
    fontWeight: "900",
  },
  sub: {
    marginTop: 6,
    fontSize: 13,
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "800",
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "700",
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
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "900",
  },
  statLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
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
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: "700",
  },
  subjectList: {
    gap: 10,
  },
  subjectCard: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
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
    fontWeight: "700",
  },
  progressTrack: {
    marginTop: 10,
    height: 10,
    width: "100%",
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
