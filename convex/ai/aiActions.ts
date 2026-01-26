import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const logAIAction = mutation({
  args: {
    projectId: v.id("projects"),
    projectMongoId: v.string(),

    userClerkId: v.string(),
    userMongoId: v.optional(v.string()),

    actionType: v.union(
      v.literal("STRUCTURE_SECTION"),
      v.literal("EXPLAIN_SECTION"),
      v.literal("IMPROVE_CLARITY"),
      v.literal("FIND_GAPS")
    ),

    usedSelection: v.boolean(),
    selectionLength: v.optional(v.number()),
    documentLength: v.number(),
  },

  handler: async (ctx, args) => {
    await ctx.db.insert("aiActions", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
