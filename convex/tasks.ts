import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { Id } from "./_generated/dataModel";

export const pendingByCourse = query({
  args: {
    courseId: v.string(),
    studentId: v.string(), // Clerk ID of student
  },
  handler: async (ctx, args) => {
    const courseId = args.courseId as Id<"courses">;

    // Get all task assignments for this course
    const assignments = await ctx.db
      .query("task_assignments")
      .withIndex("by_course", (q) => q.eq("courseId", courseId))
      .collect();

    let pendingCount = 0;

    const submissions = await ctx.db
      .query("task_submissions")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();

    for (const assignment of assignments) {
      for (let index = 0; index < assignment.tasks.length; index++) {
        const submission = submissions.find(
          (s) => s.taskAssignmentId === assignment._id && s.taskIndex === index
        );

        if (
          !submission ||
          (submission.status !== "submitted" && submission.status !== "graded")
        ) {
          pendingCount++;
        }
      }
    }

    return pendingCount;
  },
});

export const gradeSubmission = mutation({
  args: {
    submissionId: v.id("task_submissions"),
    grade: v.number(),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, { submissionId, grade, feedback }) => {
    const submission = await ctx.db.get(submissionId);
    if (!submission) throw new Error("Submission not found");

    const assignment = await ctx.db.get(submission.taskAssignmentId);
    if (!assignment) throw new Error("Assignment not found");

    const course = await ctx.db.get(assignment.courseId);
    if (!course) throw new Error("Course not found");

    // Prevent grading before deadline
    if (assignment.deadline && Date.now() < assignment.deadline) {
      throw new Error("Cannot grade before deadline");
    }

    // Update current submission with grade
    await ctx.db.patch(submissionId, {
      grade,
      feedback,
      status: "graded",
      gradedAt: Date.now(),
    });

    // Get all submissions for this assignment
    const submissionsForStudent = await ctx.db
      .query("task_submissions")
      .withIndex("by_task", (q) =>
        q.eq("taskAssignmentId", submission.taskAssignmentId)
      )
      .collect();

    // 1️⃣ Filter this student's submissions
    const studentSubmissions = submissionsForStudent.filter(
      (s) => s.studentId === submission.studentId
    );

    // 2️⃣ Separate graded vs ungraded
    const gradedSubmissions = studentSubmissions.filter(
      (s) => s.grade !== undefined
    );
    const remainingSubmissions = studentSubmissions.filter(
      (s) => s.grade === undefined
    );

    // 3️⃣ Calculate average
    const totalScore = gradedSubmissions.reduce(
      (acc, s) => acc + (s.grade ?? 0),
      0
    );
    const totalMax = gradedSubmissions.reduce(
      (acc, s) => acc + (s.maxGrade ?? 100),
      0
    );
    const averageScore = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;

    // 4️⃣ Check if all tasks graded
    const lastTaskGraded = remainingSubmissions.length === 0;

    return {
      lastTaskGraded,
      averageScore,
      studentId: submission.studentId,
      assignmentId: submission.taskAssignmentId,
      courseId: course.courseId,
      assignmentTitle: assignment.assignmentTitle,
      deadline: assignment.deadline,
      session: course.session ?? "N/A",
      semesterId: course.semesterId ?? null,
      creditUnits: course.creditUnits ?? 0,
      instructorId: assignment.instructorId,
    };
  },
});

