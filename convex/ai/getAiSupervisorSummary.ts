// convex/ai/getAISupervisorSummary.ts
import { v } from "convex/values";
import { query } from "../_generated/server";

export const getAISupervisorSummary = query({
  args: {
    projectId: v.id("projects"),
    stageKey: v.string(),
  },

  handler: async (ctx, { projectId, stageKey }) => {
    // Filter insertions by projectId AND stageKey
    const insertions = await ctx.db
      .query("aiInsertions")
      .withIndex("by_project_stage", (q) =>
        q.eq("projectId", projectId).eq("stageKey", stageKey)
      )
      .collect();

    if (insertions.length === 0) {
      return {
        totalInsertions: 0,
        deletedCount: 0,
        untouchedCount: 0,
        editedCount: 0,
        intensityBreakdown: {
          NONE: 0,
          LOW: 0,
          MEDIUM: 0,
          HIGH: 0,
        },
        byAction: {},
        editRate: 0,
      };
    }

    const states = await Promise.all(
      insertions.map((i) =>
        ctx.db
          .query("aiContentState")
          .withIndex("by_insertion", (q) => q.eq("aiInsertionId", i._id))
          .first()
      )
    );

    let deletedCount = 0;
    let untouchedCount = 0;
    let editedCount = 0;

    const intensityBreakdown = {
      NONE: 0,
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
    };

    const byAction: Record<
      string,
      {
        total: number;
        edited: number;
        deleted: number;
      }
    > = {};

    insertions.forEach((ins, idx) => {
      const state = states[idx];
      if (!state) return;

      // Initialize action bucket
      if (!byAction[ins.actionType]) {
        byAction[ins.actionType] = {
          total: 0,
          edited: 0,
          deleted: 0,
        };
      }

      byAction[ins.actionType].total += 1;

      if (state.wasDeleted) {
        deletedCount++;
        byAction[ins.actionType].deleted += 1;
        return;
      }

      intensityBreakdown[state.editIntensity]++;

      if (state.editIntensity === "NONE") {
        untouchedCount++;
      } else {
        editedCount++;
        byAction[ins.actionType].edited += 1;
      }
    });

    const editRate =
      insertions.length > 0 ? editedCount / insertions.length : 0;

    return {
      totalInsertions: insertions.length,
      deletedCount,
      untouchedCount,
      editedCount,
      intensityBreakdown,
      byAction,
      editRate,
    };
  },
});

// export const getAISupervisorSummary = query({
//   args: {
//     projectId: v.id("projects"),
//     stageKey: v.string(),
//   },

//   handler: async (ctx, { projectId }) => {
//     const insertions = await ctx.db
//       .query("aiInsertions")
//       .withIndex("by_project", (q) => q.eq("projectId", projectId))
//       .collect();

//     if (insertions.length === 0) {
//       return {
//         totalInsertions: 0,
//         deletedCount: 0,
//         untouchedCount: 0,
//         editedCount: 0,
//         intensityBreakdown: {
//           NONE: 0,
//           LOW: 0,
//           MEDIUM: 0,
//           HIGH: 0,
//         },
//         byAction: {},
//         editRate: 0,
//       };
//     }

//     const states = await Promise.all(
//       insertions.map((i) =>
//         ctx.db
//           .query("aiContentState")
//           .withIndex("by_insertion", (q) => q.eq("aiInsertionId", i._id))
//           .first()
//       )
//     );

//     let deletedCount = 0;
//     let untouchedCount = 0;
//     let editedCount = 0;

//     const intensityBreakdown = {
//       NONE: 0,
//       LOW: 0,
//       MEDIUM: 0,
//       HIGH: 0,
//     };

//     const byAction: Record<
//       string,
//       {
//         total: number;
//         edited: number;
//         deleted: number;
//       }
//     > = {};

//     insertions.forEach((ins, idx) => {
//       const state = states[idx];
//       if (!state) return;

//       // Initialize action bucket
//       if (!byAction[ins.actionType]) {
//         byAction[ins.actionType] = {
//           total: 0,
//           edited: 0,
//           deleted: 0,
//         };
//       }

//       byAction[ins.actionType].total += 1;

//       if (state.wasDeleted) {
//         deletedCount++;
//         byAction[ins.actionType].deleted += 1;
//         return;
//       }

//       intensityBreakdown[state.editIntensity]++;

//       if (state.editIntensity === "NONE") {
//         untouchedCount++;
//       } else {
//         editedCount++;
//         byAction[ins.actionType].edited += 1;
//       }
//     });

//     const editRate =
//       insertions.length > 0 ? editedCount / insertions.length : 0;

//     return {
//       totalInsertions: insertions.length,
//       deletedCount,
//       untouchedCount,
//       editedCount,
//       intensityBreakdown,
//       byAction,
//       editRate,
//     };
//   },
// });
