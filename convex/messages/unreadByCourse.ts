import { v } from "convex/values";
import { query } from "../_generated/server";

export const getUnreadMessagesByCourse = query({
  args: { courseId: v.string() },
  handler: async (ctx, { courseId }) => {
    const msgs = await ctx.db
      .query("messages")
      .withIndex("byContext", (q) =>
        q.eq("contextType", "course").eq("contextId", courseId)
      )
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    const counts: Record<string, number> = {};

    for (const msg of msgs) {
      // msg.from = Mongo userId
      const userDoc = await ctx.db
        .query("users")
        .withIndex("byMongoId", (q) => q.eq("mongoUserId", msg.from))
        .unique();

      if (!userDoc?.clerkId) continue;

      const clerkId = userDoc.clerkId;
      counts[clerkId] = (counts[clerkId] ?? 0) + 1;
    }

    return counts; // { clerkId1: 3, clerkId2: 1, ... }
  },
});

export const unreadByCourse = query({
  args: {
    courseId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, { courseId, userId }) => {
    return await ctx.db
      .query("messages")
      .withIndex("byContext", (q) =>
        q.eq("contextType", "course").eq("contextId", courseId)
      )
      .filter((q) => q.eq(q.field("to"), userId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect()
      .then((msgs) => msgs.length);
  },
});