export const getSubmissionsForAssignment = query({
  args: { taskAssignmentId: v.id("task_assignments") },
  handler: async (ctx, { taskAssignmentId }) => {
    // Fetch the assignment to get instructorId
    const assignment = await ctx.db.get(taskAssignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    // Fetch all submissions for this assignment
    const submissions = await ctx.db
      .query("task_submissions")
      .withIndex("by_task", (q) => q.eq("taskAssignmentId", taskAssignmentId))
      .collect();

    // Add instructorId to each submission
    return submissions.map((s) => ({
      ...s,
      instructorId: assignment.instructorId,
    }));
  },
});

export const getTasksByCourseId = query({
  args: { courseId: v.string() },
  handler: async (ctx, args) => {
    const courseId = args.courseId as Id<"courses">;

    const taskAssignments = await ctx.db
      .query("task_assignments")
      .withIndex("by_course", (q) => q.eq("courseId", courseId))
      .collect();

    const allTasks = taskAssignments.flatMap((assignment) =>
      assignment.tasks.map((task, index) => ({
        ...task,
        assignmentTitle: assignment.assignmentTitle,
        assignmentId: assignment._id,
        taskIndex: index,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
      }))
    );

    return allTasks;
  },
});

export const getAssignmentById = query({
  args: { assignmentId: v.id("task_assignments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.assignmentId);
  },
});

export const updateReadonlyFlag = mutation({
  args: { id: v.id("task_assignments"), readonly: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      readonly: args.readonly,
    });
  },
});

export const getAssignmentsForStudent = query({
  args: { studentId: v.string() },
  handler: async (ctx, args) => {
    const allAssignments = await ctx.db.query("task_assignments").collect();

    const filtered = allAssignments.filter((assignment) =>
      assignment.studentIds.includes(args.studentId)
    );

    return filtered;
  },
});

export const getAssignmentsForInstructor = query({
  args: { instructorId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("task_assignments")
      .withIndex("by_instructor", (q) =>
        q.eq("instructorId", args.instructorId)
      )
      .collect();
  },
});

export const getInstructorTaskAssignments = query({
  args: {
    instructorId: v.string(), // Clerk user ID
  },
  async handler(ctx, { instructorId }) {
    const assignments = await ctx.db
      .query("task_assignments")
      .withIndex("by_instructor", (q) => q.eq("instructorId", instructorId))
      .collect();

    // Flatten out each task with course-level data
    const allTasks = assignments.flatMap((assignment) =>
      assignment.tasks.map((task) => ({
        title: task.title,
        description: task.description,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
        studentIds: assignment.studentIds,
        courseId: assignment.courseId,
      }))
    );

    return {
      totalAssignments: assignments.length,
      total: allTasks.length,
      tasks: allTasks,
    };
  },
});

export const getInstructorAssignmentStatsBySchool = query({
  args: {
    schoolId: v.string(), // school ID or string you stored
  },
  async handler(ctx, { schoolId }) {
    // 1. Fetch all courses manually and filter by school
    const allCourses = await ctx.db.query("courses").collect();

    const schoolCourses = allCourses.filter(
      (course) => course.schoolId === schoolId
    );

    const courseIds = new Set(
      schoolCourses.map((course) => course._id.toString())
    );

    // 2. Get all task assignments
    const allAssignments = await ctx.db.query("task_assignments").collect();

    // 3. Filter to:
    // - assignments in this school (via courseId)
    // - that have tasks
    const relevantAssignments = allAssignments.filter(
      (assignment) =>
        courseIds.has(assignment.courseId.toString()) &&
        assignment.tasks.length > 0
    );

    // 4. Count by instructorId
    const instructorCounts: Record<string, number> = {};
    for (const assignment of relevantAssignments) {
      const instructorId = assignment.instructorId;
      instructorCounts[instructorId] =
        (instructorCounts[instructorId] || 0) + 1;
    }

    return instructorCounts;
  },
});

