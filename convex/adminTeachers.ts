import { v } from "convex/values";
import { mutation, MutationCtx } from "./_generated/server";

async function requireAdmin(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const me = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!me) throw new Error("User not found");
  if (me.role !== "admin") throw new Error("Not authorized");
  return me;
}

// After Clerk user is created (webhook inserts into users),
// admin sets role=teacher + stores teacher info in teacherProfiles
export const adminCompleteTeacherProfile = mutation({
  args: {
    clerkId: v.string(),
    phone: v.optional(v.string()),
    depts: v.array(v.string()),
    subjects: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("Teacher user not found in Convex yet");

    // 1) patch ONLY role in users table
    await ctx.db.patch(user._id, { role: "teacher" });

    // 2) upsert teacherProfiles
    const existing = await ctx.db
      .query("teacherProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    const payload = {
      userId: user._id,
      phone: args.phone?.trim() || undefined,
      depts: args.depts,
      subjects: args.subjects,
    };

    if (existing) {
      await ctx.db.patch(existing._id, {
        phone: payload.phone,
        depts: payload.depts,
        subjects: payload.subjects,
      });
    } else {
      await ctx.db.insert("teacherProfiles", payload);
    }
  },
});
