import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getSubmissionsByCourseId = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const taskAssignments = await ctx.db
      .query("task_assignments")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    const allSubmissions = await Promise.all(
      taskAssignments.flatMap((assignment) =>
        ctx.db
          .query("task_submissions")
          .withIndex("by_task", (q) =>
            q.eq("taskAssignmentId", assignment._id).gt("taskIndex", -1)
          )
          .collect()
          .then((subs) =>
            Promise.all(
              subs.map(async (sub) => {
                // Get task title from assignment.tasks[taskIndex]
                const task = assignment.tasks?.[sub.taskIndex] || {
                  title: "Untitled",
                };

                // Optionally get student name (e.g., from a 'users' table if you have one)
                // Or from Clerk metadata (stubbed here)
                const studentName = `Student ${sub.studentId.slice(0, 5)}`;

                return {
                  ...sub,
                  assignmentTitle: assignment.assignmentTitle,
                  taskTitle: task.title,
                  studentName,
                };
              })
            )
          )
      )
    );

    return allSubmissions.flat();
  },
});

export const submitStudentTask = mutation({
  args: {
    taskAssignmentId: v.id("task_assignments"),
    taskIndex: v.number(),
    studentId: v.string(),
    answerText: v.optional(v.string()),
    attachments: v.optional(v.array(v.string())),
    maxGrade: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Fetch assignment
    const assignment = await ctx.db.get(args.taskAssignmentId);
    if (!assignment) throw new Error("Assignment not found");

    // 2. Check deadline
    if (assignment.deadline && Date.now() > assignment.deadline) {
      throw new Error("Deadline has passed. You can no longer submit.");
    }

    // 3. Look for existing submission
    const existing = await ctx.db
      .query("task_submissions")
      .withIndex("by_task", (q) =>
        q
          .eq("taskAssignmentId", args.taskAssignmentId)
          .eq("taskIndex", args.taskIndex)
      )
      .filter((q) => q.eq(q.field("studentId"), args.studentId))
      .first();

    if (existing) {
      if (existing.status !== "submitted") {
        throw new Error(
          "You can no longer edit this answer because grading has started."
        );
      }

      await ctx.db.patch(existing._id, {
        answerText: args.answerText,
        attachments: args.attachments ?? [],
        submittedAt: Date.now(),
        maxGrade: args.maxGrade,
      });
    } else {
      // First submission
      await ctx.db.insert("task_submissions", {
        ...args,
        submittedAt: Date.now(),
        createdAt: Date.now(),
        status: "submitted",
      });

      // 🔒 Lock the assignment once first student submits
      if (!assignment.readonly) {
        await ctx.db.patch(args.taskAssignmentId, { readonly: true });
      }
    }
  },
});

export const markFirstSubmissionNotified = mutation({
  args: {
    taskAssignmentId: v.id("task_assignments"),
  },
  handler: async (ctx, args) => {
    // 1. Fetch assignment
    const assignment = await ctx.db.get(args.taskAssignmentId);
    if (!assignment) throw new Error("Assignment not found");

    if (!assignment.firstSubmissionNotified) {
      await ctx.db.patch(assignment._id, { firstSubmissionNotified: true });
    }
  },
});

export const getStudentSubmissions = query({
  args: {
    taskAssignmentId: v.id("task_assignments"),
    studentId: v.string(),
  },
  handler: async (ctx, args) => {
    const taskAssignment = await ctx.db.get(args.taskAssignmentId);

    if (!taskAssignment) {
      throw new Error("Task assignment not found");
    }

    const submissions = await ctx.db
      .query("task_submissions")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();

    const filteredSubmissions = submissions.filter(
      (s) => s.taskAssignmentId === args.taskAssignmentId
    );

    return {
      submissions: filteredSubmissions,
      instructorId: taskAssignment.instructorId,
    };
  },
});

export const getAssignmentStatusesForStudent = query({
  args: {
    studentId: v.string(),
  },
  handler: async (ctx, args) => {
    const submissions = await ctx.db
      .query("task_submissions")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();

    const statusMap: Record<string, string> = {};

    for (const sub of submissions) {
      const key = sub.taskAssignmentId;
      const current = statusMap[key];

      if (sub.status === "graded") {
        statusMap[key] = "Graded";
      } else if (sub.status === "marking" && current !== "Graded") {
        statusMap[key] = "Grading";
      } else if (sub.status === "submitted" && !current) {
        statusMap[key] = "Submitted";
      }
    }

    return statusMap; // { assignmentId: "Graded" | "Grading" | "Submitted" }
  },
});
