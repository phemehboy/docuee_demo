import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { keyToLabel } from "@/lib/stages";
import { toZonedTime } from "date-fns-tz";
import { parseISO } from "date-fns";

export const enforceFines = mutation({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();

    if (projects.length === 0)
      return { success: true, message: "No projects to process." };

    console.log(`⚡ Found ${projects.length} project(s) to process.`);

    for (const project of projects) {
      if (project.overallStatus === "completed") continue;

      const updatedStages = { ...project.submissionStages };
      let shouldUpdate = false;

      // Fetch user timezone
      const user = await ctx.db
        .query("users")
        .withIndex("byMongoId", (q) =>
          q.eq("mongoUserId", project.studentMongoId)
        )
        .unique();

      const userTimeZone = user?.timeZone || "UTC";
      const now = toZonedTime(new Date(), userTimeZone);

      for (const key of Object.keys(updatedStages)) {
        const stage = updatedStages[key];

        if (
          !stage?.deadline ||
          stage.submitted ||
          !stage.fine ||
          stage.fine.applied
        )
          continue;

        const deadlineDate = toZonedTime(
          parseISO(stage.deadline),
          userTimeZone
        );

        if (now.getTime() > deadlineDate.getTime()) {
          const label = keyToLabel(key);

          updatedStages[key] = {
            ...stage,
            fine: {
              ...stage.fine,
              applied: true,
            },
            editableByStudent: false,
          };

          shouldUpdate = true;

          if (project.studentClerkId) {
            await ctx.scheduler.runAfter(
              0,
              internal.internal.notifications.notifyUser,
              {
                clerkId: project.studentClerkId,
                projectId: project._id,
                type: "fine_paid",
                message: `⛔ You missed the deadline for "${label}". A fine has been applied. Pay it to continue writing.`,
              }
            );
          }

          console.log(
            `✅ Fine applied for project ${project._id} stage "${label}"`
          );
        }
      }

      if (shouldUpdate) {
        await ctx.db.patch(project._id, { submissionStages: updatedStages });
        console.log(`💾 Project ${project._id} updated with new fines.`);
      }
    }

    console.log("🏁 Enforce fines job completed.");
    return { success: true, message: "Fines enforcement completed." };
  },
});
