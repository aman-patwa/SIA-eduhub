import { AppInput, Card, Label, PrimaryButton, Screen } from "@/components/ui";
import { api } from "@/convex/_generated/api";
import {
  CLASSES_BY_DEPT,
  DEPARTMENTS,
  SUBJECTS_BY_DEPT_AND_CLASS,
} from "@/lib/academicData";
import { COLORS } from "@/styles/theme";
import { useAuth } from "@clerk/clerk-expo";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery } from "convex/react";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function ExamsScreen() {
  const { isLoaded, isSignedIn } = useAuth();

  const me = useQuery(api.users.getMe, isLoaded && isSignedIn ? {} : "skip");

  const exams = useQuery(
    api.exams.listStaffExams,
    isLoaded && isSignedIn && me ? {} : "skip",
  );

  const createExam = useMutation(api.exams.createExam);
  const deleteExam = useMutation(api.exams.deleteExam);

  const [dept, setDept] = useState("");
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");
  const [saving, setSaving] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState(new Date());
  const [selectedEndTime, setSelectedEndTime] = useState(new Date());

  const allowedDepts = useMemo(() => {
    if (!me) return [];
    if (me.role === "admin") return [...DEPARTMENTS];
    return me.teacherProfile?.depts ?? [];
  }, [me]);

  const classOptions = useMemo(() => {
    if (!dept) return [];
    return CLASSES_BY_DEPT[dept] ?? [];
  }, [dept]);

  const subjectOptions = useMemo(() => {
    if (!dept || !className) return [];

    const classSubjects = SUBJECTS_BY_DEPT_AND_CLASS[dept]?.[className] ?? [];

    if (me?.role === "teacher") {
      const teacherSubjects = me.teacherProfile?.subjects ?? [];

      return classSubjects.filter((subjectFromClass) =>
        teacherSubjects.some(
          (teacherSubject) =>
            normalizeText(teacherSubject) === normalizeText(subjectFromClass),
        ),
      );
    }

    return classSubjects;
  }, [dept, className, me]);

  useEffect(() => {
    setClassName("");
    setSubject("");
  }, [dept]);

  useEffect(() => {
    setSubject("");
  }, [className]);

  const canSubmit =
    dept.trim() &&
    className.trim() &&
    subject.trim() &&
    examDate.trim() &&
    startTime.trim() &&
    endTime.trim() &&
    !saving;

  const onCreate = async () => {
    if (!canSubmit) {
      Alert.alert("Missing", "Please fill all required exam fields.");
      return;
    }

    if (startTime >= endTime) {
      Alert.alert("Invalid Time", "End time must be later than start time.");
      return;
    }

    try {
      setSaving(true);

      await createExam({
        dept: dept.trim(),
        class: className.trim(),
        subject: subject.trim(),
        examDate: examDate.trim(),
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        room: room.trim() || undefined,
      });

      Alert.alert("Success", "Exam schedule created.");

      setDept("");
      setClassName("");
      setSubject("");
      setExamDate("");
      setStartTime("");
      setEndTime("");
      setRoom("");

      setSelectedDate(new Date());
      setSelectedStartTime(new Date());
      setSelectedEndTime(new Date());
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to create exam.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = (examId: any) => {
    Alert.alert("Delete Exam", "Are you sure you want to delete this exam?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteExam({ examId });
            Alert.alert("Deleted", "Exam deleted successfully.");
          } catch (e: any) {
            Alert.alert("Error", e?.message || "Failed to delete exam.");
          }
        },
      },
    ]);
  };

  const onChangeDate = (_event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
      setExamDate(formatDate(date));
    }
  };

  const onChangeStartTime = (_event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowStartTimePicker(false);
    }

    if (date) {
      setSelectedStartTime(date);
      setStartTime(formatTime(date));
    }
  };

  const onChangeEndTime = (_event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowEndTimePicker(false);
    }

    if (date) {
      setSelectedEndTime(date);
      setEndTime(formatTime(date));
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
        <Text style={styles.title}>Exam Schedule</Text>
        <Text style={styles.sub}>
          Admin and teacher can manage class exam schedules.
        </Text>

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

        <Label>Class</Label>
        <View style={styles.chipWrap}>
          {classOptions.map((c) => (
            <Pressable
              key={c}
              onPress={() => setClassName(c)}
              style={[styles.chip, className === c && styles.chipActive]}
            >
              <Text
                style={[
                  styles.chipText,
                  className === c && styles.chipTextActive,
                ]}
              >
                {c}
              </Text>
            </Pressable>
          ))}
        </View>

        <Label>Subject</Label>
        <View style={styles.chipWrap}>
          {subjectOptions.map((s) => (
            <Pressable
              key={s}
              onPress={() => setSubject(s)}
              style={[styles.chip, subject === s && styles.chipActive]}
            >
              <Text
                style={[
                  styles.chipText,
                  subject === s && styles.chipTextActive,
                ]}
              >
                {s}
              </Text>
            </Pressable>
          ))}
        </View>

        <Label>Exam Date</Label>
        <Pressable
          onPress={() => setShowDatePicker(true)}
          style={styles.pickerInput}
        >
          <Text
            style={[
              styles.pickerInputText,
              !examDate && styles.placeholderText,
            ]}
          >
            {examDate || "Select exam date"}
          </Text>
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeDate}
            minimumDate={new Date()}
          />
        )}

        <Label>Start Time</Label>
        <Pressable
          onPress={() => setShowStartTimePicker(true)}
          style={styles.pickerInput}
        >
          <Text
            style={[
              styles.pickerInputText,
              !startTime && styles.placeholderText,
            ]}
          >
            {startTime || "Select start time"}
          </Text>
        </Pressable>

        {showStartTimePicker && (
          <DateTimePicker
            value={selectedStartTime}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeStartTime}
          />
        )}

        <Label>End Time</Label>
        <Pressable
          onPress={() => setShowEndTimePicker(true)}
          style={styles.pickerInput}
        >
          <Text
            style={[styles.pickerInputText, !endTime && styles.placeholderText]}
          >
            {endTime || "Select end time"}
          </Text>
        </Pressable>

        {showEndTimePicker && (
          <DateTimePicker
            value={selectedEndTime}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeEndTime}
          />
        )}

        <Label>Room (optional)</Label>
        <AppInput
          value={room}
          onChangeText={setRoom}
          placeholder="Room No / Hall"
        />

        <PrimaryButton
          title={saving ? "Saving..." : "Create Exam"}
          onPress={onCreate}
          disabled={!canSubmit}
        />
      </Card>

      <View style={{ height: 12 }} />

      <Card>
        <Text style={styles.sectionTitle}>Scheduled Exams</Text>

        {exams === undefined ? (
          <ActivityIndicator />
        ) : exams.length === 0 ? (
          <Text style={styles.emptyText}>No exam schedules yet.</Text>
        ) : (
          <View style={{ gap: 10 }}>
            {exams.map((exam: any) => (
              <View key={exam._id} style={styles.examCard}>
                <Text style={styles.examTitle}>{exam.subject}</Text>
                <Text style={styles.examMeta}>
                  {exam.dept} • {exam.class}
                </Text>
                <Text style={styles.examBody}>
                  Date: {exam.examDate}
                  {"\n"}
                  Time: {exam.startTime} - {exam.endTime}
                  {exam.room ? `\nRoom: ${exam.room}` : ""}
                </Text>
                <Text style={styles.examDate}>
                  Created by: {exam.createdByName}
                </Text>

                <Pressable
                  onPress={() => onDelete(exam._id)}
                  style={styles.deleteBtn}
                >
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </Card>
    </Screen>
  );
}

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\./g, "");
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
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
  pickerInput: {
    width: "100%",
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  pickerInputText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textDark,
  },
  placeholderText: {
    color: "#6B7280",
    fontWeight: "500",
  },
  examCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  examTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.textDark,
  },
  examMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  examBody: {
    marginTop: 6,
    fontSize: 13,
    color: "#111827",
    lineHeight: 20,
  },
  examDate: {
    marginTop: 8,
    fontSize: 11,
    color: "#64748B",
    fontWeight: "700",
  },
  deleteBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  deleteBtnText: {
    color: "#991B1B",
    fontWeight: "900",
    fontSize: 11,
  },
});
