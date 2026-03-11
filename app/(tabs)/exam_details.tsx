import { Card, Screen } from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { COLORS } from "@/styles/theme";
import { useQuery } from "convex/react";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function ExamDetailsScreen() {
  const exams = useQuery(api.exams.listStudentExams);

  if (exams === undefined) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Screen scroll contentStyle={{ padding: 16, paddingBottom: 40 }}>
      <Card>
        <Text style={styles.title}>Exam Details</Text>
        <Text style={styles.sub}>View your upcoming class exam schedule</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Scheduled Exams</Text>

        {exams.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              No exam schedule available yet.
            </Text>
          </View>
        ) : (
          <View style={styles.examList}>
            {exams.map((exam) => (
              <View key={exam._id} style={styles.examCard}>
                <Text style={styles.subject}>{exam.subject}</Text>
                <Text style={styles.meta}>
                  {exam.dept} • {exam.class}
                </Text>

                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Date:</Text> {exam.examDate}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Time:</Text> {exam.startTime}{" "}
                    - {exam.endTime}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Room:</Text>{" "}
                    {exam.room || "Not assigned"}
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
  examList: {
    gap: 10,
  },
  examCard: {
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  subject: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.textDark,
  },
  meta: {
    marginTop: 4,
    fontSize: 12,
    color: "#475569",
    fontWeight: "700",
  },
  infoBox: {
    marginTop: 10,
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "700",
  },
  infoLabel: {
    fontWeight: "900",
    color: COLORS.textDark,
  },
});
