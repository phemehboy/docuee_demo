import { internalAction } from "../_generated/server";
import { api } from "../_generated/api";
import { v } from "convex/values";

export const notifyUser = internalAction({
  args: {
    clerkId: v.string(),
    projectId: v.id("projects"),
    message: v.string(),
    type: v.union(
      v.literal("submission"),
      v.literal("resubmission"),
      v.literal("approval"),
      v.literal("comment"),
      v.literal("mention"),
      v.literal("reminder"),
      v.literal("general"),
      v.literal("fine_paid") // ✅ Now supported
    ),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(api.notifications.createNotification, {
      clerkId: args.clerkId,
      projectId: args.projectId,
      message: args.message,
      type: args.type,
    });
  },
});
