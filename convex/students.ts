import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createStudent = mutation({
  args: {
    userId: v.string(), // Clerk authentication ID
    school: v.optional(v.string()),
    department: v.optional(v.string()),
    level: v.optional(v.string()),
    program: v.optional(v.string()),
    studyMode: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("graduated"))),
    admissionNumber: v.optional(v.string()),
    cohortSerial: v.optional(v.number()),
    semester: v.optional(v.string()),
    session: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("students", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getStudentsByCourse = query({
  args: {
    courseId: v.string(),
    departmentId: v.string(),
    levelId: v.string(),
    program: v.string(),
    schoolId: v.string(),
    semesterId: v.string(),
    session: v.string(),
    studyModeIds: v.array(v.string()),
    status: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    console.log("🔍 QUERY ARGS:", args);

    const statusValue = args.status ?? "active";

    // If no studyModes provided, no result possible
    if (!args.studyModeIds.length) {
      console.warn("⚠️ No studyModeIds provided.");
      return [];
    }

    //
    // ─── 0️⃣ FETCH COURSE TO RESOLVE STUDYMODE NAMES ───────────────────────
    //
    const course = await ctx.db
      .query("courses")
      .withIndex(
        "by_courseId",
        (q) => q.eq("courseId", args.courseId) // adjust if different lookup needed
      )
      .unique()
      .catch(() => null);

    // Build lookup map
    const studyModeLookup: Record<string, string> = {};

    if (course?.studyMode?.length) {
      for (const mode of course.studyMode) {
        studyModeLookup[mode.id] = mode.name;
      }
    }

    //
    // ─── 1️⃣ QUERY USING LIGHTWEIGHT INDEX ────────────────────────────────
    //
    const rawMatches = (
      await Promise.all(
        args.studyModeIds.map((modeId) =>
          ctx.db
            .query("students")
            .withIndex("by_course_match", (q) =>
              q
                .eq("school", args.schoolId)
                .eq("department", args.departmentId)
                .eq("level", args.levelId)
                .eq("program", args.program)
                .eq("semester", args.semesterId)
                .eq("session", args.session)
                .eq("studyMode", modeId)
            )
            .filter((q) => q.eq(q.field("status"), statusValue))
            .collect()
        )
      )
    ).flat();

    console.log(`📌 RAW STUDENT COUNT: ${rawMatches.length}`);

    //
    // ─── 2️⃣ CHECK MISMATCHES ──────────────────────────────────────────────
    //
    const assertMatch = (
      label: string,
      actual: string | undefined,
      expected: string,
      userId: string
    ) => {
      if (actual !== expected) {
        console.warn(
          `⚠️ FIELD MISMATCH (${label}) for student ${userId}: ${actual} != ${expected}`
        );
      }
    };

    rawMatches.forEach((s) => {
      assertMatch("level", s.level, args.levelId, s.userId);
      assertMatch("program", s.program, args.program, s.userId);
      assertMatch("semester", s.semester, args.semesterId, s.userId);
      assertMatch("session", s.session, args.session, s.userId);
    });

    //
    // ─── 3️⃣ REMOVE DUPLICATES ─────────────────────────────────────────────
    //
    const uniqueByUser = new Map(rawMatches.map((s) => [s.userId, s]));
    const uniqueStudents = [...uniqueByUser.values()];

    console.log(`🎯 UNIQUE STUDENTS: ${uniqueStudents.length}`);

    //
    // ─── 4️⃣ ENRICH USERS ──────────────────────────────────────────────────
    //
    const enriched = await Promise.all(
      uniqueStudents.map(async (student) => {
        const user = await ctx.db
          .query("users")
          .withIndex("byMongoId", (q) => q.eq("mongoUserId", student.userId))
          .unique();

        if (!user) {
          console.warn(
            `⚠️ USER NOT FOUND for student record: ${student.userId}`
          );
          return null;
        }

        return {
          id: user.clerkId,
          userId: student.userId,
          name:
            `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
            "Unknown",
          email: user.email ?? "Unknown",
          imageUrl: user.picture ?? "",
          status: student.status,
          studyModeId: student.studyMode,
          studyModeName: studyModeLookup[student.studyMode ?? ""] ?? "Unknown",
        };
      })
    );

    //
    // ─── 5️⃣ CLEAN OUTPUT ─────────────────────────────────────────────────
    //
    const finalList = enriched.filter(Boolean);

    console.log(`🚀 FINAL RETURN COUNT: ${finalList.length}`);

    return finalList;
  },
});
