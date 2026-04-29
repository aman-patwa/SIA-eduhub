/**
 * Description:
 * This backend file handles admin and teacher operations
 * related to student applications.
 * It includes authentication checks, listing applications,
 * updating status, and deleting applications.
 */

import { v } from "convex/values";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";

// ================================
// AUTHENTICATION HELPERS
// ================================

/**
 * Verifies whether the user is logged in
 */
async function requireIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Not authenticated");
  }

  return identity;
}

/**
 * Verifies whether current user is
 * admin or teacher
 */
async function requireAdminOrTeacher(ctx: QueryCtx | MutationCtx) {
  const identity = await requireIdentity(ctx);

  /**
   * Fetch user from database
   */
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!user) {
    throw new Error("User not found");
  }

  /**
   * Role-based authorization
   */
  if (user.role !== "admin" && user.role !== "teacher") {
    throw new Error("Not authorized");
  }

  return { identity, user };
}

// ================================
// LIST APPLICATIONS
// ================================

/**
 * Fetch all applications with optional filters
 */
export const listApplications = query({
  args: {
    dept: v.optional(v.string()),
    class: v.optional(v.string()),
    status: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    // Access control
    await requireAdminOrTeacher(ctx);

    /**
     * Fetch all applications
     * ordered by latest first
     */
    let apps = await ctx.db.query("applications").order("desc").collect();

    /**
     * Apply filters
     */
    if (args.dept) {
      apps = apps.filter((a) => a.dept === args.dept);
    }

    if (args.class) {
      apps = apps.filter((a) => a.class === args.class);
    }

    if (args.status) {
      apps = apps.filter((a) => a.status === args.status);
    }

    return apps;
  },
});

// ================================
// UPDATE APPLICATION STATUS
// ================================

/**
 * Update application status
 * Example: approved / rejected / pending
 */
export const updateApplicationStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    status: v.string(),
    adminNote: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    // Access control
    await requireAdminOrTeacher(ctx);

    /**
     * Update application record
     */
    await ctx.db.patch(args.applicationId, {
      status: args.status,
      adminNote: args.adminNote,
    });
  },
});

// ================================
// DELETE APPLICATION
// ================================

/**
 * Deletes selected application
 */
export const deleteApplication = mutation({
  args: {
    applicationId: v.id("applications"),
  },

  handler: async (ctx, args) => {
    // Reuse access guard
    await requireAdminOrTeacher(ctx);

    /**
     * Remove application record
     */
    await ctx.db.delete(args.applicationId);
  },
});
