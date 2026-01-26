"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import { slugify } from "@/lib/utils";

export function useFinalStageRedirect(projectId?: Id<"projects">) {
  const { userId } = useAuth();
  const router = useRouter();

  const project = useQuery(
    api.projects.getProjectById,
    projectId ? { id: projectId as Id<"projects"> } : "skip",
  );

  const markCongratulated = useMutation(api.projects.markProjectCongratulated);

  // ✅ Compute redirect eligibility
  const redirectInfo = useMemo(() => {
    if (!project || !userId || !projectId) return null;

    const stages = project.submissionStages
      ? Object.entries(project.submissionStages)
      : [];
    if (!stages.length) return null;

    const sortedStages = stages.sort(
      ([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0),
    );
    const [_, finalStageValue] = sortedStages[sortedStages.length - 1];

    const isFinalCompleted = finalStageValue?.completed;
    const alreadyCongratulated = project.congratulated;

    // ✅ Determine if current user is a student in this project
    const isSingleStudent = project.studentClerkId === userId;

    const isGroupStudent =
      project.group?.groupStudents?.some((s) => s.clerkId === userId) ?? false;

    const isStudent = isSingleStudent || isGroupStudent;

    if (isStudent && isFinalCompleted && !alreadyCongratulated) {
      const redirectName = project.group?.groupName
        ? slugify(project.group.groupName)
        : slugify(project.studentName ?? "student");

      return {
        redirectUrl: `/${redirectName}/congratulations?projectId=${projectId}`,
      };
    }

    return null;
  }, [project, userId, projectId]);

  // ✅ Perform redirect & mutation
  useEffect(() => {
    if (!redirectInfo || !projectId) return;

    markCongratulated({ projectId: projectId as Id<"projects"> }).then(() => {
      router.push(redirectInfo.redirectUrl);
    });
  }, [redirectInfo, markCongratulated, router, projectId]);
}