export const deleteByCourseId = mutation({
  args: {
    courseId: v.string(),
  },
  handler: async (ctx, args) => {
    const { courseId } = args;

    const matching = await ctx.db
      .query("courses")
      .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
      .collect();

    for (const course of matching) {
      await ctx.db.delete(course._id);
    }
  },
});

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    role: v.optional(v.string()),
    levels: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { search, role, levels, paginationOpts }) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    const userId = user.subject;

    // 🔍 INSTRUCTOR with SEARCH
    if (search && role === "instructor") {
      const results = await ctx.db
        .query("courses")
        .withSearchIndex("search_course_title", (q) =>
          q.search("title", search)
        )
        .collect();

      const filteredByInstructor = results.filter((course) =>
        course.instructors?.includes(userId)
      );

      const finalFiltered = levels?.length
        ? filteredByInstructor.filter(
            (course) => course.levelId && levels.includes(course.levelId)
          )
        : filteredByInstructor;

      return {
        page: finalFiltered.slice(0, paginationOpts.numItems ?? 5),
        isDone: true,
        continueCursor: "",
      };
    }

    // 👨‍🏫 INSTRUCTOR: No search, filter by levels and instructor match
    if (role === "instructor") {
      let query = ctx.db.query("courses");

      if (levels && levels.length > 0) {
        const all = await Promise.all(
          levels.map((levelId) =>
            query
              .withIndex("level_Id", (q) => q.eq("levelId", levelId))
              .collect()
          )
        );

        const flattened = all.flat();

        const filteredByInstructor = flattened.filter((course) =>
          course.instructors?.includes(userId)
        );

        return {
          page: filteredByInstructor.slice(0, paginationOpts.numItems ?? 5),
          isDone: true,
          continueCursor: "",
        };
      }

      // No levels selected, just get all and filter by instructor
      const all = await query.collect();

      const filteredByInstructor = all.filter((course) =>
        course.instructors?.includes(userId)
      );

      return {
        page: filteredByInstructor.slice(0, paginationOpts.numItems ?? 5),
        isDone: true,
        continueCursor: "",
      };
    }

    // 🧑‍🎓 STUDENT: with search
    if (search) {
      return await ctx.db
        .query("courses")
        .withSearchIndex("search_course_title", (q) =>
          q.search("title", search).eq("createdBy", user.subject)
        )
        .paginate(paginationOpts);
    }

    // 🧑‍🎓 STUDENT: No search
    return await ctx.db
      .query("courses")
      .withIndex("created_by", (q) => q.eq("createdBy", user.subject))
      .paginate(paginationOpts);
  },
});

export const assignTaskToCourseStudents = mutation({
  args: {
    courseId: v.id("courses"),
    instructorId: v.string(),
    assignmentTitle: v.string(),
    tasks: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        maxGrade: v.number(),
      })
    ),
    studentIds: v.array(v.string()),
    studyModes: v.optional(v.array(v.string())),
    deadline: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // ✅ Insert the new assignment and capture its ID
    const assignmentId = await ctx.db.insert("task_assignments", {
      courseId: args.courseId,
      instructorId: args.instructorId,
      assignmentTitle: args.assignmentTitle,
      tasks: args.tasks,
      studentIds: args.studentIds,
      studyModes: args.studyModes ?? [],
      deadline: args.deadline,
      createdAt: now,
      updatedAt: now,
    });

    // ✅ Return the ID to the caller
    return { assignmentId };
  },
});

export const getAssignedTasksForStudent = query({
  args: {
    studentId: v.string(),
  },
  handler: async (ctx, args) => {
    const allAssignments = await ctx.db.query("task_assignments").collect();

    const filtered = allAssignments.filter((assignment) =>
      assignment.studentIds.includes(args.studentId)
    );

    const courseIds = Array.from(new Set(filtered.map((a) => a.courseId)));

    const coursePromises = courseIds.map((id) =>
      ctx.db
        .query("courses")
        .filter((q) => q.eq(q.field("_id"), id))
        .first()
    );

    const courses = (await Promise.all(coursePromises)).filter(
      Boolean
    ) as Array<{
      _id: Id<"courses">;
      title?: string;
      level?: string;
      department?: string;
    }>;

    const courseMap = new Map(courses.map((course) => [course._id, course]));

    // 🔍 Fetch all submissions for this student
    const studentSubmissions = await ctx.db
      .query("task_submissions")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();

    // 🔁 Map for fast lookup: key = taskAssignmentId|taskIndex
    const submissionMap = new Map(
      studentSubmissions.map((sub) => [
        `${sub.taskAssignmentId}|${sub.taskIndex}`,
        sub,
      ])
    );

    const result = filtered.flatMap((assignment) =>
      assignment.tasks.map((task, index) => {
        const course = courseMap.get(assignment.courseId);
        const key = `${assignment._id}|${index}`;
        const submission = submissionMap.get(key);

        return {
          taskAssignmentId: assignment._id,
          taskIndex: index,
          courseId: assignment.courseId,
          courseTitle: course?.title ?? "",
          assignmentTitle: assignment.assignmentTitle ?? "Untitled Assignment",
          title: task.title,
          description: task.description,
          instructorId: assignment.instructorId,
          createdAt: assignment.createdAt,
          level: course?.level,
          department: course?.department,
          grade: submission?.grade ?? null, // ➕ Include grade if available
        };
      })
    );

    result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return result;
  },
});

