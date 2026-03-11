// convex/internalPush.ts
import { v } from "convex/values";
import { query } from "./_generated/server";

export const getStudentTokensByDept = query({
  args: {
    dept: v.string(),
  },
  handler: async (ctx, args) => {
    const studentProfiles = await ctx.db
      .query("studentProfiles")
      .withIndex("by_dept_class", (q) => q.eq("dept", args.dept))
      .collect();

    const userIds = new Set(studentProfiles.map((p) => p.userId));

    const allTokens = await ctx.db.query("pushTokens").collect();

    return allTokens.filter((t) => userIds.has(t.userId)).map((t) => t.token);
  },
});
