import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAssignmentsByStudent = query({
  args: { studentClerkId: v.string() },
  handler: async (ctx, args) => {
    const assignments = await ctx.db.query("task_assignments").collect();

    // Filter by whether the studentClerkId is in the studentIds array
    const studentAssignments = assignments.filter((a) =>
      a.studentIds.includes(args.studentClerkId)
    );

    // Enrich each with its MongoDB courseId (the actual ObjectId)
    return await Promise.all(
      studentAssignments.map(async (a) => {
        const course = await ctx.db.get(a.courseId);
        return {
          _id: a._id,
          assignmentTitle: a.assignmentTitle,
          courseMongoId: course?.courseId ?? null,
          tasks: a.tasks,
          deadline: a.deadline,
          instructorId: a.instructorId,
          readonly: a.readonly || false,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
        };
      })
    );
  },
});

export const getAssignmentsByInstructor = query({
  args: { instructorId: v.string() },
  handler: async (ctx, args) => {
    const assignments = await ctx.db
      .query("task_assignments")
      .withIndex("by_instructor", (q) =>
        q.eq("instructorId", args.instructorId)
      )
      .order("desc")
      .collect();

    // Enrich with MongoDB courseId and include assignmentId (_id)
    return await Promise.all(
      assignments.map(async (a) => {
        const course = await ctx.db.get(a.courseId);
        return {
          _id: a._id, // ✅ Include assignment Convex ID
          assignmentTitle: a.assignmentTitle,
          courseMongoId: course?.courseId ?? null,
          instructorId: a.instructorId,
          tasks: a.tasks,
          studentIds: a.studentIds,
          readonly: a.readonly || false,
          deadline: a.deadline,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
        };
      })
    );
  },
});

export const getAssignmentsByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("task_assignments")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
  },
});

export const getAssignmentsForStudent = query({
  args: { courseId: v.id("courses"), studentId: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("task_assignments")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    return all.filter((a) => a.studentIds.includes(args.studentId));
  },
});

export const updateAssignmentReadonly = mutation({
  args: {
    assignmentId: v.id("task_assignments"),
    readonly: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.assignmentId, {
      readonly: args.readonly,
      updatedAt: Date.now(),
    });
  },
});
