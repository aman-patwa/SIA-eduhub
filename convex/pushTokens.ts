// convex/pushTokens.ts
import { v } from "convex/values";
import { mutation, MutationCtx } from "./_generated/server";

async function requireIdentity(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity;
}

export const upsertMyPushToken = mutation({
  args: {
    token: v.string(),
    platform: v.union(v.literal("android"), v.literal("ios")),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);

    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!me) throw new Error("User not found");

    const existing = await ctx.db
      .query("pushTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        userId: me._id,
        platform: args.platform,
        updatedAt: Date.now(),
      });
      return;
    }

    await ctx.db.insert("pushTokens", {
      userId: me._id,
      token: args.token,
      platform: args.platform,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const removeMyPushToken = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);

    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!me) throw new Error("User not found");

    const existing = await ctx.db
      .query("pushTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (existing && existing.userId === me._id) {
      await ctx.db.delete(existing._id);
    }
  },
});
