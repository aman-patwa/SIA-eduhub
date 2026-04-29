/**
 * Description:
 * This backend file manages student applications.
 * It allows students to create new applications
 * and view their previously submitted applications.
 */

import { v } from "convex/values";
import { mutation, MutationCtx, query } from "./_generated/server";

// ================================
// AUTHENTICATION HELPER
// ================================

/**
 * Checks whether the user is authenticated
 */
async function requireIdentity(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Not authenticated");
  }

  return identity;
}

// ================================
// CREATE APPLICATION
// ================================

/**
 * Allows only students to create
 * a new application request
 */
export const createApplication = mutation({
  args: {
    type: v.string(), // railway | bonafide | result
    title: v.string(),
    reason: v.optional(v.string()),
    fromStation: v.optional(v.string()),
    toStation: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    // Ensure user is logged in
    const identity = await requireIdentity(ctx);

    // ================================
    // FETCH CURRENT USER
    // ================================

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // ================================
    // ROLE VALIDATION
    // ================================

    /**
     * Only students can submit applications
     */
    if (user.role !== "student") {
      throw new Error("Only students can apply");
    }

    // ================================
    // FETCH STUDENT PROFILE
    // ================================

    const profile = await ctx.db
      .query("studentProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    // ================================
    // PROFILE VALIDATION
    // ================================

    /**
     * Ensure mandatory student details exist
     */
    if (!profile?.dept || !profile?.class || !profile?.rollno) {
      throw new Error("Complete your profile first");
    }

    // ================================
    // INSERT APPLICATION
    // ================================

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

// ================================
// FETCH MY APPLICATIONS
// ================================

/**
 * Returns all applications submitted
 * by the logged-in student
 */
export const myApplications = query({
  args: {},

  handler: async (ctx) => {
    // Get current user identity
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }

    // ================================
    // FETCH CURRENT USER
    // ================================

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return [];
    }

    // ================================
    // FETCH APPLICATION HISTORY
    // ================================

    return await ctx.db
      .query("applications")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});
