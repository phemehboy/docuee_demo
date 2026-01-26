"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { updateMongoOverallStatus } from "@/lib/actions/project.action";
import { Room } from "./Room";
import Navbar from "./Navbar";
import Toolbar from "./Toolbar";
import { Editor } from "./Editor";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { FullScreenLoader } from "@/components/FullScreenLoader";
import { keyToLabel } from "@/lib/stages";

import { DownloadProjectPDF } from "@/components/project/DownloadProjectPDF";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFinalStageRedirect } from "@/components/hooks/useFinalStageRedirect";

interface ProjectProps {
  projectId: string;
  id: string;
}

export const Project = ({ projectId, id }: ProjectProps) => {
  const project = useQuery(api.projects.getProjectByMongoProjectId, {
    projectId,
  });
  const user = useQuery(api.users.getUserByMongoUserId, { id });

  const markSeen = useMutation(api.projects.markSeenProjectOnboarding);
  const updateOverallStatus = useMutation(api.projects.updateOverallStatus);

  const isPro = user?.subscriptionType === "pro";
  const setDeadlineBtnRef = useRef<HTMLButtonElement>(null);
  const hasStartedTyping = useRef(false);

  const projectOwner = user?.clerkId === project?.studentClerkId;
  const allDeadlinesSet = useMemo(
    () =>
      project && project.submissionStages
        ? Object.keys(project.submissionStages).every(
            (stageKey) => !!project.submissionStages?.[stageKey]?.deadline,
          )
        : false,
    [project],
  );

  useFinalStageRedirect(project?._id);

  const STAGES = useMemo(() => {
    if (!project?.submissionStages) {
      return [
        "proposal",
        "chapter1",
        "chapter2",
        "chapter3",
        "finalsubmission",
      ].map((k) => ({
        key: k,
        label: keyToLabel(k),
        order: 0,
        completed: false,
        submitted: false,
      }));
    }

    const stages = Object.entries(project.submissionStages).map(
      ([key, value]) => ({
        key,
        label: keyToLabel(key),
        order: value.order ?? 0,
        completed: value.completed ?? false,
        submitted: value.submitted ?? false,
      }),
    );

    stages.sort((a, b) => a.order - b.order);
    return stages;
  }, [project]);

  // Determine the next allowed stage (first incomplete/unsubmitted stage)
  const getNextAllowedStage = (stages: typeof STAGES) => {
    for (let i = 0; i < stages.length; i++) {
      const s = stages[i];
      const stageInfo = project?.submissionStages?.[s.key];
      if (!stageInfo?.completed && !stageInfo?.submitted) {
        return s;
      }
    }
    return stages[stages.length - 1]; // fallback to last stage if all done
  };

  // Current stage controlled by Editor
  const [currentStage, setCurrentStage] = useState<{
    key: string;
    label: string;
  } | null>(null);

  // Sync current stage whenever project or STAGES change
  useEffect(() => {
    if (!project || !STAGES.length) return;

    setCurrentStage((prev) => {
      if (prev) {
        const prevStageInfo = project.submissionStages?.[prev.key];
        if (
          prevStageInfo &&
          (prevStageInfo.completed || prevStageInfo.submitted)
        ) {
          return prev; // keep current if still allowed
        }
      }
      return getNextAllowedStage(STAGES);
    });
  }, [project, STAGES]);

  const handleTypingStart = async () => {
    if (hasStartedTyping.current) return;
    hasStartedTyping.current = true;

    if (!project?._id) return;

    try {
      await updateOverallStatus({
        projectId: project._id,
        newStatus: "in-progress",
      });
      await updateMongoOverallStatus({
        projectId: project.projectId,
        newStatus: "in-progress",
      });
    } catch (error) {
      console.error("Error updating project status:", error);
    }
  };

  const [showGuideModal, setShowGuideModal] = useState(true);

  const handleCloseGuide = async () => {
    setShowGuideModal(false);
    if (!project?._id) return;

    await markSeen({
      id: project._id,
      isSupervisor: !projectOwner,
    });
  };

  if (!project || !user || !currentStage) {
    return <FullScreenLoader label="Project Loading..." />;
  }

  return (
    <Room stageKey={currentStage.key} projectId={project._id}>
      <div className="min-h-screen">
        {/* Navbar & Toolbar */}
        <div className="flex flex-col pt-2 gap-y-2 fixed top-0 left-0 right-0 z-10 bg-black-100 print:hidden">
          <Navbar
            project={project}
            currentStage={currentStage}
            buttonRef={setDeadlineBtnRef}
            allDeadlinesSet={allDeadlinesSet}
            user={user}
          />
          <Toolbar data={project} stageKey={currentStage.key} isPro={isPro} />
        </div>

        {/* PDF download */}
        {project.projectType === "journal" &&
          projectOwner &&
          allDeadlinesSet && (
            <div className="fixed top-20 sm:top-10 right-4 sm:right-32 z-50 print:hidden">
              <DownloadProjectPDF
                projectId={project._id as Id<"projects">}
                fileName={`${project.title}-project.pdf`}
                buttonLabel="Download Project PDF"
                noLabel={true}
              />
            </div>
          )}

        {/* Editor */}
        <div className="pt-31 lg:pt-28.5 print:pt-0 bg-black-100">
          <Editor
            onTypingStart={handleTypingStart}
            projectId={project._id}
            isPro={isPro}
            currentStage={currentStage}
            setCurrentStage={setCurrentStage}
            stageKey={currentStage.key}
          />
        </div>
      </div>

      {/* Onboarding Guide */}
      <Dialog open={showGuideModal} onOpenChange={setShowGuideModal}>
        <DialogContent
          className="max-h-[80vh] overflow-y-auto bg-black-900"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {projectOwner
                ? `📘 Welcome to Your ${project.projectType === "project" ? "Project" : "Journal"} Workspace!`
                : "🧑‍🏫 Welcome, Supervisor!"}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="text-sm text-muted-foreground space-y-2 text-left">
                <p>
                  <strong>⚠️ Demo Mode:</strong> This project is for
                  demonstration purposes. No submissions or edits are possible.
                </p>
                <p>Stages for this {project.projectType}:</p>
                <ul className="list-disc list-inside">
                  {STAGES.map((stage) => (
                    <li key={stage.key}>{stage.label}</li>
                  ))}
                </ul>
                <p>
                  You can navigate between stages to see how the editor and
                  workflow look, but all are simulation.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleCloseGuide}
              className="underline hover:text-blue-300 text-right cursor-pointer"
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Room>
  );
};
