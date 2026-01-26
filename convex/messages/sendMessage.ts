import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const setTyping = mutation({
  args: {
    from: v.string(),
    to: v.string(),
    isTyping: v.boolean(),
  },
  handler: async (ctx, { from, to, isTyping }) => {
    const existing = await ctx.db
      .query("typingStatus")
      .withIndex("byUsers", (q) => q.eq("from", from).eq("to", to))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isTyping,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("typingStatus", {
        from,
        to,
        isTyping,
        updatedAt: Date.now(),
      });
    }
  },
});

export const getTypingStatus = query({
  args: {
    from: v.string(),
    to: v.string(),
  },
  handler: async (ctx, { from, to }) => {
    const status = await ctx.db
      .query("typingStatus")
      .withIndex("byUsers", (q) => q.eq("from", from).eq("to", to))
      .first();

    if (!status) return { isTyping: false };

    // Optional: auto-clear if it's stale (e.g. >10s ago)
    if (Date.now() - status.updatedAt > 10000) {
      return { isTyping: false };
    }

    return { isTyping: status.isTyping };
  },
});

export const sendMessage = mutation({
  args: {
    from: v.string(),
    to: v.string(),
    content: v.string(),
    contextType: v.optional(
      v.union(v.literal("direct"), v.literal("course"), v.literal("project"))
    ),
    contextId: v.optional(v.string()),
    senderRole: v.optional(
      v.union(
        v.literal("schoolAdmin"),
        v.literal("instructor"),
        v.literal("supervisor"),
        v.literal("student")
      )
    ),
  },
  handler: async (
    ctx,
    { senderRole, from, to, content, contextType, contextId }
  ) => {
    // 🔹 Fetch recipient user to check their role
    const recipient = await ctx.db
      .query("users")
      .withIndex("byMongoId", (q) => q.eq("mongoUserId", to))
      .first();
    if (!recipient) throw new Error("Recipient not found");

    const sender = await ctx.db
      .query("users")
      .withIndex("byMongoId", (q) => q.eq("mongoUserId", from))
      .first();
    if (!sender) throw new Error("Sender not found");

    // 🔹 Narrow the sender role to valid types
    const validRoles = [
      "schoolAdmin",
      "instructor",
      "supervisor",
      "student",
    ] as const;
    const senderRoleForRes = validRoles.includes(sender.userType as any)
      ? (sender.userType as (typeof validRoles)[number])
      : senderRole; // fallback if userType is missing

    // 🔹 Restrict: students cannot message school admins
    if (
      senderRoleForRes === "student" &&
      recipient.userType === "schoolAdmin"
    ) {
      throw new Error("Students cannot message school admins");
    }

    // 🔹 Insert message if allowed
    return await ctx.db.insert("messages", {
      from,
      to,
      content,
      timestamp: Date.now(),
      read: false,
      delivered: false,
      contextType: contextType ?? "direct",
      contextId: contextId ?? undefined,
      senderRole: senderRoleForRes,
    });
  },
});

export const listMessages = query({
  args: {
    userA: v.string(),
    userB: v.string(),
    contextType: v.optional(
      v.union(v.literal("direct"), v.literal("course"), v.literal("project"))
    ),
    contextId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userA, userB, contextType, contextId } = args;

    // Pull both directions
    const aToB = await ctx.db
      .query("messages")
      .withIndex("byConversation", (q) => q.eq("from", userA).eq("to", userB))
      .collect();

    const bToA = await ctx.db
      .query("messages")
      .withIndex("byConversation", (q) => q.eq("from", userB).eq("to", userA))
      .collect();

    let items = [...aToB, ...bToA];

    // Optional hybrid filter (if provided)
    if (contextType) {
      items = items.filter((m) => (m.contextType ?? "direct") === contextType);
      if (contextType !== "direct" && contextId) {
        items = items.filter((m) => m.contextId === contextId);
      }
    }

    items.sort((a, b) => a.timestamp - b.timestamp);
    return items;
  },
});

