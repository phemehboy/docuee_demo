import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const addStudentToCourse = mutation({
  args: {
    courseId: v.string(), // mongo _id of the course
    clerkId: v.string(), // clerk id of the student
  },
  handler: async (ctx, { courseId, clerkId }) => {
    const course = await ctx.db
      .query("courses")
      .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
      .unique();

    if (!course) throw new Error("Course not found");

    const updatedStudents = new Set(course.students ?? []);
    updatedStudents.add(clerkId);

    await ctx.db.patch(course._id, {
      students: Array.from(updatedStudents),
      updatedAt: Date.now(),
    });
  },
});

export const getCourseByMongoId = query({
  args: { courseId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("courses")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .unique();
  },
});

export const bulkAddOrUpdateCourses = mutation({
  args: {
    courses: v.array(
      v.object({
        courseId: v.string(),
        title: v.string(),
        code: v.string(),
        description: v.optional(v.string()),
        school: v.optional(v.string()),
        schoolId: v.optional(v.string()),
        semester: v.optional(v.string()),
        semesterId: v.optional(v.string()),
        session: v.optional(v.string()),
        department: v.optional(v.string()),
        departmentId: v.optional(v.string()),
        level: v.optional(v.string()),
        program: v.optional(v.string()),
        programType: v.optional(v.string()),
        levelId: v.optional(v.string()),
        createdBy: v.string(),
        instructors: v.optional(v.array(v.string())),
        students: v.optional(v.array(v.string())),
        studyMode: v.optional(
          v.array(v.object({ id: v.string(), name: v.string() }))
        ),
        creditUnits: v.optional(v.number()),
        courseType: v.union(v.literal("core"), v.literal("elective")),
      })
    ),
  },
  handler: async (ctx, { courses }) => {
    for (const c of courses) {
      const existing = await ctx.db
        .query("courses")
        .withIndex("by_courseId", (q) => q.eq("courseId", c.courseId))
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, { ...c, updatedAt: Date.now() });
      } else {
        await ctx.db.insert("courses", { ...c, createdAt: Date.now() });
      }
    }
  },
});

export const addOrUpdateCourseFromMongo = mutation({
  args: {
    courseId: v.string(),
    title: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    school: v.optional(v.string()),
    schoolId: v.optional(v.string()),
    semester: v.optional(v.string()),
    semesterId: v.optional(v.string()),
    session: v.optional(v.string()),
    department: v.optional(v.string()),
    departmentId: v.optional(v.string()),
    level: v.optional(v.string()),
    program: v.optional(v.string()),
    programType: v.optional(v.string()),
    levelId: v.optional(v.string()),
    createdBy: v.string(),
    instructors: v.optional(v.array(v.string())),
    students: v.optional(v.array(v.string())),
    studyMode: v.optional(
      v.array(
        v.object({
          id: v.string(),
          name: v.string(),
        })
      )
    ),
    creditUnits: v.optional(v.number()),
    courseType: v.union(v.literal("core"), v.literal("elective")),
  },
  handler: async (ctx, args) => {
    const existingTask = await ctx.db
      .query("courses")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .first();

    if (existingTask) {
      await ctx.db.patch(existingTask._id, {
        ...args,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("courses", {
        ...args,
        createdAt: Date.now(),
      });
    }
  },
});

//

export const listCoursesForUser = query({
  args: {
    search: v.optional(v.string()),
    role: v.optional(v.string()),
    departmentIds: v.array(v.string()),
    levelIds: v.array(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (
    ctx,
    { search, role, departmentIds, levelIds, paginationOpts }
  ) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) throw new ConvexError("Unauthorized");

    const userId = user.subject;

    const matchDeptAndLevel = (course: any) =>
      departmentIds.includes(course.departmentId) &&
      levelIds.includes(course.levelId);

    // 🔍 If search is present, use search index
    if (search) {
      const results = await ctx.db
        .query("courses")
        .withSearchIndex("search_course_title", (q) =>
          q.search("title", search)
        )
        .collect();

      let filtered = results.filter(matchDeptAndLevel);

      // If instructor, filter courses they are assigned to
      if (role === "instructor") {
        filtered = filtered.filter((course) =>
          course.instructors?.includes(userId)
        );
      }

      return {
        page: filtered.slice(0, paginationOpts.numItems ?? 5),
        isDone: true,
        continueCursor: "",
      };
    }

    // 📚 No search: Get all courses and apply filters
    const allCourses = await ctx.db.query("courses").collect();

    let filtered = allCourses.filter(matchDeptAndLevel);

    if (role === "instructor") {
      filtered = filtered.filter((course) =>
        course.instructors?.includes(userId)
      );
    }

    return {
      page: filtered.slice(0, paginationOpts.numItems ?? 5),
      isDone: true,
      continueCursor: "",
    };
  },
});

export const getCourseAccessMeta = query({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, { courseId }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");

    const course = await ctx.db.get(courseId);
    if (!course) throw new Error("Course not found");

    const userId = user.subject;

    // If the user is the creator/admin
    if (course.createdBy === userId) {
      return { readonly: false };
    }

    // If user is in instructors list
    if (course.instructors?.includes(userId)) {
      return { readonly: false };
    }

    // If user is in students list
    if (course.students?.includes(userId)) {
      return { readonly: true }; // students can't edit the course
    }

    // If not in any role or was removed from the course
    return { readonly: true };
  },
});
