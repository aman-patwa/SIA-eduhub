/**
 * Description:
 * This screen displays the student's upcoming exam schedule.
 * It fetches exam details from the backend and shows
 * subject-wise exam date, time, and room information.
 */

import { Card, Screen } from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { useTabTheme } from "@/provider/TabThemeProvider";
import { COLORS } from "@/styles/theme";
import { useQuery } from "convex/react";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function ExamDetailsScreen() {
  const { theme } = useTabTheme();
  const exams = useQuery(api.exams.listStudentExams);

  if (exams === undefined) {
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
          Exam Details
        </Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>
          View your upcoming class exam schedule
        </Text>
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Scheduled Exams
        </Text>

        {exams.length === 0 ? (
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
              No exam schedule available yet.
            </Text>
          </View>
        ) : (
          <View style={styles.examList}>
            {exams.map((exam) => (
              <View
                key={exam._id}
                style={[
                  styles.examCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.surfaceBorder,
                  },
                ]}
              >
                <Text style={[styles.subject, { color: theme.textPrimary }]}>
                  {exam.subject}
                </Text>

                <Text style={[styles.meta, { color: theme.textMuted }]}>
                  {exam.dept} | {exam.class}
                </Text>

                <View style={styles.infoBox}>
                  <Text style={[styles.infoText, { color: theme.surfaceText }]}>
                    <Text style={[styles.infoLabel, { color: theme.textPrimary }]}>
                      Date:
                    </Text>{" "}
                    {exam.examDate}
                  </Text>

                  <Text style={[styles.infoText, { color: theme.surfaceText }]}>
                    <Text style={[styles.infoLabel, { color: theme.textPrimary }]}>
                      Time:
                    </Text>{" "}
                    {exam.startTime} - {exam.endTime}
                  </Text>

                  <Text style={[styles.infoText, { color: theme.surfaceText }]}>
                    <Text style={[styles.infoLabel, { color: theme.textPrimary }]}>
                      Room:
                    </Text>{" "}
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
  emptyBox: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: "700",
  },
  examList: {
    gap: 10,
  },
  examCard: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  subject: {
    fontSize: 15,
    fontWeight: "900",
  },
  meta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
  },
  infoBox: {
    marginTop: 10,
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    fontWeight: "700",
  },
  infoLabel: {
    fontWeight: "900",
  },
});
