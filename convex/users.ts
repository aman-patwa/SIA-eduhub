// convex/user.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ✅ helper: get current Clerk identity
async function requireIdentity(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity; // identity.subject = clerkId
}

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
  },
});

// Called by webhook on user.created
export const createUser = mutation({
  args: {
    username: v.string(),
    fullname: v.string(),
    email: v.string(),
    image: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) return;

    await ctx.db.insert("users", {
      username: args.username,
      fullname: args.fullname,
      email: args.email,
      image: args.image,
      clerkId: args.clerkId,
      role: "student", // default for every signup
    });
  },
});

export const completeStudentProfile = mutation({
  args: {
    dept: v.string(),
    class: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");
    if (user.role !== "student") throw new Error("Only students can do this");

    // ✅ If rollno already assigned, don't increment counters again
    if (user.rollno) {
      await ctx.db.patch(user._id, { dept: args.dept, class: args.class });
      return;
    }

    const classShort = args.class.trim().toLowerCase();
    const deptShort = args.dept
      .trim()
      .toLowerCase()
      .replace(/\./g, "")
      .replace(/\s/g, "");

    const counterKey = `${classShort}:${deptShort}`;

    const counter = await ctx.db
      .query("counters")
      .withIndex("by_key", (q) => q.eq("key", counterKey))
      .first();

    let nextNumber = 1;

    if (!counter) {
      await ctx.db.insert("counters", { key: counterKey, value: 1 });
      nextNumber = 1;
    } else {
      nextNumber = counter.value + 1;
      await ctx.db.patch(counter._id, { value: nextNumber });
    }

    const padded = String(nextNumber).padStart(3, "0");
    const rollno = `${classShort}${deptShort}${padded}`;

    await ctx.db.patch(user._id, {
      dept: args.dept,
      class: args.class,
      rollno,
    });
  },
});
