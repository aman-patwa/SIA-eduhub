import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

async function requireIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity;
}

async function getDbUser(ctx: QueryCtx | MutationCtx, clerkId: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .first();
}

async function requireAdminOrTeacher(ctx: QueryCtx | MutationCtx) {
  const identity = await requireIdentity(ctx);
  const me = await getDbUser(ctx, identity.subject);

  if (!me) throw new Error("User not found");
  if (me.role !== "admin" && me.role !== "teacher") {
    throw new Error("Not authorized");
  }

  return me;
}

export const createExam = mutation({
  args: {
    dept: v.string(),
    class: v.string(),
    subject: v.string(),
    examDate: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    room: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const me = await requireAdminOrTeacher(ctx);

    const dept = args.dept.trim();
    const className = args.class.trim();
    const subject = args.subject.trim();
    const examDate = args.examDate.trim();
    const startTime = args.startTime.trim();
    const endTime = args.endTime.trim();
    const room = args.room?.trim() || undefined;

    if (
      !dept ||
      !className ||
      !subject ||
      !examDate ||
      !startTime ||
      !endTime
    ) {
      throw new Error("All required fields must be filled");
    }

    if (me.role === "teacher") {
      const teacherProfile = await ctx.db
        .query("teacherProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", me._id))
        .first();

      const allowedDepts = teacherProfile?.depts ?? [];
      const allowedSubjects = teacherProfile?.subjects ?? [];

      if (!allowedDepts.includes(dept)) {
        throw new Error("Teacher not allowed for this department");
      }

      if (!allowedSubjects.includes(subject)) {
        throw new Error("Teacher not allowed for this subject");
      }
    }

    await ctx.db.insert("exams", {
      dept,
      class: className,
      subject,
      examDate,
      startTime,
      endTime,
      room,
      createdByUserId: me._id,
      createdAt: Date.now(),
    });
  },
});

export const listStudentExams = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const me = await getDbUser(ctx, identity.subject);

    if (!me) return [];
    if (me.role !== "student") return [];

    const studentProfile = await ctx.db
      .query("studentProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", me._id))
      .first();

    if (!studentProfile) return [];

    const exams = await ctx.db
      .query("exams")
      .withIndex("by_dept_class_examDate", (q) =>
        q.eq("dept", studentProfile.dept).eq("class", studentProfile.class),
      )
      .collect();

    return exams.sort((a, b) => {
      const aKey = `${a.examDate} ${a.startTime}`;
      const bKey = `${b.examDate} ${b.startTime}`;
      return aKey.localeCompare(bKey);
    });
  },
});

export const listStaffExams = query({
  args: {
    dept: v.optional(v.string()),
    class: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const me = await requireAdminOrTeacher(ctx);

    let exams = await ctx.db.query("exams").collect();

    if (me.role === "teacher") {
      const teacherProfile = await ctx.db
        .query("teacherProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", me._id))
        .first();

      const allowedDepts = teacherProfile?.depts ?? [];
      const allowedSubjects = teacherProfile?.subjects ?? [];

      exams = exams.filter(
        (exam) =>
          allowedDepts.includes(exam.dept) &&
          allowedSubjects.includes(exam.subject),
      );
    }

    if (args.dept) exams = exams.filter((exam) => exam.dept === args.dept);
    if (args.class) exams = exams.filter((exam) => exam.class === args.class);

    exams.sort((a, b) => {
      const aKey = `${a.examDate} ${a.startTime}`;
      const bKey = `${b.examDate} ${b.startTime}`;
      return aKey.localeCompare(bKey);
    });

    const enriched = await Promise.all(
      exams.map(async (exam) => {
        const creator = await ctx.db.get(exam.createdByUserId);
        return {
          ...exam,
          createdByName: creator?.fullname ?? creator?.username ?? "Staff",
        };
      }),
    );

    return enriched;
  },
});

export const deleteExam = mutation({
  args: {
    examId: v.id("exams"),
  },
  handler: async (ctx, args) => {
    const me = await requireAdminOrTeacher(ctx);
    const exam = await ctx.db.get(args.examId);

    if (!exam) throw new Error("Exam not found");

    if (me.role === "teacher") {
      const teacherProfile = await ctx.db
        .query("teacherProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", me._id))
        .first();

      const allowedDepts = teacherProfile?.depts ?? [];
      const allowedSubjects = teacherProfile?.subjects ?? [];

      if (
        !allowedDepts.includes(exam.dept) ||
        !allowedSubjects.includes(exam.subject)
      ) {
        throw new Error("Teacher not allowed to delete this exam");
      }
    }

    await ctx.db.delete(args.examId);
  },
});