export const listConversationContexts = query({
  args: { userA: v.string(), userB: v.string() },
  handler: async (ctx, { userA, userB }) => {
    // Fetch all messages between userA and userB
    const aToB = await ctx.db
      .query("messages")
      .withIndex("byConversation", (q) => q.eq("from", userA).eq("to", userB))
      .collect();
    const bToA = await ctx.db
      .query("messages")
      .withIndex("byConversation", (q) => q.eq("from", userB).eq("to", userA))
      .collect();

    const all = [...aToB, ...bToA];

    type Key = string;
    const map = new Map<
      Key,
      {
        contextType: "direct" | "course" | "project";
        contextId?: string;
        count: number;
        lastTimestamp: number;
      }
    >();

    // Group messages by context type + ID
    for (const m of all) {
      const type = (m.contextType ?? "direct") as
        | "direct"
        | "course"
        | "project";
      const id = m.contextId ?? "";
      const key = `${type}::${id}`;

      const prev = map.get(key) ?? {
        contextType: type,
        contextId: id || undefined,
        count: 0,
        lastTimestamp: 0,
      };

      prev.count += 1;
      prev.lastTimestamp = Math.max(prev.lastTimestamp, m.timestamp);
      map.set(key, prev);
    }

    // 🧩 Enrich with names and detect missing contexts
    const values = Array.from(map.values());
    const withNames = await Promise.all(
      values.map(async (ctxItem) => {
        let contextName = "";
        let needsCleanup = false;

        if (ctxItem.contextType === "course" && ctxItem.contextId) {
          const course = await ctx.db
            .query("courses")
            .withIndex("by_courseId", (q) =>
              q.eq("courseId", ctxItem.contextId!)
            )
            .unique();

          if (course) {
            contextName = course.title;
          } else {
            needsCleanup = true;
            contextName = `Deleted Course (${ctxItem.contextId?.slice(0, 6) ?? "N/A"})`;
          }
        } else if (ctxItem.contextType === "project" && ctxItem.contextId) {
          const project = await ctx.db
            .query("projects")
            .withIndex("projectId", (q) =>
              q.eq("projectId", ctxItem.contextId!)
            )
            .unique();

          if (project) {
            contextName = project.title;
          } else {
            needsCleanup = true;
            contextName = `Deleted Project (${ctxItem.contextId?.slice(0, 6) ?? "N/A"})`;
          }
        } else {
          contextName = "Direct Chat";
        }

        return { ...ctxItem, contextName, needsCleanup };
      })
    );

    return withNames.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
  },
});

export const listUnreadMessages = query({
  args: {
    userId: v.string(),
    contextType: v.optional(
      v.union(v.literal("direct"), v.literal("course"), v.literal("project"))
    ),
    contextId: v.optional(v.string()),
  },
  handler: async (ctx, { userId, contextType, contextId }) => {
    if (contextType && contextId) {
      // ✅ Scoped to a specific context (e.g. specific course)
      return await ctx.db
        .query("messages")
        .withIndex("byRecipientContext", (q) =>
          q
            .eq("to", userId)
            .eq("contextType", contextType)
            .eq("contextId", contextId)
        )
        .filter((q) => q.eq(q.field("read"), false))
        .collect();
    }

    if (contextType) {
      // ✅ Scoped to all messages of a given type (all courses or all projects)
      return await ctx.db
        .query("messages")
        .withIndex("byContext", (q) => q.eq("contextType", contextType))
        .filter((q) =>
          q.and(q.eq(q.field("to"), userId), q.eq(q.field("read"), false))
        )
        .collect();
    }

    // ✅ Default: all unread messages for the user
    return await ctx.db
      .query("messages")
      .withIndex("byUnread", (q) => q.eq("to", userId).eq("read", false))
      .collect();
  },
});

export const markMessagesAsRead = mutation({
  args: {
    from: v.string(), // sender of messages
    to: v.string(), // current user
  },
  handler: async (ctx, { from, to }) => {
    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("byConversation", (q) => q.eq("from", from).eq("to", to))
      .collect();

    await Promise.all(
      unreadMessages.map((msg) => ctx.db.patch(msg._id, { read: true }))
    );
  },
});

