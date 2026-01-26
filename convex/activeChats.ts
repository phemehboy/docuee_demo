import { mutation, query } from "./_generated/server";

export const setChatActive = mutation(
  async (
    { db },
    {
      userId,
      otherUserId,
      isActive,
    }: { userId: string; otherUserId: string; isActive: boolean }
  ) => {
    const existing = await db
      .query("activeChats")
      .withIndex("byUser", (q) =>
        q.eq("userId", userId).eq("otherUserId", otherUserId)
      )
      .first();

    if (existing) {
      await db.patch(existing._id, {
        isActive,
        updatedAt: Date.now(),
      });
    } else {
      await db.insert("activeChats", {
        userId,
        otherUserId,
        isActive,
        updatedAt: Date.now(),
      });
    }
  }
);

export const isChatActive = query(
  async (
    { db },
    { userId, otherUserId }: { userId: string; otherUserId: string }
  ) => {
    const active = await db
      .query("activeChats")
      .withIndex("byUser", (q) =>
        q.eq("userId", userId).eq("otherUserId", otherUserId)
      )
      .first();
    return active?.isActive ?? false;
  }
);
