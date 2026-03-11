// convex/notices.ts
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
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

// ✅ Student: notices only for own department
export const listMyDeptNotices = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const me = await getDbUser(ctx, identity.subject);
    if (!me) return [];

    const studentProfile = await ctx.db
      .query("studentProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", me._id))
      .first();

    const dept = studentProfile?.dept;
    if (!dept) return [];

    const notices = await ctx.db
      .query("notices")
      .withIndex("by_dept_createdAt", (q) => q.eq("dept", dept))
      .order("desc")
      .take(50);

    const enriched = await Promise.all(
      notices.map(async (notice) => {
        const creator = await ctx.db.get(notice.createdByUserId);
        return {
          ...notice,
          createdByName: creator?.fullname ?? creator?.username ?? "Staff",
        };
      }),
    );

    return enriched;
  },
});

// ✅ Teacher/Admin: list notices they can see
export const listStaffNotices = query({
  args: {
    dept: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const me = await getDbUser(ctx, identity.subject);
    if (!me) return [];

    if (me.role !== "teacher" && me.role !== "admin") {
      throw new Error("Not allowed");
    }

    let notices: Doc<"notices">[] = [];

    if (me.role === "admin") {
      if (args.dept) {
        notices = await ctx.db
          .query("notices")
          .withIndex("by_dept_createdAt", (q) => q.eq("dept", args.dept!))
          .order("desc")
          .take(50);
      } else {
        notices = await ctx.db.query("notices").order("desc").take(50);
      }
    } else {
      const teacherProfile = await ctx.db
        .query("teacherProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", me._id))
        .first();

      const allowedDepts = teacherProfile?.depts ?? [];
      if (allowedDepts.length === 0) return [];

      const grouped = await Promise.all(
        allowedDepts.map((dept) =>
          ctx.db
            .query("notices")
            .withIndex("by_dept_createdAt", (q) => q.eq("dept", dept))
            .order("desc")
            .take(20),
        ),
      );

      notices = grouped.flat() as Doc<"notices">[];

      if (args.dept) {
        notices = notices.filter((n) => n.dept === args.dept);
      }

      notices.sort((a, b) => b.createdAt - a.createdAt);
      notices = notices.slice(0, 50);
    }

    const enriched = await Promise.all(
      notices.map(async (notice) => {
        const creator = await ctx.db.get(notice.createdByUserId as Id<"users">);

        return {
          ...notice,
          createdByName: creator?.fullname ?? "Staff",
        };
      }),
    );

    return enriched;
  },
});

// ✅ Teacher/Admin: create notice
export const createNotice = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    dept: v.string(),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const me = await getDbUser(ctx, identity.subject);

    if (!me) throw new Error("User not found");
    if (me.role !== "teacher" && me.role !== "admin") {
      throw new Error("Not allowed");
    }

    const title = args.title.trim();
    const body = args.body.trim();
    const dept = args.dept.trim();

    if (!title) throw new Error("Title is required");
    if (!body) throw new Error("Body is required");
    if (!dept) throw new Error("Department is required");

    if (me.role === "teacher") {
      const teacherProfile = await ctx.db
        .query("teacherProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", me._id))
        .first();

      const allowed = teacherProfile?.depts || [];
      if (!allowed.includes(dept)) {
        throw new Error("Teacher not allowed to post for this department");
      }
    }

    await ctx.db.insert("notices", {
      title,
      body,
      dept,
      attachments: args.attachments?.filter(Boolean) ?? [],
      createdByUserId: me._id,
      createdAt: Date.now(),
    });
  },
});
