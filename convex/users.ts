// convex/users.ts
import { v } from "convex/values";
import { mutation, MutationCtx, query } from "./_generated/server";

const ADMIN_EMAILS = ["patwaa348@gmail.com"];

async function requireIdentity(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity;
}

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return null;

    const studentProfile = await ctx.db
      .query("studentProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    const teacherProfile = await ctx.db
      .query("teacherProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    const adminProfile = await ctx.db
      .query("adminProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    return { ...user, studentProfile, teacherProfile, adminProfile };
  },
});

// Called by Clerk webhook
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    username: v.string(),
    fullname: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1) prevent duplicate by clerkId
    const existingByClerk = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingByClerk) return;

    // 2) prevent duplicate by email (optional but recommended)
    const existingByEmail = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    if (existingByEmail) return;

    // 3) ensure username unique
    const existingByUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    let finalUsername = args.username;
    if (existingByUsername) {
      finalUsername = `${args.username}${Date.now().toString().slice(-4)}`;
    }

    const emailLower = args.email.toLowerCase();
    const role = ADMIN_EMAILS.includes(emailLower) ? "admin" : "student";

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      username: finalUsername,
      fullname: args.fullname || finalUsername,
      image: args.image || "",
      phone: undefined, // ✅ default
      role,
    });

    // ✅ If this user is admin, create an empty adminProfile (optional but nice)
    if (role === "admin") {
      const existingAdmin = await ctx.db
        .query("adminProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();

      if (!existingAdmin) {
        await ctx.db.insert("adminProfiles", {
          userId,
          createdAt: Date.now(),
          designation: undefined,
          officePhone: undefined,
          permissions: undefined,
          superAdmin: false,
        });
      }
    }
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

    // already exists? update only
    const existing = await ctx.db
      .query("studentProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    const classShort = args.class.trim().toLowerCase();
    const deptShort = args.dept
      .trim()
      .toLowerCase()
      .replace(/\./g, "")
      .replace(/\s/g, "");

    const counterKey = `${classShort}:${deptShort}`;

    if (existing) {
      await ctx.db.patch(existing._id, { dept: args.dept, class: args.class });
      return;
    }

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

    const rollno = `${classShort}${deptShort}${String(nextNumber).padStart(3, "0")}`;

    await ctx.db.insert("studentProfiles", {
      userId: user._id,
      dept: args.dept,
      class: args.class,
      rollno,
    });
  },
});

// ✅ NEW: Update profile (admin/teacher/student — whoever is logged in)
export const updateMyProfile = mutation({
  args: {
    fullname: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);

    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!me) throw new Error("User not found");

    const fullname =
      args.fullname !== undefined ? args.fullname.trim() : undefined;

    const phone = args.phone !== undefined ? args.phone.trim() : undefined;

    await ctx.db.patch(me._id, {
      ...(fullname ? { fullname } : {}),
      ...(args.phone !== undefined ? { phone: phone || undefined } : {}),
    });

    // ✅ keep teacherProfiles.phone synced (optional but clean)
    if (me.role === "teacher") {
      const tp = await ctx.db
        .query("teacherProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", me._id))
        .first();

      if (tp) {
        await ctx.db.patch(tp._id, { phone: phone || undefined });
      }
    }
  },
});
