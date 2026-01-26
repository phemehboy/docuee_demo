import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const markAsRead = mutation({
  args: {
    updateId: v.id("courseUpdates"),
    userId: v.string(),
  },
  handler: async (ctx, { updateId, userId }) => {
    const update = await ctx.db.get(updateId);
    if (!update) throw new Error("Update not found");

    if (!update.readBy.includes(userId)) {
      await ctx.db.patch(updateId, { readBy: [...update.readBy, userId] });
    }

    return { success: true };
  },
});
