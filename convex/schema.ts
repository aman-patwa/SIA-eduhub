// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    username: v.string(),
    fullname: v.string(),
    image: v.string(),

    role: v.union(
      v.literal("student"),
      v.literal("teacher"),
      v.literal("admin"),
    ),

    // onboarding / profile
    dept: v.optional(v.string()),
    class: v.optional(v.string()),
    rollno: v.optional(v.string()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_dept_role", ["dept", "role"]),

  counters: defineTable({
    key: v.string(), // e.g. "CS:FY" (dept:class)
    value: v.number(),
  }).index("by_key", ["key"]),

  notices: defineTable({
    title: v.string(),
    body: v.string(),
    dept: v.string(), // dept-wise broadcast

    attachments: v.optional(v.array(v.string())), // URLs
    createdByClerkId: v.string(),
    createdAt: v.number(),
  }).index("by_dept_createdAt", ["dept", "createdAt"]),
});
