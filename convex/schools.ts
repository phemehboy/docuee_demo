import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const updateSchool = mutation({
  args: {
    schoolMongoId: v.string(), // MongoDB _id of the school
    name: v.optional(v.string()),
    location: v.optional(v.string()),
    type: v.optional(v.string()),
    motto: v.optional(v.string()),
    currentSemesterId: v.optional(v.string()),
    currentSemester: v.optional(v.string()),
    currentSession: v.optional(v.string()),
    logo: v.optional(v.string()),
    projectCreditUnit: v.optional(v.number()),
  },
  handler: async (
    ctx,
    {
      schoolMongoId,
      name,
      location,
      type,
      motto,
      currentSemesterId,
      currentSemester,
      currentSession,
      projectCreditUnit,
    }
  ) => {
    // Find existing school by schoolMongoId
    const existing = await ctx.db
      .query("schools")
      .withIndex("by_school_mongo_id", (q) =>
        q.eq("schoolMongoId", schoolMongoId)
      )
      .first();

    if (!existing) throw new Error("School not found.");

    // Build update object dynamically
    const updateData: Record<string, any> = { updatedAt: Date.now() };
    if (name) updateData.name = name;
    if (location) updateData.location = location;
    if (type) updateData.type = type;
    if (motto) updateData.motto = motto;
    if (currentSemesterId) updateData.currentSemesterId = currentSemesterId;
    if (currentSemester) updateData.currentSemester = currentSemester;
    if (currentSession) updateData.currentSession = currentSession;
    if (projectCreditUnit) updateData.projectCreditUnit = projectCreditUnit;

    // Patch existing school in Convex
    await ctx.db.patch(existing._id, updateData);

    return { ...existing, ...updateData };
  },
});

export const createSchool = mutation({
  args: {
    schoolMongoId: v.optional(v.string()), // reference to MongoDB _id
    name: v.optional(v.string()),
    adminId: v.string(),
    location: v.optional(v.string()),
    type: v.optional(v.string()),
    motto: v.optional(v.string()),
    projectCreditUnit: v.optional(v.number()),
    promotionHistory: v.array(
      v.object({
        date: v.number(),
        promotedBy: v.id("users"),
        filters: v.object({
          department: v.optional(v.string()),
          program: v.optional(v.string()),
          level: v.optional(v.string()),
        }),
      })
    ),
  },
  handler: async (ctx, args) => {
    const school = await ctx.db.insert("schools", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { id: school, success: true };
  },
});
