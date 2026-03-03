import { v } from "convex/values";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";

// ---------- AUTH HELPERS ----------

async function requireIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity;
}

async function requireAdminOrTeacher(ctx: QueryCtx | MutationCtx) {
  const identity = await requireIdentity(ctx);

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!user) throw new Error("User not found");

  if (user.role !== "admin" && user.role !== "teacher") {
    throw new Error("Not authorized");
  }

  return { identity, user };
}

// ---------- LIST APPLICATIONS ----------

export const listApplications = query({
  args: {
    dept: v.optional(v.string()),
    class: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdminOrTeacher(ctx);

    let apps = await ctx.db.query("applications").order("desc").collect();

    if (args.dept) apps = apps.filter((a) => a.dept === args.dept);
    if (args.class) apps = apps.filter((a) => a.class === args.class);
    if (args.status) apps = apps.filter((a) => a.status === args.status);

    return apps;
  },
});

// ---------- UPDATE STATUS ----------

export const updateApplicationStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    status: v.string(),
    adminNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdminOrTeacher(ctx);

    await ctx.db.patch(args.applicationId, {
      status: args.status,
      adminNote: args.adminNote,
    });
  },
});

export const deleteApplication = mutation({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    await requireAdminOrTeacher(ctx); // reuse your existing guard

    await ctx.db.delete(args.applicationId);
  },
});
