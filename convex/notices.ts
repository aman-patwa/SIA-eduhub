// convex/notices.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function requireIdentity(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity;
}

async function getDbUser(ctx: any, clerkId: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", clerkId))
    .first();
}

export const listMyDeptNotices = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const me = await getDbUser(ctx, identity.subject);
    if (!me?.dept) return [];

    return await ctx.db
      .query("notices")
      .withIndex("by_dept_createdAt", (q) => q.eq("dept", me.dept!))
      .order("desc")
      .take(50);
  },
});

export const createNotice = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const me = await getDbUser(ctx, identity.subject);

    if (!me) throw new Error("User not found");
    if (me.role !== "teacher" && me.role !== "admin") {
      throw new Error("Not allowed");
    }
    if (!me.dept) throw new Error("Teacher dept not set");

    await ctx.db.insert("notices", {
      title: args.title,
      body: args.body,
      dept: me.dept,
      attachments: args.attachments,
      createdByClerkId: me.clerkId,
      createdAt: Date.now(),
    });
  },
});
