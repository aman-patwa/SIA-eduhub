/**
 * Description:
 * This backend file allows the admin to complete
 * the teacher profile after the Clerk account is created.
 * It updates the user role and stores teacher-specific
 * information in the teacherProfiles table.
 */

import { v } from "convex/values";
import { mutation, MutationCtx } from "./_generated/server";

// ================================
// ADMIN AUTHORIZATION HELPER
// ================================

/**
 * Checks whether the current user is an admin
 */
async function requireAdmin(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Not authenticated");
  }

  const me = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!me) {
    throw new Error("User not found");
  }

  if (me.role !== "admin") {
    throw new Error("Not authorized");
  }

  return me;
}

// ================================
// COMPLETE TEACHER PROFILE
// ================================

/**
 * After Clerk user creation,
 * this mutation updates the role to teacher
 * and inserts/updates teacher profile details
 */
export const adminCompleteTeacherProfile = mutation({
  args: {
    clerkId: v.string(),
    phone: v.optional(v.string()),
    depts: v.array(v.string()),
    subjects: v.array(v.string()),
  },

  handler: async (ctx, args) => {
    // Ensure only admin can perform this action
    await requireAdmin(ctx);

    // ================================
    // FETCH TEACHER USER
    // ================================

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("Teacher user not found in Convex yet");
    }

    // ================================
    // UPDATE USER ROLE
    // ================================

    /**
     * Update role in users table
     */
    await ctx.db.patch(user._id, {
      role: "teacher",
    });

    // ================================
    // CHECK EXISTING TEACHER PROFILE
    // ================================

    const existing = await ctx.db
      .query("teacherProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    // ================================
    // PREPARE PROFILE DATA
    // ================================

    const payload = {
      userId: user._id,
      phone: args.phone?.trim() || undefined,
      depts: args.depts,
      subjects: args.subjects,
    };

    // ================================
    // UPSERT PROFILE
    // ================================

    /**
     * Update existing profile
     */
    if (existing) {
      await ctx.db.patch(existing._id, {
        phone: payload.phone,
        depts: payload.depts,
        subjects: payload.subjects,
      });
    } else {

    /**
     * Insert new profile
     */
      await ctx.db.insert("teacherProfiles", payload);
    }
  },
});