export const markMessagesAsDelivered = mutation({
  args: { from: v.string(), to: v.string() },
  handler: async (ctx, { from, to }) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("byConversation", (q) => q.eq("from", from).eq("to", to))
      .collect();

    for (const msg of messages) {
      if (!msg.delivered) {
        await ctx.db.patch(msg._id, { delivered: true });
      }
    }
  },
});

// convex/messages.ts
export const listConversationsWithMeta = query({
  args: {
    userId: v.string(),
    contextType: v.optional(
      v.union(v.literal("direct"), v.literal("course"), v.literal("project"))
    ),
    contextId: v.optional(v.string()),
  },
  handler: async (ctx, { userId, contextType, contextId }) => {
    let received, sent;

    // --- 1. Get both received + sent messages depending on filters ---
    if (contextType && contextId) {
      received = await ctx.db
        .query("messages")
        .withIndex("byRecipientContext", (q) =>
          q
            .eq("to", userId)
            .eq("contextType", contextType)
            .eq("contextId", contextId)
        )
        .collect();

      sent = await ctx.db
        .query("messages")
        .withIndex("byContext", (q) =>
          q.eq("contextType", contextType).eq("contextId", contextId)
        )
        .filter((q) => q.eq(q.field("from"), userId))
        .collect();
    } else if (contextType) {
      received = await ctx.db
        .query("messages")
        .withIndex("byContext", (q) => q.eq("contextType", contextType))
        .filter((q) => q.eq(q.field("to"), userId))
        .collect();

      sent = await ctx.db
        .query("messages")
        .withIndex("byContext", (q) => q.eq("contextType", contextType))
        .filter((q) => q.eq(q.field("from"), userId))
        .collect();
    } else {
      received = await ctx.db
        .query("messages")
        .withIndex("byRecipient", (q) => q.eq("to", userId))
        .collect();

      sent = await ctx.db
        .query("messages")
        .withIndex("byConversation", (q) => q.eq("from", userId))
        .collect();
    }

    // const messages = [...received, ...sent];
    const messages = [...received, ...sent].filter(
      (m) => m.from !== m.to // exclude self-conversations
    );

    // --- 2. Build conversation map ---
    type Key = string;
    const map = new Map<
      Key,
      {
        from: string;
        to: string;
        contextType: "direct" | "course" | "project";
        contextId?: string;
        unreadCount: number;
        lastMessage: string;
        lastTimestamp: number;
        lastStatus: "sent" | "delivered" | "read";
      }
    >();

    for (const m of messages) {
      const type = (m.contextType ?? "direct") as
        | "direct"
        | "course"
        | "project";
      const id = m.contextId ?? "";

      // ✅ Make key order-independent for direct chats (so "A-B" and "B-A" are same)
      const key =
        type === "direct"
          ? [m.from, m.to].sort().join("-") + `-${type}-${id}`
          : `${m.from}-${m.to}-${type}-${id}`;

      const prev = map.get(key) ?? {
        from: m.from,
        to: m.to,
        contextType: type,
        contextId: id || undefined,
        unreadCount: 0,
        lastMessage: "",
        lastTimestamp: 0,
        lastStatus: "sent" as "sent" | "delivered" | "read",
      };

      // count unread only for received messages
      if (!m.read && m.to === userId) {
        prev.unreadCount += 1;
      }

      // update last message if newer
      // if (m.timestamp > prev.lastTimestamp) {
      //   prev.lastTimestamp = m.timestamp;
      //   prev.lastMessage = m.content;
      //   if (m.read) prev.lastStatus = "read";
      //   else if (m.delivered) prev.lastStatus = "delivered";
      //   else prev.lastStatus = "sent";
      // }
      if (m.timestamp > prev.lastTimestamp) {
        prev.lastTimestamp = m.timestamp;
        prev.lastMessage = m.content;
        prev.from = m.from; // ✅ ensure from/to reflect latest message direction
        prev.to = m.to;
        if (m.read) prev.lastStatus = "read";
        else if (m.delivered) prev.lastStatus = "delivered";
        else prev.lastStatus = "sent";
      }

      map.set(key, prev);
    }

    // --- 3. Return sorted list ---
    return Array.from(map.values()).sort(
      (a, b) => b.lastTimestamp - a.lastTimestamp
    );
  },
});
