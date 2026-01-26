import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const logAIInsertion = mutation({
  args: {
    projectId: v.id("projects"),
    projectMongoId: v.string(),

    userClerkId: v.optional(v.string()),
    userMongoId: v.optional(v.string()),

    actionType: v.union(
      v.literal("GENERATE_OUTLINE"),
      v.literal("SUMMARIZE_STAGE"),
      v.literal("FIND_STAGE_GAPS"),
      v.literal("CHECK_TONE"),
      v.literal("STRUCTURE_SECTION"),
      v.literal("EXPLAIN_SECTION"),
      v.literal("IMPROVE_CLARITY"),
      v.literal("FIND_GAPS")
    ),
    stageKey: v.string(),

    editorNodeId: v.string(),

    originalTextHash: v.string(),
    originalTextLength: v.number(),
  },

  handler: async (ctx, args) => {
    if (!args.userMongoId) {
      throw new Error("Unauthorized: Missing user identity");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("byMongoId", (q) => q.eq("mongoUserId", args.userMongoId))
      .first();

    if (!user || user.subscriptionType !== "pro") {
      throw new Error("Unauthorized: Pro subscription required");
    }

    const insertionId = await ctx.db.insert("aiInsertions", {
      ...args,
      insertedAt: Date.now(),
    });

    await ctx.db.insert("aiContentState", {
      aiInsertionId: insertionId,

      currentTextHash: args.originalTextHash,
      currentTextLength: args.originalTextLength,
      stageKey: args.stageKey,

      editCount: 0,
      wasDeleted: false,
      editIntensity: "NONE",

      updatedAt: Date.now(),
    });
  },
});

export const updateAIContentState = mutation({
  args: {
    editorNodeId: v.string(),

    currentTextHash: v.optional(v.string()),
    currentTextLength: v.optional(v.number()),

    wasDeleted: v.boolean(),

    editIntensity: v.optional(
      v.union(
        v.literal("NONE"),
        v.literal("LOW"),
        v.literal("MEDIUM"),
        v.literal("HIGH")
      )
    ),
  },

  handler: async (ctx, args) => {
    console.log("🟢 updateAIContentState CALLED", args);

    // 1️⃣ Find AI insertion
    const insertion = await ctx.db
      .query("aiInsertions")
      .withIndex("by_editorNodeId", (q) =>
        q.eq("editorNodeId", args.editorNodeId)
      )
      .unique();

    if (!insertion) {
      console.log("🔴 NO INSERTION FOUND", args.editorNodeId);
      return;
    }

    console.log("🟢 insertion FOUND", insertion._id);

    // 2️⃣ Find content state
    const contentState = await ctx.db
      .query("aiContentState")
      .withIndex("by_insertion", (q) => q.eq("aiInsertionId", insertion._id))
      .unique();

    if (!contentState) {
      console.log("🔴 NO CONTENT STATE FOUND", insertion._id);
      return;
    }

    console.log("🟢 contentState BEFORE", contentState);

    const now = Date.now();

    const updates: any = {
      wasDeleted: args.wasDeleted,
      updatedAt: now,
    };

    // 3️⃣ EDIT LOGIC
    if (!args.wasDeleted && args.currentTextHash && args.currentTextLength) {
      console.log("🟡 ENTERED EDIT BLOCK");

      updates.currentTextHash = args.currentTextHash;
      updates.currentTextLength = args.currentTextLength;

      console.log("🔎 HASH COMPARE", {
        incoming: args.currentTextHash,
        stored: contentState.currentTextHash,
        same: args.currentTextHash === contentState.currentTextHash,
      });

      if (args.currentTextHash !== contentState.currentTextHash) {
        console.log("🟢 HASH CHANGED → increment editCount");

        updates.editCount = contentState.editCount + 1;
        updates.lastEditAt = now;

        if (!contentState.firstEditAt) {
          updates.firstEditAt = now;
        }
      } else {
        console.log("🟠 HASH DID NOT CHANGE");
      }
    } else {
      console.log("🔴 SKIPPED EDIT BLOCK", {
        wasDeleted: args.wasDeleted,
        currentTextHash: args.currentTextHash,
        currentTextLength: args.currentTextLength,
      });
    }

    if (args.editIntensity) {
      updates.editIntensity = args.editIntensity;
    }

    console.log("🧩 FINAL UPDATES", updates);

    await ctx.db.patch(contentState._id, updates);

    console.log("✅ PATCH APPLIED");
  },
});
