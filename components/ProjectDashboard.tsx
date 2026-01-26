"use client";

import React, { useEffect, useState } from "react";
import { updateProjectOverallStatus } from "@/lib/actions/project.action";
import { Topic } from "@/lib/database/models/project.model";
import {
  isAllTopicRejected,
  isAllTopicsPending,
  isTopicApproved,
} from "@/lib/utils";

import { Id } from "@/convex/_generated/dataModel";
import { IStudent } from "@/lib/database/models/student.model";
import { IUser } from "@/lib/database/models/user.model";
import { ProjectDTO } from "@/types/project";

import SupportBanner from "./SupportBanner";
import { WriteProjectCard } from "./dashboard/student/WriteProjectCard";
import { DownloadProjectPDF } from "./project/DownloadProjectPDF";
import { ProjectOverviewCard } from "./dashboard/student/ProjectOverviewCard";

const ProjectDashboard = ({
  initialStudent,
  initialProject,

  id,
  usertype,
}: {
  initialStudent: IStudent | null;
  initialProject: ProjectDTO | null;
  initialProjects?: ProjectDTO[];
  lastUrl?: string;
  accountMode?: "independent" | "institutional";
  id: string;
  usertype: string;
}) => {
  const [project, setProject] = useState<ProjectDTO | null>(initialProject);

  const student = initialStudent;

  useEffect(() => {
    const updateStatus = async () => {
      if (!student?._id || !project) return;

      if (
        isTopicApproved(project.projectTopics) &&
        ["pending", "rejected"].includes(project.overallStatus)
      ) {
        const updateResponse = await updateProjectOverallStatus(
          student._id as string,
          "approved",
        );
        if (updateResponse?.status === "success") {
          setProject((prev) =>
            prev ? { ...prev, overallStatus: "approved" } : prev,
          );
        }
      } else if (
        isAllTopicRejected(project.projectTopics) &&
        project.overallStatus !== "rejected"
      ) {
        const updateResponse = await updateProjectOverallStatus(
          student._id as string,
          "rejected",
        );
        if (updateResponse?.status === "success") {
          setProject((prev) =>
            prev ? { ...prev, overallStatus: "rejected" } : prev,
          );
        }
      } else if (
        isAllTopicsPending(project.projectTopics) &&
        project.overallStatus !== "pending"
      ) {
        const updateResponse = await updateProjectOverallStatus(
          student._id as string,
          "pending",
        );
        if (updateResponse?.status === "success") {
          setProject((prev) =>
            prev ? { ...prev, overallStatus: "pending" } : prev,
          );
        }
      }
    };

    updateStatus();
  }, [student?._id, project]);

  // Narrowed user reference
  const studentUser =
    student?.userId && typeof student.userId === "object"
      ? (student.userId as IUser)
      : null;

  const isFreeUserWithoutCredits =
    studentUser?.subscriptionType === "free" &&
    !studentUser?.subscriptionCoveredByCredit;

  const getApprovedProjectTitle = () => {
    const projectTopics = project?.projectTopics;
    if (!projectTopics) {
      return "No project topics available";
    }
    const approvedTopic = Object.values(projectTopics).find(
      (topic: any) => topic.status === "approved",
    );
    return approvedTopic
      ? (approvedTopic as Topic).topic
      : "No approved project topic available";
  };

  const mappedStages = Object.entries(project?.submissionStages || {}).map(
    ([stageName, data]) => ({
      stage: stageName, // include the key
      ...data,
    }),
  );

  // Find the relevant stage that needs fine payment
  const relevantDeadline = mappedStages.find(
    (stage) =>
      stage.deadline &&
      new Date() > new Date(stage.deadline) &&
      !stage.submitted &&
      stage.fine &&
      !stage.fine.isPaid,
  );

  const isProjectButtonDisabled =
    project?.overallStatus === "pending" ||
    project?.overallStatus === "rejected"; // Disable if project status is pending or rejected

  return (
    <main className="min-h-screen flex flex-col max-w-6xl mx-auto">
      <div className="flex-1 py-2 md:p-4 lg:mt-4 space-y-6">
        <div className="w-full flex justify-between items-center p-2">
          <h1 className="text-xl md:text-2xl md:mt-2 font-bold text-blue-900 dark:text-blue-300">
            My Project Dashboard
          </h1>

          {project?.overallStatus === "completed" && (
            <DownloadProjectPDF
              projectId={project?.convexProjectId as Id<"projects">}
              fileName={`${getApprovedProjectTitle()}-project.pdf`}
              buttonLabel="Download Project PDF"
            />
          )}
        </div>

        {project && (
          <>
            <div className="p-4 bg-black-900 shadow-md rounded-lg">
              <h3 className="text-xl font-semibold text-blue-400">
                Project Status
              </h3>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-300 mt-2">
                  Your project is currently:{" "}
                  <span
                    className={`${project?.overallStatus === "completed" ? "text-green-500" : project?.overallStatus === "rejected" ? "text-red-500" : "text-yellow-500"}`}
                  >
                    <strong>{project?.overallStatus || "Not available"}</strong>
                  </span>
                </p>
              </div>
              {project?.overallStatus === "rejected" && (
                <p className="text-sm text-red-400 mt-2">
                  Your project was rejected. Please submit another project
                  topics.
                </p>
              )}
            </div>

            <div className="w-full flex justify-center items-center">
              <div
                className="grid gap-6 w-full max-w-5xl
      grid-cols-1 sm:grid-cols-2"
              >
                {/* Write Project Card */}
                {["pending", "approved", "in-progress", "completed"].includes(
                  project.overallStatus,
                ) && (
                  <WriteProjectCard
                    project={project}
                    isDisabled={
                      (project.overallStatus !== "completed" &&
                        isFreeUserWithoutCredits) ||
                      isProjectButtonDisabled ||
                      !project?.convexProjectId ||
                      !!(
                        relevantDeadline?.fine &&
                        relevantDeadline.fine.applied &&
                        !relevantDeadline.fine.isPaid
                      )
                    }
                    relevantDeadline={relevantDeadline}
                    reason={
                      isFreeUserWithoutCredits &&
                      project.overallStatus !== "completed"
                        ? "Upgrade to premium or use credits to continue working on your project."
                        : !project?.convexProjectId
                          ? "Your project is still syncing. Please wait for your supervisor to finish setting it up."
                          : undefined
                    }
                    isFreeUserWithoutCredits={isFreeUserWithoutCredits}
                    userCredit={studentUser?.creditBalance || 0}
                    initialUserId={studentUser?._id || ""}
                  />
                )}
              </div>
            </div>

            {/* Project Overview */}
            {student && (
              <ProjectOverviewCard
                project={project}
                student={student}
                getApprovedProjectTitle={getApprovedProjectTitle}
              />
            )}
          </>
        )}
      </div>
      <SupportBanner
        link={`/user/${id}/usertype/${usertype}/dashboard/support`}
      />
    </main>
  );
};

export default ProjectDashboard;