export const submitAnswer = mutation({
  args: {
    taskAssignmentId: v.id("task_assignments"),
    taskIndex: v.number(),
    studentId: v.string(),
    answerText: v.optional(v.string()),
    attachments: v.optional(v.array(v.string())),
    status: v.optional(v.union(v.literal("submitted"), v.literal("draft"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const existing = await ctx.db
      .query("task_submissions")
      .filter((q) =>
        q.and(
          q.eq(q.field("taskAssignmentId"), args.taskAssignmentId),
          q.eq(q.field("taskIndex"), args.taskIndex),
          q.eq(q.field("studentId"), args.studentId)
        )
      )
      .first();

    const payload = {
      answerText: args.answerText,
      attachments: args.attachments,
      submittedAt: now,
      status: args.status ?? "submitted",
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload); // ✅ patch instead of update
    } else {
      await ctx.db.insert("task_submissions", {
        ...payload,
        taskAssignmentId: args.taskAssignmentId,
        taskIndex: args.taskIndex,
        studentId: args.studentId,
        createdAt: now,
      });
    }
  },
});

export const getSavedAnswersForStudent = query({
  args: {
    studentId: v.string(),
  },
  handler: async (ctx, { studentId }) => {
    // Fetch all submissions by this student
    const submissions = await ctx.db
      .query("task_submissions")
      .filter((q) => q.eq(q.field("studentId"), studentId))
      .collect();

    // Map to only return the saved answer data relevant for Tiptap
    return submissions.map((submission) => ({
      submissionId: submission._id,
      taskAssignmentId: submission.taskAssignmentId,
      taskIndex: submission.taskIndex,
      answerText: submission.answerText ?? null,
      attachments: submission.attachments ?? [],
      submittedAt: submission.submittedAt ?? null,
      status: submission.status ?? null,
      grade: submission.grade ?? null,
    }));
  },
});

export const saveAnswerDraft = mutation({
  args: {
    taskAssignmentId: v.id("task_assignments"),
    taskIndex: v.number(),
    studentId: v.string(),
    answerText: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("saved_answers")
      .withIndex("by_task", (q) =>
        q
          .eq("taskAssignmentId", args.taskAssignmentId)
          .eq("taskIndex", args.taskIndex)
          .eq("studentId", args.studentId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        answerText: args.answerText,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("saved_answers", {
        taskAssignmentId: args.taskAssignmentId,
        taskIndex: args.taskIndex,
        studentId: args.studentId,
        answerText: args.answerText,
        updatedAt: Date.now(),
      });
    }
  },
});

export const getTasksAndAnswersForInstructorByCourse = query({
  args: {
    id: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const assignments = await ctx.db
      .query("task_assignments")
      .filter((q) => q.eq(q.field("courseId"), args.id))
      .collect();

    const course = await ctx.db.get(args.id);
    if (!course) return [];

    if (assignments.length === 0) return [];

    const submissionPromises = assignments.map((assignment) =>
      ctx.db
        .query("task_submissions")
        .filter((q) => q.eq(q.field("taskAssignmentId"), assignment._id))
        .collect()
    );
    const allSubmissions = (await Promise.all(submissionPromises)).flat();

    const result = [];

    for (const assignment of assignments) {
      for (const studentId of assignment.studentIds) {
        const tasksAndAnswers = assignment.tasks.map((task, index) => {
          const submission = allSubmissions.find(
            (s) =>
              s.taskAssignmentId === assignment._id &&
              s.taskIndex === index &&
              s.studentId === studentId
          );

          return {
            title: task.title,
            description: task.description,
            answerText: submission?.answerText || "",
            attachments: submission?.attachments || [],
            status: submission?.status || "Not submitted",
            _id: submission?._id || null,
            taskAssignmentId: assignment._id,
            grade: submission?.grade ?? null,
            feedback: submission?.feedback ?? "",
            createdAt: submission?.createdAt ?? null,
          };
        });

        // Calculate total and average grade for this student (only if tasks are graded)
        const gradedTasks = tasksAndAnswers.filter(
          (task) => typeof task.grade === "number"
        );

        const totalGrade =
          gradedTasks.length > 0
            ? gradedTasks.reduce((sum, task) => sum + (task.grade || 0), 0)
            : null;

        const averageGrade =
          gradedTasks.length > 0 ? totalGrade! / gradedTasks.length : null;

        result.push({
          assignmentId: assignment._id,
          assignmentTitle: assignment.assignmentTitle ?? "Untitled Assignment",
          studentId,
          tasksAndAnswers,
          department: course.department ?? "N/A",
          level: course.level ?? "N/A",
          school: course.school ?? "N/A",
          courseTitle: course.title ?? "Untitled Course",
          totalGrade,
          averageGrade,
          createdAt:
            tasksAndAnswers.find((t) => t.createdAt)?.createdAt ?? null,
        });
      }
    }

    // ✅ Sort by createdAt (newest first)
    return result.sort((a, b) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },
});

export const deleteSubmission = mutation({
  args: {
    submissionId: v.id("task_submissions"), // Adjust "submissions" to your actual table name
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.submissionId);
  },
});

export const deleteTaskAssignmentAndSubmissions = mutation({
  args: {
    taskAssignmentId: v.id("task_assignments"),
  },
  handler: async (ctx, { taskAssignmentId }) => {
    // 1. Delete all related submissions
    const submissions = await ctx.db
      .query("task_submissions")
      .withIndex("by_task", (q) => q.eq("taskAssignmentId", taskAssignmentId))
      .collect();

    for (const submission of submissions) {
      await ctx.db.delete(submission._id);
    }

    // 2. Delete the task assignment
    await ctx.db.delete(taskAssignmentId);
  },
});

export const saveTotalAndAverageGrade = mutation(
  async (
    { db },
    {
      taskAssignmentId,
      studentId,
      totalGrade,
      averageGrade,
    }: {
      taskAssignmentId: Id<"task_assignments">;
      studentId: string;
      totalGrade: number;
      averageGrade: number;
    }
  ) => {
    const now = Date.now();

    // Check if a total grade entry exists for this student and assignment
    const existing = await db
      .query("total_grades")
      .withIndex("by_assignment_student", (q) =>
        q.eq("taskAssignmentId", taskAssignmentId).eq("studentId", studentId)
      )
      .first();

    if (existing) {
      // Update existing record
      await db.patch(existing._id, {
        totalGrade,
        averageGrade,
        gradedAt: now,
      });
    } else {
      // Create new record
      await db.insert("total_grades", {
        taskAssignmentId,
        studentId,
        totalGrade,
        averageGrade,
        gradedAt: now,
      });
    }

    return { success: true };
  }
);

export const checkIfGraded = query({
  args: {
    taskAssignmentId: v.id("task_assignments"),
    studentId: v.string(),
  },
  handler: async (ctx, { taskAssignmentId, studentId }) => {
    if (!taskAssignmentId || !studentId) {
      console.warn("Missing taskAssignmentId or studentId");
      return false;
    }
    const existingGrade = await ctx.db
      .query("total_grades")
      .withIndex("by_assignment_student", (q) =>
        q.eq("taskAssignmentId", taskAssignmentId).eq("studentId", studentId)
      )
      .first();

    return existingGrade !== null;
  },
});

export const getAssignmentsByCourse = query({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, { courseId }) => {
    const assignment = await ctx.db
      .query("task_assignments")
      .withIndex("by_course", (q) => q.eq("courseId", courseId))
      .first();

    if (!assignment) return null;

    // Check if there are any submissions for this assignment
    const firstSubmission = await ctx.db
      .query("task_submissions")
      .withIndex("by_task", (q) => q.eq("taskAssignmentId", assignment._id))
      .first();

    const hasSubmissions = firstSubmission !== null;

    return {
      id: assignment._id, // include id for client use
      assignmentTitle: assignment.assignmentTitle ?? "Untitled Assignment",
      tasks: assignment.tasks,
      studentIds: assignment.studentIds,
      updatedAt: assignment.updatedAt,
      hasSubmissions,
    };
  },
});

export const getSubmittedTaskIndices = query({
  args: {
    taskAssignmentId: v.id("task_assignments"),
  },
  handler: async (ctx, { taskAssignmentId }) => {
    const submissions = await ctx.db
      .query("task_submissions")
      .withIndex("by_task", (q) => q.eq("taskAssignmentId", taskAssignmentId))
      .collect();

    const submittedIndices = new Set(submissions.map((s) => s.taskIndex));

    return Array.from(submittedIndices); // e.g. [0, 2]
  },
});

export const updateTaskAssignments = mutation({
  args: {
    assignmentId: v.id("task_assignments"), // ✅ NEW
    tasks: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        maxGrade: v.number(),
      })
    ),
    studentIds: v.array(v.string()),
    instructorId: v.string(),
    assignmentTitle: v.optional(v.string()),
    deadline: v.optional(v.number()),
  },
  handler: async (
    ctx,
    { assignmentId, tasks, studentIds, instructorId, assignmentTitle, deadline }
  ) => {
    const existingAssignment = await ctx.db.get(assignmentId);
    if (!existingAssignment) {
      throw new Error(`No task assignment found with id ${assignmentId}`);
    }

    // 🔒 Guard: prevent editing if assignment is readonly
    if (existingAssignment.readonly) {
      throw new Error("This assignment is locked and cannot be edited.");
    }

    await ctx.db.patch(assignmentId, {
      tasks,
      studentIds,
      instructorId,
      ...(assignmentTitle && { assignmentTitle }),
      ...(deadline && { deadline }),
      updatedAt: Date.now(),
    });
  },
});

