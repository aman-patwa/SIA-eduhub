// convex/applications.ts
import { v } from "convex/values";
import { mutation, MutationCtx, query } from "./_generated/server";

async function requireIdentity(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity;
}

export const createApplication = mutation({
  args: {
    type: v.string(), // railway | bonafide | result
    title: v.string(),
    reason: v.optional(v.string()),
    fromStation: v.optional(v.string()),
    toStation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");
    if (user.role !== "student") throw new Error("Only students can apply");

    const profile = await ctx.db
      .query("studentProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (!profile?.dept || !profile?.class || !profile?.rollno) {
      throw new Error("Complete your profile first");
    }

    await ctx.db.insert("applications", {
      userId: user._id,

      type: args.type,
      title: args.title,

      dept: profile.dept,
      class: profile.class,
      rollno: profile.rollno,

      reason: args.reason,
      fromStation: args.fromStation,
      toStation: args.toStation,

      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const myApplications = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return [];

    return await ctx.db
      .query("applications")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});
