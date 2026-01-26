import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createNotification = mutation({
  args: {
    clerkId: v.string(), // ✅ renamed to general clerkId
    projectId: v.id("projects"),
    message: v.string(),
    type: v.string(), // e.g. "submission"
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("notifications", {
      ...args,
      read: false,
      createdAt: Date.now(),
    });
  },
});

export const getUserNotifications = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return await ctx.db
      .query("notifications")
      .withIndex("byClerk", (q) => q.eq("clerkId", clerkId))
      .filter((q) => q.eq(q.field("read"), false))
      .order("desc")
      .collect();
  },
});

export const markNotificationRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    await ctx.db.patch(notificationId, {
      read: true,
    });
  },
});
