// file: /convex/ai/queries.ts
import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * Fetch all AI content states for a given project.
 * Includes insertion info for editorNodeId, actionType, and user.
 */
export const getAIContentStatesForProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    // 1️⃣ Get all insertions for the project
    const insertions = await ctx.db
      .query("aiInsertions")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    // 2️⃣ Fetch content states for each insertion
    const results: Array<any> = [];

    for (const ins of insertions) {
      const contentState = await ctx.db
        .query("aiContentState")
        .withIndex("by_insertion", (q) => q.eq("aiInsertionId", ins._id))
        .unique();

      if (contentState) {
        results.push({
          ...contentState,
          editorNodeId: ins.editorNodeId,
          actionType: ins.actionType,
          userClerkId: ins.userClerkId,
        });
      }
    }

    return results;
  },
});
