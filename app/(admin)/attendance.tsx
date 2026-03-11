import { Card, PrimaryButton, Screen } from "@/components/ui";
import { api } from "@/convex/_generated/api";
import {
  CLASSES_BY_DEPT,
  DEPARTMENTS,
  SUBJECTS_BY_DEPT_AND_CLASS,
} from "@/lib/academicData";
import { COLORS } from "@/styles/theme";
import { useMutation, useQuery } from "convex/react";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type AttendanceStatus = "present" | "absent";

type LocalRecord = {
  studentUserId: string;
  fullname: string;
  rollno: string;
  status: AttendanceStatus;
};

export default function AttendanceScreen() {
  const me = useQuery(api.users.getMe);
  const saveAttendance = useMutation(api.attendance.saveAttendance);

  const todayDate = useMemo(() => getTodayDate(), []);

  const [dept, setDept] = useState("");
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [sessionDate] = useState(todayDate);

  const [appliedFilters, setAppliedFilters] = useState<{
    dept: string;
    class: string;
    subject: string;
    sessionDate: string;
  } | null>(null);

  const [records, setRecords] = useState<LocalRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const deptOptions = useMemo(() => {
    if (!me) return [];
    if (me.role === "teacher") return me.teacherProfile?.depts ?? [];
    return [...DEPARTMENTS];
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
    if (me?.role === "teacher" && !dept) {
      const firstDept = me.teacherProfile?.depts?.[0] ?? "";
      if (firstDept) {
        setDept(firstDept);
      }
    }
  }, [me, dept]);

  useEffect(() => {
    setClassName("");
    setSubject("");
    setAppliedFilters(null);
    setRecords([]);
  }, [dept]);

  useEffect(() => {
    setSubject("");
    setAppliedFilters(null);
    setRecords([]);
  }, [className]);

  useEffect(() => {
    if (subject && !subjectOptions.includes(subject)) {
      setSubject("");
    }
  }, [subjectOptions, subject]);

  useEffect(() => {
    if (
      me?.role === "teacher" &&
      dept &&
      className &&
      !subject &&
      subjectOptions.length > 0
    ) {
      setSubject(subjectOptions[0]);
    }
  }, [me, dept, className, subject, subjectOptions]);

  const attendanceSheet = useQuery(
    api.attendance.getAttendanceSheet,
    appliedFilters
      ? {
          dept: appliedFilters.dept,
          class: appliedFilters.class,
          subject: appliedFilters.subject,
          sessionDate: appliedFilters.sessionDate,
        }
      : "skip",
  );

  useEffect(() => {
    if (attendanceSheet?.students) {
      setRecords(
        attendanceSheet.students.map((student) => ({
          studentUserId: student.userId,
          fullname: student.fullname,
          rollno: student.rollno,
          status: student.status,
        })),
      );
    }
  }, [attendanceSheet]);

  const pageLoading = me === undefined;
  const sheetLoading = !!appliedFilters && attendanceSheet === undefined;

  function handleLoadSheet() {
    if (!dept || !className || !subject) {
      Alert.alert(
        "Missing selection",
        "Please select department, class, and subject.",
      );
      return;
    }

    setAppliedFilters({
      dept,
      class: className,
      subject,
      sessionDate,
    });
  }

  function updateStatus(studentUserId: string, status: AttendanceStatus) {
    setRecords((prev) =>
      prev.map((item) =>
        item.studentUserId === studentUserId ? { ...item, status } : item,
      ),
    );
  }

  async function handleSaveAttendance() {
    if (!appliedFilters) {
      Alert.alert("Load first", "Please load the attendance sheet first.");
      return;
    }

    if (records.length === 0) {
      Alert.alert("No students", "No students found for this class.");
      return;
    }

    try {
      setIsSaving(true);

      await saveAttendance({
        dept: appliedFilters.dept,
        class: appliedFilters.class,
        subject: appliedFilters.subject,
        sessionDate: appliedFilters.sessionDate,
        records: records.map((item) => ({
          studentUserId: item.studentUserId as any,
          status: item.status,
        })),
      });

      Alert.alert("Success", "Attendance saved successfully.");
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to save attendance.");
    } finally {
      setIsSaving(false);
    }
  }

  if (pageLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!me) {
    return (
      <Screen>
        <Card>
          <Text style={styles.title}>Attendance</Text>
          <Text style={styles.sub}>Unable to load user details.</Text>
        </Card>
      </Screen>
    );
  }

  if (me.role !== "admin" && me.role !== "teacher") {
    return (
      <Screen>
        <Card>
          <Text style={styles.title}>Attendance</Text>
          <Text style={styles.sub}>
            You are not authorized to access this page.
          </Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen scroll contentStyle={{ padding: 16, paddingBottom: 40 }}>
      <Card>
        <Text style={styles.title}>Attendance Management</Text>
        <Text style={styles.sub}>Mark attendance for today</Text>

        <View style={styles.topBadgeRow}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{me.role.toUpperCase()}</Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Select Department</Text>
        <OptionGrid
          options={deptOptions}
          selectedValue={dept}
          onSelect={setDept}
        />

        <Text style={styles.sectionTitle}>Select Class</Text>
        <OptionGrid
          options={classOptions}
          selectedValue={className}
          onSelect={setClassName}
        />

        <Text style={styles.sectionTitle}>Select Subject</Text>
        <OptionGrid
          options={subjectOptions}
          selectedValue={subject}
          onSelect={setSubject}
        />

        <Text style={styles.sectionTitle}>Date</Text>
        <View style={styles.dateBox}>
          <Text style={styles.dateText}>{sessionDate}</Text>
        </View>

        <PrimaryButton
          title="Load Attendance Sheet"
          onPress={handleLoadSheet}
        />
      </Card>

      {appliedFilters && (
        <Card>
          <Text style={styles.sectionTitle}>Selected Session</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Dept:</Text> {appliedFilters.dept}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Class:</Text>{" "}
              {appliedFilters.class}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Subject:</Text>{" "}
              {appliedFilters.subject}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Date:</Text>{" "}
              {appliedFilters.sessionDate}
            </Text>
          </View>
        </Card>
      )}

      {sheetLoading && (
        <Card>
          <View style={styles.loaderInline}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>Loading students...</Text>
          </View>
        </Card>
      )}

      {appliedFilters && !sheetLoading && attendanceSheet && (
        <Card>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>Student List</Text>
            <View
              style={[
                styles.sessionBadge,
                attendanceSheet.exists ? styles.editBadge : styles.newBadge,
              ]}
            >
              <Text style={styles.sessionBadgeText}>
                {attendanceSheet.exists ? "Existing Session" : "New Session"}
              </Text>
            </View>
          </View>

          {records.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.sub}>
                No students found for the selected class.
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.metaText}>
                Total Students: {records.length}
              </Text>

              <View style={styles.listWrap}>
                {records.map((student) => (
                  <View key={student.studentUserId} style={styles.studentCard}>
                    <Text style={styles.studentName}>{student.fullname}</Text>
                    <Text style={styles.studentMeta}>
                      Roll No: {student.rollno}
                    </Text>

                    <View style={styles.toggleRow}>
                      <Pressable
                        onPress={() =>
                          updateStatus(student.studentUserId, "present")
                        }
                        style={[
                          styles.statusBtn,
                          student.status === "present" &&
                            styles.presentBtnActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBtnText,
                            student.status === "present" &&
                              styles.presentBtnTextActive,
                          ]}
                        >
                          Present
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() =>
                          updateStatus(student.studentUserId, "absent")
                        }
                        style={[
                          styles.statusBtn,
                          student.status === "absent" && styles.absentBtnActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBtnText,
                            student.status === "absent" &&
                              styles.absentBtnTextActive,
                          ]}
                        >
                          Absent
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>

              <PrimaryButton
                title={isSaving ? "Saving..." : "Save Attendance"}
                onPress={handleSaveAttendance}
                disabled={isSaving}
              />
            </>
          )}
        </Card>
      )}
    </Screen>
  );
}

