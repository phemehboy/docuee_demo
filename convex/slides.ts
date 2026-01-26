import { v4 as uuidv4 } from "uuid";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Pseudo AI helper function
async function summarizeForSlide(stageContent: string, slideType: string) {
  // Replace this with your actual AI call
  // Example: call OpenAI or HuggingFace model
  const summary =
    stageContent.length > 500
      ? stageContent.slice(0, 500) + "..." // simple placeholder
      : stageContent;

  return `• ${summary.replace(/\n/g, "\n• ")}`; // bullet format
}

export const generateAISlides = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    // Fetch project
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");

    // Only proceed for Pro students (optional)
    if (project.studentSubscriptionType !== "pro") {
      throw new Error("Slides generation available for Pro users only");
    }

    // Return existing slides if already generated
    if (project.generatedSlides && project.generatedSlides.length > 0) {
      return project.generatedSlides;
    }

    const slides: any[] = [];

    // --- 1. Intro Slide ---
    slides.push({
      id: uuidv4(),
      title: "Intro & Student Info",
      content: `Student Name: ${project.studentName || "N/A"}\nProject Title: ${project.title}`,
      aiAssisted: true,
      slideType: "intro",
      lastEditedBy: "ai",
      timestamp: new Date().toISOString(),
    });

    // --- 2. Chapter Slides ---
    if (project.submissionStages) {
      const sortedStages = Object.entries(project.submissionStages).sort(
        ([, a], [, b]) => (a.order || 0) - (b.order || 0)
      );

      for (let i = 0; i < sortedStages.length; i++) {
        const [chapterKey, stage] = sortedStages[i];
        if (!stage.content) continue;

        const summary = await summarizeForSlide(stage.content, "chapter");

        slides.push({
          id: uuidv4(),
          title: `Chapter ${i + 1}`,
          content: summary,
          aiAssisted: true,
          slideType: "chapter",
          lastEditedBy: "ai",
          timestamp: new Date().toISOString(),
        });
      }
    }

    // --- 3. Conclusion Slide ---
    const allContent = Object.values(project.submissionStages || {})
      .map((stage) => stage.content)
      .join("\n\n");

    const conclusionSummary = allContent
      ? await summarizeForSlide(allContent, "conclusion")
      : "No conclusion available.";

    slides.push({
      id: uuidv4(),
      title: "Conclusion",
      content: conclusionSummary,
      aiAssisted: true,
      slideType: "conclusion",
      lastEditedBy: "ai",
      timestamp: new Date().toISOString(),
    });

    // --- 4. Save slides in project ---
    await ctx.db.patch(projectId, {
      generatedSlides: slides,
      updatedAt: Date.now(),
    });

    return slides;
  },
});

export const updateSlideContent = mutation({
  args: {
    projectId: v.id("projects"),
    slideId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, { projectId, slideId, content }) => {
    const project = await ctx.db.get(projectId);

    if (!project || !project.generatedSlides) {
      throw new Error("Project or slides not found");
    }

    const updatedSlides = project.generatedSlides.map((slide) =>
      slide.id === slideId
        ? {
            ...slide,
            content,
            lastEditedBy: "student",
            timestamp: new Date().toISOString(),
          }
        : slide
    );

    await ctx.db.patch(projectId, {
      generatedSlides: updatedSlides,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
