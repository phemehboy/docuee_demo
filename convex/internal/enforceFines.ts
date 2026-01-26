import { internalMutation } from "../_generated/server";

export const enforceFines = internalMutation({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    const now = new Date();

    for (const project of projects) {
      const updatedStages = { ...project.submissionStages };
      let shouldUpdate = false;

      // 🔥 No need for hardcoded STAGES — loop dynamically
      for (const key of Object.keys(updatedStages)) {
        const stage = updatedStages[key];
        if (!stage || !stage.deadline || stage.submitted || !stage.fine)
          continue;

        const deadlineDate = new Date(stage.deadline);
        if (now > deadlineDate && !stage.fine.applied) {
          updatedStages[key] = {
            ...stage,
            fine: {
              ...stage.fine,
              applied: true,
            },
            editableByStudent: false,
          };
          shouldUpdate = true;
        }
      }

      if (shouldUpdate) {
        await ctx.db.patch(project._id, {
          submissionStages: updatedStages,
        });
      }
    }
  },
});