function OptionGrid({
  options,
  selectedValue,
  onSelect,
}: {
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}) {
  if (!options.length) {
    return (
      <View style={styles.emptySelectBox}>
        <Text style={styles.emptySelectText}>No options available</Text>
      </View>
    );
  }

  return (
    <View style={styles.optionGrid}>
      {options.map((item) => {
        const selected = selectedValue === item;

        return (
          <Pressable
            key={item}
            onPress={() => onSelect(item)}
            style={[styles.optionItem, selected && styles.optionItemSelected]}
          >
            <View
              style={[styles.checkbox, selected && styles.checkboxSelected]}
            >
              {selected ? <Text style={styles.checkboxTick}>✓</Text> : null}
            </View>
            <Text
              style={[styles.optionText, selected && styles.optionTextSelected]}
            >
              {item}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\./g, "");
}

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

  topBadgeRow: {
    marginTop: 12,
    flexDirection: "row",
  },
  roleBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  roleBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.textDark,
    marginBottom: 10,
    marginTop: 12,
  },

  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 6,
  },
  optionItem: {
    minWidth: "47%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  optionItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "#EEF2FF",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxTick: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },
  optionText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textDark,
    flexShrink: 1,
  },
  optionTextSelected: {
    color: COLORS.primary,
  },

  emptySelectBox: {
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  emptySelectText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },

  dateBox: {
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textDark,
  },

  infoBox: {
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textDark,
    marginBottom: 6,
    fontWeight: "700",
  },
  infoLabel: {
    fontWeight: "900",
    color: COLORS.textDark,
  },

  loaderInline: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "700",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  newBadge: {
    backgroundColor: "#DBEAFE",
  },
  editBadge: {
    backgroundColor: "#DCFCE7",
  },
  sessionBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#0F172A",
  },

  emptyBox: {
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  metaText: {
    marginTop: -2,
    marginBottom: 12,
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "700",
  },

  listWrap: {
    gap: 10,
    marginBottom: 12,
  },
  studentCard: {
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  studentName: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.textDark,
  },
  studentMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "#475569",
    fontWeight: "700",
  },

  toggleRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#F8FAFC",
  },
  statusBtnText: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.textDark,
  },
  presentBtnActive: {
    backgroundColor: "#DCFCE7",
    borderColor: "#22C55E",
  },
  presentBtnTextActive: {
    color: "#166534",
  },
  absentBtnActive: {
    backgroundColor: "#FEE2E2",
    borderColor: "#EF4444",
  },
  absentBtnTextActive: {
    color: "#991B1B",
  },
});
