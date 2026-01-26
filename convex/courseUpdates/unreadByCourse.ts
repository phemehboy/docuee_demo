import { v } from "convex/values";
import { query } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export const unreadByCourse = query({
  args: {
    courseId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const courseId = args.courseId as Id<"courses">;

    const updates = await ctx.db
      .query("courseUpdates")
      .withIndex("by_course", (q) => q.eq("courseId", courseId))
      .collect();

    return updates.filter((update) => !update.readBy.includes(args.userId))
      .length;
  },
});
