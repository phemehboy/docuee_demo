import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const markAllAsReadByCourse = mutation({
  args: {
    courseId: v.id("courses"),
    userId: v.string(),
  },
  handler: async (ctx, { courseId, userId }) => {
    const updates = await ctx.db
      .query("courseUpdates")
      .withIndex("by_course", (q) => q.eq("courseId", courseId))
      .collect();

    let updatedCount = 0;
    for (const update of updates) {
      if (!update.readBy.includes(userId)) {
        await ctx.db.patch(update._id, { readBy: [...update.readBy, userId] });
        updatedCount++;
      }
    }

    return { success: true, updated: updatedCount };
  },
});
