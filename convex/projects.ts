import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { keyToLabel } from "@/lib/stages";

export const updateTopic = mutation({
  args: {
    projectId: v.string(),
    newTopic: v.string(),
  },
  handler: async (ctx, { projectId, newTopic }) => {
    // 1️⃣ Get the project
    const project = await ctx.db
      .query("projects")
      .withIndex("projectId", (q) => q.eq("projectId", projectId))
      .first();
    if (!project) throw new Error("Project not found");

    // 2️⃣ Patch only the title
    await ctx.db.patch(project._id, {
      title: newTopic,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const markFineAsPaid = mutation({
  args: {
    projectId: v.string(),
    stage: v.string(),
  },
  handler: async (ctx, { projectId, stage }) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("projectId", (q) => q.eq("projectId", projectId))
      .first();

    if (!project) throw new Error("Project not found");

    // ✅ Ensure submissionStages exist
    const submissionStages = project.submissionStages || {};

    // ✅ Handle dynamic stage
    const currentStage = submissionStages[stage];
    if (!currentStage) {
      throw new Error(`Stage "${stage}" not found in project`);
    }

    // ✅ Proceed if the stage has a fine
    if (currentStage.fine) {
      currentStage.editableByStudent = true;
      currentStage.fine.isPaid = true;
      currentStage.fine.paidAt = new Date().toISOString();

      // ✅ Save updated stages
      await ctx.db.patch(project._id, {
        submissionStages: { ...submissionStages, [stage]: currentStage },
      });

      // Use the actual label or fallback to the stage key
      const label = keyToLabel(stage);

      // 🔔 Notify student
      if (project.studentClerkId) {
        await ctx.scheduler.runAfter(
          0,
          internal.internal.notifications.notifyUser,
          {
            clerkId: project.studentClerkId,
            projectId: project._id,
            type: "fine_paid",
            message: `✅ You’ve successfully paid the fine for "${label}". You can now edit this stage.`,
          }
        );
      }

      // 🔔 Notify supervisor
      if (project.supervisorClerkId) {
        await ctx.scheduler.runAfter(
          0,
          internal.internal.notifications.notifyUser,
          {
            clerkId: project.supervisorClerkId,
            projectId: project._id,
            type: "fine_paid",
            message: `💰 Fine for "${label}" has been paid by the student.`,
          }
        );
      }
    } else {
      throw new Error(`No fine found for stage "${stage}"`);
    }
  },
});

export const finalizeStagesAndDeadlines = mutation({
  args: {
    projectId: v.id("projects"),
    stages: v.array(
      v.object({
        key: v.string(),
        label: v.string(),
        order: v.number(),
      })
    ),
    deadlines: v.optional(
      v.array(
        v.object({
          stage: v.string(),
          deadline: v.union(v.string(), v.null()),
          fine: v.optional(
            v.object({
              amount: v.number(),
              isPaid: v.boolean(),
            })
          ),
        })
      )
    ),
  },

  handler: async (ctx, { projectId, stages, deadlines }) => {
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");

    const existingStages = project.submissionStages ?? {};
    const updatedStages: typeof existingStages = {};

    /**
     * 1️⃣ Build stages (based on your updateStages logic)
     */
    for (const stage of stages) {
      const existing = existingStages[stage.key] ?? {};

      updatedStages[stage.key] = {
        ...existing,
        order: stage.order,
        content: existing.content ?? "",
        submitted: existing.submitted ?? false,
        editableByStudent: existing.editableByStudent ?? true,

        // preserve all advanced fields
        fine: existing.fine,
        grade: existing.grade,
        completed: existing.completed,
        approvedAt: existing.approvedAt,
        resubmitted: existing.resubmitted,
        resubmittedCount: existing.resubmittedCount,
        deadline: existing.deadline,
      };
    }

    /**
     * 2️⃣ Merge deadlines ONLY for non-journal projects
     */
    if (project.projectType !== "journal" && deadlines) {
      for (const { stage, deadline, fine } of deadlines) {
        const currentStage = updatedStages[stage];
        if (!currentStage) continue;

        currentStage.deadline = deadline ?? undefined;

        if (fine) {
          currentStage.fine = {
            ...currentStage.fine,
            ...fine,
          };
        }
      }
    }

    // Build ordered list of stages by order
    const orderedStages = Object.entries(updatedStages)
      .map(([key, value]) => ({
        key,
        order: value.order ?? 0,
        deadline: value.deadline ? new Date(value.deadline) : undefined,
      }))
      .sort((a, b) => a.order - b.order);

    for (let i = 0; i < orderedStages.length - 1; i++) {
      const current = orderedStages[i];
      const next = orderedStages[i + 1];

      if (
        current.deadline &&
        next.deadline &&
        current.deadline >= next.deadline
      ) {
        throw new Error(
          `Invalid deadline order: "${keyToLabel(
            current.key
          )}" must be earlier than "${keyToLabel(next.key)}".`
        );
      }
    }

    /**
     * 3️⃣ Persist once
     */
    await ctx.db.patch(projectId, {
      submissionStages: updatedStages,
      stagesLockedBySupervisor: true,
      updatedAt: Date.now(),
    });

    /**
     * 4️⃣ Notifications (only for non-journal + deadlines)
     */
    if (
      project.projectType !== "journal" &&
      deadlines &&
      project.studentClerkId
    ) {
      const firstStage = deadlines[0]?.stage;
      const stageLabel = firstStage ? keyToLabel(firstStage) : "a stage";

      const msg =
        deadlines.length === 1
          ? `📅 Your supervisor updated the deadline for "${stageLabel}".`
          : `📅 Your supervisor has set deadlines for all project stages.`;

      await ctx.scheduler.runAfter(
        0,
        internal.internal.notifications.notifyUser,
        {
          clerkId: project.studentClerkId,
          projectId: project._id,
          type: "general",
          message: msg,
        }
      );
    }

    return { success: true };
  },
});

// export const updateStages = mutation({
//   args: {
//     projectId: v.id("projects"),
//     stages: v.array(
//       v.object({
//         key: v.string(),
//         label: v.string(),
//         order: v.number(),
//       })
//     ),
//   },
//   handler: async (ctx, { projectId, stages }) => {
//     const project = await ctx.db.get(projectId);
//     if (!project) throw new Error("Project not found");

//     const existingStages = project.submissionStages ?? {};

//     // Convert array to record keyed by stage.key
//     const updatedStagesRecord: typeof existingStages = {};
//     stages.forEach((stage) => {
//       const existing = existingStages[stage.key] ?? {};
//       updatedStagesRecord[stage.key] = {
//         ...existing,
//         order: stage.order,
//         content: existing.content ?? "",
//         submitted: existing.submitted ?? false,
//         editableByStudent: existing.editableByStudent ?? true,
//         // keep all other existing fields like fine, grade, etc.
//         fine: existing.fine,
//         grade: existing.grade,
//         completed: existing.completed,
//         approvedAt: existing.approvedAt,
//         resubmitted: existing.resubmitted,
//         resubmittedCount: existing.resubmittedCount,
//         deadline: existing.deadline,
//       };
//     });

//     await ctx.db.patch(projectId, {
//       submissionStages: updatedStagesRecord,
//       updatedAt: Date.now(),
//     });

//     return { success: true };
//   },
// });

// export const setDeadlines = mutation({
//   args: {
//     projectId: v.string(),
//     deadlines: v.array(
//       v.object({
//         stage: v.string(),
//         deadline: v.union(v.string(), v.null()), // "YYYY-MM-DD" or null
//         fine: v.optional(
//           v.object({
//             amount: v.number(),
//             isPaid: v.boolean(),
//           })
//         ),
//       })
//     ),
//     mode: v.union(v.literal("single"), v.literal("all")),
//     lock: v.optional(v.boolean()), // lock stages after editing
//   },

//   handler: async (ctx, { projectId, deadlines, mode, lock }) => {
//     const project = await ctx.db
//       .query("projects")
//       .withIndex("projectId", (q) => q.eq("projectId", projectId))
//       .first();

//     if (!project) throw new Error("Project not found");

//     // ✅ Copy the current stages dynamically
//     const updatedStages = { ...project.submissionStages };

//     // ✅ Loop through provided deadlines
//     for (const { stage, deadline, fine } of deadlines) {
//       const currentStage = updatedStages[stage] || {
//         label: stage,
//         content: "",
//         submitted: false,
//         editableByStudent: true,
//       };

//       currentStage.deadline = deadline ?? undefined;

//       if (fine) {
//         currentStage.fine = {
//           ...currentStage.fine,
//           ...fine,
//         };
//       }

//       updatedStages[stage] = currentStage;
//     }

//     // ✅ Save updates
//     await ctx.db.patch(project._id, {
//       submissionStages: updatedStages,
//       stagesLockedBySupervisor: lock ?? false,
//     });

//     // ✅ Notify student dynamically
//     if (project.studentClerkId) {
//       const firstStage = deadlines[0]?.stage;
//       const stageLabel = firstStage ? keyToLabel(firstStage) : "a stage";

//       let msg: string;

//       if (mode === "single") {
//         const deadlineStr = deadlines[0].deadline;
//         const deadlineDate = deadlineStr
//           ? new Date(`${deadlineStr}T00:00:00`).toLocaleDateString("en-US", {
//               weekday: "short",
//               year: "numeric",
//               month: "short",
//               day: "numeric",
//             })
//           : "No deadline";

//         msg = `📅 Your supervisor has updated the deadline for "${stageLabel}" → ${deadlineDate}`;
//       } else {
//         msg = `📅 Your supervisor has set deadlines for all project stages. Please check your timeline for details.`;
//       }

//       await ctx.scheduler.runAfter(
//         0,
//         internal.internal.notifications.notifyUser,
//         {
//           clerkId: project.studentClerkId,
//           projectId: project._id,
//           type: "general",
//           message: msg,
//         }
//       );
//     }
//   },
// });

export const updateStageContent = mutation({
  args: {
    projectId: v.id("projects"),
    stage: v.string(), // dynamic stage key
    content: v.string(),
  },
  handler: async (ctx, { projectId, stage, content }) => {
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");

    // ✅ Use stage directly (no more hardcoded StageKey)
    const existingStages = project.submissionStages ?? {};

    // ✅ Ensure the stage exists or initialize it
    const updatedStages = {
      ...existingStages,
      [stage]: {
        ...(existingStages[stage] ?? {
          content: "",
          submitted: false,
          editableByStudent: true,
        }),
        content, // overwrite with new content
      },
    };

    await ctx.db.patch(projectId, {
      submissionStages: updatedStages,
      updatedAt: Date.now(),
    });

    // (Optional) ✅ You can notify the supervisor or student if needed later
  },
});

export const markStageSubmitted = mutation({
  args: {
    projectId: v.id("projects"),
    stage: v.string(), // dynamic stage key
    groupName: v.optional(v.string()),
    resubmitted: v.optional(v.boolean()),
  },
  handler: async (ctx, { projectId, stage, groupName, resubmitted }) => {
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");

    const existingStages = project.submissionStages ?? {};
    const currentStage = existingStages[stage] ?? {};

    // ✅ Update or initialize this stage dynamically
    const updatedStages = {
      ...existingStages,
      [stage]: {
        ...currentStage,
        submitted: true,
        submittedAt: new Date().toISOString(),
        editableByStudent: false,
        resubmitted: resubmitted ?? false,
        resubmittedCount: resubmitted
          ? (currentStage.resubmittedCount || 0) + 1
          : currentStage.resubmittedCount || 0,
      },
    };

    await ctx.db.patch(projectId, {
      submissionStages: updatedStages,
      updatedAt: Date.now(),
    });

    // ✅ Get stage label & name for notification
    const label = keyToLabel(stage);
    const submitterName = groupName || project.studentName;

    // ✅ Notify supervisor dynamically
    if (project.supervisorClerkId) {
      await ctx.scheduler.runAfter(
        0,
        internal.internal.notifications.notifyUser,
        {
          clerkId: project.supervisorClerkId,
          projectId,
          message: resubmitted
            ? `🔁 ${submitterName} has resubmitted "${label}" for the project "${project.title}".`
            : `📄 ${submitterName} has submitted "${label}" for the project "${project.title}".`,
          type: resubmitted ? "resubmission" : "submission",
        }
      );
    }
  },
});

export const allowEditing = mutation({
  args: {
    projectId: v.id("projects"),
    stage: v.string(),
  },
  handler: async (ctx, { projectId, stage }) => {
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");

    const existingStages = project.submissionStages ?? {};

    const updatedStage = {
      ...(existingStages[stage] ?? { content: "", submitted: false }),
      editableByStudent: true,
    };

    const updatedStages = {
      ...existingStages,
      [stage]: updatedStage,
    };

    await ctx.db.patch(projectId, {
      submissionStages: updatedStages,
      updatedAt: Date.now(),
    });

    const stageLabel = keyToLabel(stage);

    // ✅ Always use group students if they exist
    const groupStudents = project.group?.groupStudents ?? [];

    const recipients =
      groupStudents.length > 0
        ? groupStudents.map((student: any) => ({
            clerkId: student.clerkId,
            email: student.email,
            name: student.name,
            mongoId: student.mongoId,
          }))
        : project.studentClerkId
          ? [
              {
                clerkId: project.studentClerkId,
                email: project.studentEmail,
                name: project.studentName,
                mongoId: project.studentMongoId,
              },
            ]
          : [];

    // ✅ Send notifications to every student
    for (const student of recipients) {
      if (student.clerkId) {
        await ctx.scheduler.runAfter(
          0,
          internal.internal.notifications.notifyUser,
          {
            clerkId: student.clerkId,
            projectId,
            type: "general",
            message: `📝 Your supervisor has reviewed ${stageLabel} and shared feedback. You can now make corrections and resubmit.`,
          }
        );
      }
    }

    // ✅ Return data for API email sending
    return {
      projectId: project.projectId,
      stage,
      stageLabel,
      students: recipients,
      isGroup: groupStudents.length > 0,
    };
  },
});

export const gradeStage = mutation({
  args: {
    projectId: v.id("projects"),
    stage: v.string(),
    score: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, { projectId, stage, score, comment }) => {
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");

    const typedStage = stage as string; // dynamic key is okay since schema allows v.string()

    const stageData = project.submissionStages?.[typedStage];
    if (!stageData) {
      throw new Error(`Stage "${typedStage}" does not exist in project.`);
    }

    // clone and update
    const updatedStages = {
      ...project.submissionStages,
      [typedStage]: {
        ...stageData,
        grade: {
          score,
          comment: comment ?? "",
          gradedAt: Date.now(),
        },
      },
    };

    await ctx.db.patch(projectId, {
      submissionStages: updatedStages,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const completeStageWithContent = mutation({
  args: {
    projectId: v.id("projects"),
    stage: v.string(),
    content: v.string(),
    score: v.optional(v.number()),
    comment: v.optional(v.string()),
    currentStage: v.optional(v.string()), // optional next stage key
  },
  handler: async (
    ctx,
    { projectId, stage, content, score, comment, currentStage }
  ) => {
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");

    const existingStageData = project.submissionStages?.[stage] ?? {
      submitted: true,
      editableByStudent: false,
      content: "",
    };

    const updatedStage: any = {
      ...existingStageData,
      content,
      completed: true,
      approvedAt: new Date().toISOString(),
    };

    if (score !== undefined) {
      updatedStage.grade = {
        score,
        comment,
        gradedAt: Date.now(),
      };
    }

    const updatedStages = {
      ...project.submissionStages,
      [stage]: updatedStage,
    };

    // ✅ Determine next and last stage
    const stageKeys = Object.keys(project.submissionStages || {}).sort(
      (a, b) =>
        (project.submissionStages?.[a]?.order ?? 0) -
        (project.submissionStages?.[b]?.order ?? 0)
    );
    const currentStageIndex = stageKeys.indexOf(stage);
    const nextStageKey =
      currentStage || stageKeys[currentStageIndex + 1] || stage;
    const isLastStage = currentStageIndex === stageKeys.length - 1;

    // ✅ Patch project in DB
    await ctx.db.patch(projectId, {
      submissionStages: updatedStages,
      updatedAt: Date.now(),
      currentStage: nextStageKey,
      ...(isLastStage && { overallStatus: "completed" }),
    });

    // ✅ Build student list (individual or group)
    const students =
      project.group?.groupStudents && project.group.groupStudents.length > 0
        ? project.group.groupStudents.map((s) => ({
            name: s.name ?? "Student",
            email: s.email ?? "",
            mongoId: s.mongoId ?? "",
            clerkId: s.clerkId ?? "",
          }))
        : [
            {
              name: project.studentName ?? "Student",
              email: project.studentEmail ?? "",
              mongoId: project.studentMongoId ?? "",
              clerkId: project.studentClerkId ?? "",
            },
          ].filter((s) => s.clerkId || s.email);

    const label = keyToLabel(stage);

    // ✅ Notifications
    for (const student of students) {
      if (!student.clerkId) continue;

      await ctx.scheduler.runAfter(
        0,
        internal.internal.notifications.notifyUser,
        {
          clerkId: student.clerkId,
          projectId,
          type: isLastStage ? "general" : "approval",
          message: isLastStage
            ? `🎓 Congratulations ${student.name || ""}! Your project has been completed!`
            : `✅ Your supervisor has approved "${label}" of your project. You may proceed to the next stage.`,
        }
      );
    }

    // ✅ Compute grades if last stage
    let finalGradingPayload = null;
    if (isLastStage && updatedStages) {
      const grades = Object.values(updatedStages)
        .map((stg: any) => stg?.grade?.score)
        .filter((s) => typeof s === "number");

      const averageScore =
        grades.length > 0
          ? grades.reduce((sum, s) => sum + s, 0) / grades.length
          : 0;

      finalGradingPayload = {
        students,
        projectId,
        projectTitle: project.title,
        averageScore,
        total: 100,
        supervisorClerkId: project.supervisorClerkId,
        type: "project",
        session: project.session,
        semester: project.semesterId,
        // courseId: project.courseId,
        creditUnit: project.creditUnits,
      };
    }

    return {
      success: true,
      isLastStage,
      nextStageKey,
      students,
      finalGradingPayload, // <-- frontend will use this
    };
  },
});

export const markStageCompleted = mutation({
  args: {
    projectId: v.id("projects"),
    stage: v.string(),
    score: v.optional(v.number()),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, { projectId, stage, score, comment }) => {
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");

    const existingStageData = project.submissionStages?.[stage] ?? {
      content: "",
      submitted: true,
      editableByStudent: false,
    };

    const updatedStage: any = {
      ...existingStageData,
      completed: true,
    };

    // 💯 Include grading info if available
    if (score !== undefined) {
      updatedStage.grade = {
        score,
        comment,
        gradedAt: Date.now(),
      };
    }

    const updatedStages = {
      ...project.submissionStages,
      [stage]: updatedStage,
    };

    await ctx.db.patch(projectId, {
      submissionStages: updatedStages,
      overallStatus:
        stage === "finalsubmission" ? "completed" : project.overallStatus,
      updatedAt: Date.now(),
    });

    // ✅ Get dynamic label for notifications
    const label = keyToLabel(stage);

    // 🎓 If it's the final submission, send celebration in-app only
    if (stage === "finalsubmission") {
      if (project.studentClerkId) {
        await ctx.scheduler.runAfter(
          0,
          internal.internal.notifications.notifyUser,
          {
            clerkId: project.studentClerkId,
            projectId,
            type: "general",
            message: `🎓 Congratulations! Your final submission has been approved. You've completed your project!`,
          }
        );
      }
      return;
    }

    // ✅ For other stages, send a standard approval notification
    if (project.studentClerkId) {
      await ctx.scheduler.runAfter(
        0,
        internal.internal.notifications.notifyUser,
        {
          clerkId: project.studentClerkId,
          projectId,
          message: `✅ Your supervisor has approved "${label}" of your project. You may proceed to the next stage.`,
          type: "approval",
        }
      );
    }
  },
});

export const markSeenProjectOnboarding = mutation({
  args: {
    id: v.id("projects"),
    isSupervisor: v.boolean(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) throw new Error("Project not found");

    await ctx.db.patch(args.id, {
      ...(args.isSupervisor
        ? { hasSeenProjectOnboardingBySupervisor: true }
        : { hasSeenProjectOnboardingByProjectOwner: true }),
    });
  },
});

export const markProjectCongratulated = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    await ctx.db.patch(projectId, {
      congratulated: true,
    });
  },
});

export const autosaveStageContent = mutation({
  args: {
    projectId: v.id("projects"),
    stage: v.string(),
    content: v.string(),
  },
  handler: async (ctx, { projectId, stage, content }) => {
    console.log("about to autosave");
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");

    const stages = project.submissionStages ?? {};
    const current = stages[stage];

    if (!current) throw new Error("Stage not found");

    // 🔒 Guard: only allow autosave for journals
    if (project.projectType !== "journal") {
      throw new Error("Autosave is journal-only");
    }

    await ctx.db.patch(projectId, {
      submissionStages: {
        ...stages,
        [stage]: {
          ...current,
          content,
        },
      },
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getProjectsWithGeneratedSlides = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();

    return projects.map((project) => ({
      projectId: project._id,
      title: project.title,
      studentUserId: project.studentUserId,
      hasGeneratedSlides:
        Array.isArray(project.generatedSlides) &&
        project.generatedSlides.length > 0,
      slideCount: project.generatedSlides?.length ?? 0,
      createdAt: project._creationTime,
    }));
  },
});

export const getProjectById = query({
  args: { id: v.optional(v.id("projects")) },
  handler: async (ctx, { id }) => {
    if (!id) return null;
    return await ctx.db.get(id);
  },
});

export const createProject = mutation({
  args: {
    projectId: v.string(),
    title: v.string(),
    organizationMembers: v.array(
      v.object({
        userClerkId: v.string(),
        joinedAt: v.string(), // or v.date() if supported — but usually date serialized as ISO string
      })
    ),
    organizationOwnerClerkId: v.optional(v.string()),
    // initialContent: v.optional(v.string()),
    // roomId: v.optional(v.string()),
    organizationId: v.optional(v.string()),

    // ✅ Supervisor info
    supervisorClerkId: v.optional(v.string()),
    supervisorEmail: v.optional(v.string()),
    supervisorMongoId: v.optional(v.string()),
    supervisorUserType: v.optional(v.string()),
    supervisorName: v.optional(v.string()),

    // ✅ Student info
    studentMongoId: v.optional(v.string()),
    studentClerkId: v.optional(v.string()),
    studentName: v.optional(v.string()),
    studentUserType: v.optional(v.string()),
    studentEmail: v.optional(v.string()),
    studentUserId: v.optional(v.string()),
    studentSubscriptionType: v.optional(v.string()),

    overallStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("in-progress"),
      v.literal("completed"),
      v.literal("rejected")
    ),
    projectType: v.optional(
      v.union(v.literal("project"), v.literal("journal"))
    ),
    context: v.optional(
      v.union(v.literal("independent"), v.literal("institutional"))
    ),
    schoolId: v.optional(v.string()),
    schoolName: v.optional(v.string()),
    studentCountry: v.optional(v.string()),

    // ✅ Submission stages with deadlines and fine details
    currentStage: v.optional(v.string()),
    submissionStages: v.optional(
      v.record(
        v.string(),
        v.object({
          order: v.optional(v.number()),
          content: v.string(),
          submitted: v.boolean(),
          submittedAt: v.optional(v.string()),
          editableByStudent: v.optional(v.boolean()),
          completed: v.optional(v.boolean()),
          approvedAt: v.optional(v.string()),
          deadline: v.optional(v.string()),
          fine: v.optional(
            v.object({
              amount: v.number(),
              isPaid: v.boolean(),
              applied: v.optional(v.boolean()),
              reason: v.optional(v.string()),
              paidAt: v.optional(v.string()),
            })
          ),
          grade: v.optional(
            v.object({
              score: v.optional(v.number()),
              comment: v.optional(v.string()),
              gradedAt: v.optional(v.number()),
            })
          ),
        })
      )
    ),
    group: v.optional(
      v.object({
        groupId: v.optional(v.string()),
        groupName: v.optional(v.string()),
        groupSupervisor: v.optional(
          v.object({
            clerkId: v.optional(v.string()),
            mongoId: v.optional(v.string()),
            name: v.optional(v.string()),
            email: v.optional(v.string()),
          })
        ),
        groupStudents: v.optional(
          v.array(
            v.object({
              clerkId: v.optional(v.string()),
              mongoId: v.optional(v.string()),
              studentId: v.optional(v.string()),
              name: v.optional(v.string()),
              email: v.optional(v.string()),
            })
          )
        ),
      })
    ),
    session: v.optional(v.string()), // e.g. "2024/2025"
    semesterId: v.optional(v.string()),
    creditUnits: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("projects")
      .withIndex("projectId", (q) => q.eq("projectId", args.projectId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
      return {
        success: true,
        payload: { convexProjectId: existing._id, projectId: args.projectId },
      };
    }

    const convexProjectId = await ctx.db.insert("projects", {
      ...args,
      projectType: args.projectType ?? "project",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, convexProjectId, projectId: args.projectId };
  },
});

export const updateProjectByIdAndSlide = mutation({
  args: {
    id: v.id("projects"),
    generatedSlides: v.optional(
      v.array(
        v.object({
          id: v.string(),
          title: v.string(),
          content: v.string(),
          aiAssisted: v.optional(v.boolean()),
          slideType: v.string(),
          lastEditedBy: v.string(),
          timestamp: v.string(),
          editable: v.optional(v.boolean()),
        })
      )
    ),
  },
  handler: async (ctx, { id, generatedSlides }) => {
    return await ctx.db.patch(id, { generatedSlides, updatedAt: Date.now() });
  },
});

export const updateProjectById = mutation({
  args: {
    id: v.id("projects"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    const project = await ctx.db.get(args.id);

    if (!project) {
      throw new ConvexError("No Project Found");
    }

    const organizationId = (user.organization_id ?? undefined) as
      | string
      | undefined;

    const isOwner = project.studentClerkId === user.subject;
    const isOrganizationMember = !!(
      project.organizationId && project.organizationId === organizationId
    );

    if (!isOwner && !isOrganizationMember) {
      throw new ConvexError("Unauthorized");
    }

    return await ctx.db.patch(args.id, { title: args.title });
  },
});

export const getProjectByIds = query({
  args: { ids: v.array(v.id("projects")) },
  handler: async (ctx, { ids }) => {
    const projects = [];

    for (const id of ids) {
      const project = await ctx.db.get(id);

      if (project) {
        projects.push({ id: project._id, name: project.title });
      } else {
        projects.push({ id, name: "[Deleted]" });
      }
    }

    return projects;
  },
});

export const getById = query({
  args: { projectId: v.id("projects") }, // expects Id<"projects">
  handler: async (ctx, { projectId }) => {
    return await ctx.db.get(projectId); // ctx.db.get expects Id<"projects">
  },
});

export const getProjectByMongoProjectId = query({
  args: { projectId: v.string() },
  handler: async (ctx, { projectId }) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("projectId", (q) => q.eq("projectId", projectId))
      .first();

    if (!project) throw new Error("Project not found");

    return project;
  },
});

export const getOverallStatus = query({
  args: {
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, { projectId }) => {
    if (!projectId) {
      // Handle the case where projectId is not provided
      return { overallStatus: "unknown" };
    }

    const project = await ctx.db.get(projectId);

    if (!project) {
      return { overallStatus: "unknown" }; // ✅ graceful fallback
    }

    return { overallStatus: project.overallStatus };
  },
});

export const updateOverallStatus = mutation({
  args: {
    projectId: v.id("projects"),
    newStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("in-progress"),
      v.literal("completed"),
      v.literal("rejected")
    ),
  },
  handler: async ({ db }, { projectId, newStatus }) => {
    const project = await db.get(projectId);
    if (!project) throw new Error("Project not found");

    // ✅ Only update if current status is "approved"
    if (project.overallStatus !== "approved") {
      return project;
    }

    const now = Date.now();

    await db.patch(projectId, {
      overallStatus: newStatus,
      updatedAt: now,
    });

    return {
      projectId,
      overallStatus: newStatus,
      updatedAt: now,
    };
  },
});