export const deleteAssignment = mutation({
  args: {
    assignmentId: v.id("task_assignments"),
  },
  handler: async (ctx, { assignmentId }) => {
    await ctx.db.delete(assignmentId);
  },
});

export const updateTaskInAssignment = mutation({
  args: {
    assignmentId: v.id("task_assignments"),
    taskIndex: v.number(), // Index of the task in the tasks array
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    maxGrade: v.number(),
  },
  handler: async (
    ctx,
    { assignmentId, taskIndex, title, description, maxGrade }
  ) => {
    const assignment = await ctx.db.get(assignmentId);

    if (!assignment) {
      throw new Error("Task assignment not found");
    }

    if (taskIndex < 0 || taskIndex >= assignment.tasks.length) {
      throw new Error("Invalid task index");
    }

    const updatedTasks = [...assignment.tasks];
    const existingTask = updatedTasks[taskIndex];

    updatedTasks[taskIndex] = {
      title: title ?? existingTask.title,
      description: description ?? existingTask.description,
      maxGrade: maxGrade ?? existingTask.maxGrade,
    };

    await ctx.db.patch(assignmentId, {
      tasks: updatedTasks,
      updatedAt: Date.now(),
    });
  },
});

export const getCourseById = query({
  args: {
    courseId: v.id("courses"),
  },
  handler: async ({ db }, { courseId }) => {
    if (!courseId) return null;

    const course = await db.get(courseId);
    if (!course) return null;

    return course;
  },
});
