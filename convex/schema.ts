// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    fullname: v.string(),
    username: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.union(
      v.literal("student"),
      v.literal("teacher"),
      v.literal("admin"),
    ),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_username", ["username"]),

  studentProfiles: defineTable({
    userId: v.id("users"),
    dept: v.string(),
    class: v.string(),
    rollno: v.string(),
    parentName: v.optional(v.string()),
    parentPhone: v.optional(v.string()),
    address: v.optional(v.string()),
    dob: v.optional(v.string()),
    documents: v.optional(v.array(v.string())),
  })
    .index("by_userId", ["userId"])
    .index("by_dept_class", ["dept", "class"]),

  teacherProfiles: defineTable({
    userId: v.id("users"),
    phone: v.optional(v.string()),
    depts: v.array(v.string()),
    subjects: v.array(v.string()),
  }).index("by_userId", ["userId"]),

  // ✅ NEW: Admin-only table
  // Use this ONLY for fields that are strictly admin-specific.
  adminProfiles: defineTable({
    userId: v.id("users"),

    // examples of admin-only fields:
    designation: v.optional(v.string()), // e.g. "HOD", "Principal", "Office Staff"
    officePhone: v.optional(v.string()),
    permissions: v.optional(v.array(v.string())), // e.g. ["MANAGE_TEACHERS", "MANAGE_NOTICES"]
    superAdmin: v.optional(v.boolean()), // multi-admin system later
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  counters: defineTable({
    key: v.string(),
    value: v.number(),
  }).index("by_key", ["key"]),

  notices: defineTable({
    title: v.string(),
    body: v.string(),
    dept: v.string(),
    attachments: v.optional(v.array(v.string())),
    createdByUserId: v.id("users"),
    createdAt: v.number(),
  }).index("by_dept_createdAt", ["dept", "createdAt"]),

  applications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    dept: v.string(),
    class: v.string(),
    rollno: v.string(),
    reason: v.optional(v.string()),
    fromStation: v.optional(v.string()),
    toStation: v.optional(v.string()),
    status: v.string(),
    adminNote: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  pushTokens: defineTable({
    userId: v.id("users"),
    token: v.string(),
    platform: v.union(v.literal("android"), v.literal("ios")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_token", ["token"]),
  attendanceSessions: defineTable({
    teacherUserId: v.id("users"),
    dept: v.string(),
    class: v.string(),
    subject: v.string(),
    sessionDate: v.string(), // YYYY-MM-DD
    createdAt: v.number(),
  })
    .index("by_teacher_date", ["teacherUserId", "sessionDate"])
    .index("by_dept_class_subject_date", [
      "dept",
      "class",
      "subject",
      "sessionDate",
    ])
    .index("by_dept_class_date", ["dept", "class", "sessionDate"]),

  attendanceRecords: defineTable({
    sessionId: v.id("attendanceSessions"),
    studentUserId: v.id("users"),
    status: v.union(v.literal("present"), v.literal("absent")),
    markedAt: v.number(),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_studentUserId", ["studentUserId"])
    .index("by_session_student", ["sessionId", "studentUserId"]),

  exams: defineTable({
    dept: v.string(),
    class: v.string(),
    subject: v.string(),
    examDate: v.string(), // YYYY-MM-DD
    startTime: v.string(), // HH:mm
    endTime: v.string(), // HH:mm
    room: v.optional(v.string()),
    createdByUserId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_dept_class_examDate", ["dept", "class", "examDate"])
    .index("by_creator", ["createdByUserId"]),
});
