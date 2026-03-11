// convex/attendance.ts
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";

async function requireIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity;
}

async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await requireIdentity(ctx);

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!user) throw new Error("User not found");

  return user;
}

async function requireTeacherOrAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);

  if (user.role !== "teacher" && user.role !== "admin") {
    throw new Error("Not authorized");
  }

  return user;
}

async function getTeacherProfileOrNull(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
) {
  return await ctx.db
    .query("teacherProfiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .first();
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

async function validateAttendanceAccess(
  ctx: QueryCtx | MutationCtx,
  actor: {
    _id: Id<"users">;
    role: "student" | "teacher" | "admin";
  },
  dept: string,
  subject: string,
) {
  if (actor.role === "admin") return;

  const teacherProfile = await getTeacherProfileOrNull(ctx, actor._id);
  if (!teacherProfile) {
    throw new Error("Teacher profile not found");
  }

  const hasDeptAccess = teacherProfile.depts.some(
    (d) => normalizeText(d) === normalizeText(dept),
  );

  if (!hasDeptAccess) {
    throw new Error(
      "You are not allowed to mark attendance for this department",
    );
  }

  const hasSubjectAccess = teacherProfile.subjects.some(
    (s) => normalizeText(s) === normalizeText(subject),
  );

  if (!hasSubjectAccess) {
    throw new Error("You are not allowed to mark attendance for this subject");
  }
}

// Get students of a class for attendance marking
export const getClassStudents = query({
  args: {
    dept: v.string(),
    class: v.string(),
    subject: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await requireTeacherOrAdmin(ctx);
    await validateAttendanceAccess(ctx, actor, args.dept, args.subject);

    const studentProfiles = await ctx.db
      .query("studentProfiles")
      .withIndex("by_dept_class", (q) =>
        q.eq("dept", args.dept).eq("class", args.class),
      )
      .collect();

    const students = await Promise.all(
      studentProfiles.map(async (profile) => {
        const user = await ctx.db.get(profile.userId);
        if (!user) return null;

        return {
          userId: user._id,
          fullname: user.fullname,
          email: user.email,
          image: user.image,
          rollno: profile.rollno,
          dept: profile.dept,
          class: profile.class,
        };
      }),
    );

    return students
      .filter((s): s is NonNullable<typeof s> => s !== null)
      .sort((a, b) => a.rollno.localeCompare(b.rollno));
  },
});

// Get existing attendance sheet for one date/class/subject
export const getAttendanceSheet = query({
  args: {
    dept: v.string(),
    class: v.string(),
    subject: v.string(),
    sessionDate: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await requireTeacherOrAdmin(ctx);
    await validateAttendanceAccess(ctx, actor, args.dept, args.subject);

    const session = await ctx.db
      .query("attendanceSessions")
      .withIndex("by_dept_class_subject_date", (q) =>
        q
          .eq("dept", args.dept)
          .eq("class", args.class)
          .eq("subject", args.subject)
          .eq("sessionDate", args.sessionDate),
      )
      .first();

    const studentProfiles = await ctx.db
      .query("studentProfiles")
      .withIndex("by_dept_class", (q) =>
        q.eq("dept", args.dept).eq("class", args.class),
      )
      .collect();

    let recordsMap = new Map<string, "present" | "absent">();

    if (session) {
      const records = await ctx.db
        .query("attendanceRecords")
        .withIndex("by_sessionId", (q) => q.eq("sessionId", session._id))
        .collect();

      recordsMap = new Map(records.map((r) => [r.studentUserId, r.status]));
    }

    const students = await Promise.all(
      studentProfiles.map(async (profile) => {
        const user = await ctx.db.get(profile.userId);
        if (!user) return null;

        return {
          userId: user._id,
          fullname: user.fullname,
          rollno: profile.rollno,
          status: recordsMap.get(user._id) ?? "absent",
        };
      }),
    );

    return {
      sessionId: session?._id ?? null,
      exists: !!session,
      students: students
        .filter((s): s is NonNullable<typeof s> => s !== null)
        .sort((a, b) => a.rollno.localeCompare(b.rollno)),
    };
  },
});

// Create/update attendance for one session
export const saveAttendance = mutation({
  args: {
    dept: v.string(),
    class: v.string(),
    subject: v.string(),
    sessionDate: v.string(),
    records: v.array(
      v.object({
        studentUserId: v.id("users"),
        status: v.union(v.literal("present"), v.literal("absent")),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const actor = await requireTeacherOrAdmin(ctx);
    await validateAttendanceAccess(ctx, actor, args.dept, args.subject);

    if (args.records.length === 0) {
      throw new Error("No attendance records provided");
    }

    const studentProfiles = await ctx.db
      .query("studentProfiles")
      .withIndex("by_dept_class", (q) =>
        q.eq("dept", args.dept).eq("class", args.class),
      )
      .collect();

    const validStudentIds = new Set(studentProfiles.map((p) => p.userId));

    for (const record of args.records) {
      if (!validStudentIds.has(record.studentUserId)) {
        throw new Error(
          "One or more students do not belong to the selected class",
        );
      }
    }

    let session = await ctx.db
      .query("attendanceSessions")
      .withIndex("by_dept_class_subject_date", (q) =>
        q
          .eq("dept", args.dept)
          .eq("class", args.class)
          .eq("subject", args.subject)
          .eq("sessionDate", args.sessionDate),
      )
      .first();

    if (!session) {
      const sessionId = await ctx.db.insert("attendanceSessions", {
        teacherUserId: actor._id,
        dept: args.dept,
        class: args.class,
        subject: args.subject,
        sessionDate: args.sessionDate,
        createdAt: Date.now(),
      });

      session = await ctx.db.get(sessionId);
      if (!session) throw new Error("Failed to create attendance session");
    }

    for (const record of args.records) {
      const existingRecord = await ctx.db
        .query("attendanceRecords")
        .withIndex("by_session_student", (q) =>
          q
            .eq("sessionId", session._id)
            .eq("studentUserId", record.studentUserId),
        )
        .first();

      if (existingRecord) {
        await ctx.db.patch(existingRecord._id, {
          status: record.status,
          markedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("attendanceRecords", {
          sessionId: session._id,
          studentUserId: record.studentUserId,
          status: record.status,
          markedAt: Date.now(),
        });
      }
    }

    return {
      success: true,
      sessionId: session._id,
      totalStudents: args.records.length,
    };
  },
});

// Student attendance summary
export const getMyAttendanceSummary = query({
  args: {},
  handler: async (ctx) => {
    const me = await getCurrentUser(ctx);

    if (me.role !== "student") {
      throw new Error("Only students can view attendance summary");
    }

    const studentProfile = await ctx.db
      .query("studentProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", me._id))
      .first();

    if (!studentProfile) {
      throw new Error("Student profile not found");
    }

    const records = await ctx.db
      .query("attendanceRecords")
      .withIndex("by_studentUserId", (q) => q.eq("studentUserId", me._id))
      .collect();

    const perSubject = new Map<
      string,
      {
        subject: string;
        present: number;
        total: number;
      }
    >();

    for (const record of records) {
      const session = await ctx.db.get(record.sessionId);
      if (!session) continue;

      const current = perSubject.get(session.subject) ?? {
        subject: session.subject,
        present: 0,
        total: 0,
      };

      current.total += 1;
      if (record.status === "present") current.present += 1;

      perSubject.set(session.subject, current);
    }

    const subjectWise = Array.from(perSubject.values())
      .map((item) => ({
        ...item,
        percentage:
          item.total > 0
            ? Number(((item.present / item.total) * 100).toFixed(2))
            : 0,
      }))
      .sort((a, b) => a.subject.localeCompare(b.subject));

    const totalClasses = subjectWise.reduce((sum, item) => sum + item.total, 0);
    const totalPresent = subjectWise.reduce(
      (sum, item) => sum + item.present,
      0,
    );

    const overallPercentage =
      totalClasses > 0
        ? Number(((totalPresent / totalClasses) * 100).toFixed(2))
        : 0;

    return {
      student: {
        fullname: me.fullname,
        dept: studentProfile.dept,
        class: studentProfile.class,
        rollno: studentProfile.rollno,
      },
      overall: {
        present: totalPresent,
        total: totalClasses,
        percentage: overallPercentage,
      },
      subjectWise,
    };
  },
});

// Admin/Teacher report view
export const getAttendanceReport = query({
  args: {
    dept: v.string(),
    class: v.string(),
    subject: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await requireTeacherOrAdmin(ctx);

    if (actor.role === "teacher" && args.subject) {
      await validateAttendanceAccess(ctx, actor, args.dept, args.subject);
    }

    const studentProfiles = await ctx.db
      .query("studentProfiles")
      .withIndex("by_dept_class", (q) =>
        q.eq("dept", args.dept).eq("class", args.class),
      )
      .collect();

    const result = await Promise.all(
      studentProfiles.map(async (profile) => {
        const user = await ctx.db.get(profile.userId);
        if (!user) return null;

        const records = await ctx.db
          .query("attendanceRecords")
          .withIndex("by_studentUserId", (q) => q.eq("studentUserId", user._id))
          .collect();

        let filteredTotal = 0;
        let filteredPresent = 0;

        for (const record of records) {
          const session = await ctx.db.get(record.sessionId);
          if (!session) continue;

          if (session.dept !== args.dept || session.class !== args.class)
            continue;
          if (args.subject && session.subject !== args.subject) continue;

          filteredTotal += 1;
          if (record.status === "present") filteredPresent += 1;
        }

        return {
          userId: user._id,
          fullname: user.fullname,
          rollno: profile.rollno,
          present: filteredPresent,
          total: filteredTotal,
          percentage:
            filteredTotal > 0
              ? Number(((filteredPresent / filteredTotal) * 100).toFixed(2))
              : 0,
        };
      }),
    );

    return result
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.rollno.localeCompare(b.rollno));
  },
});
