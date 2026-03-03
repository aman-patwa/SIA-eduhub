// convex/notices.ts
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

// ✅ Student: list notices for their dept (from studentProfiles)
export const listMyDeptNotices = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const me = await getDbUser(ctx, identity.subject);
    if (!me) return [];

    // Student dept comes from studentProfiles
    const studentProfile = await ctx.db
      .query("studentProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", me._id))
      .first();

    const dept = studentProfile?.dept;
    if (!dept) return [];

    return await ctx.db
      .query("notices")
      .withIndex("by_dept_createdAt", (q) => q.eq("dept", dept))
      .order("desc")
      .take(50);
  },
});

// ✅ Teacher/Admin: create notice for a specific dept
export const createNotice = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    dept: v.string(), // ✅ required now because teacher can have multiple depts
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const me = await getDbUser(ctx, identity.subject);

    if (!me) throw new Error("User not found");
    if (me.role !== "teacher" && me.role !== "admin") {
      throw new Error("Not allowed");
    }

    // If teacher, ensure dept is in their allowed depts
    if (me.role === "teacher") {
      const teacherProfile = await ctx.db
        .query("teacherProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", me._id))
        .first();

      const allowed = teacherProfile?.depts || [];
      if (!allowed.includes(args.dept)) {
        throw new Error("Teacher not allowed to post for this department");
      }
    }

    await ctx.db.insert("notices", {
      title: args.title,
      body: args.body,
      dept: args.dept,
      attachments: args.attachments,
      createdByUserId: me._id, // ✅ matches schema
      createdAt: Date.now(),
    });
  },
});
