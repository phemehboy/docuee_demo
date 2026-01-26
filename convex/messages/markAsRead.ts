import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const markAsRead = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.string(),
  },
  handler: async (ctx, { messageId, userId }) => {
    const message = await ctx.db.get(messageId);
    if (!message) throw new Error("Message not found");

    // Only the recipient can mark it as read
    if (message.to !== userId) {
      throw new Error("Not authorized to mark this message as read");
    }

    await ctx.db.patch(messageId, { read: true });
    return { success: true };
  },
});
