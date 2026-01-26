"use client";

import { IStudent } from "@/lib/database/models/student.model";
import { ProjectDTO, SubmissionStageDTO } from "@/types/project";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface WriteProjectCardProps {
  project: ProjectDTO;
  isDisabled: boolean;
  relevantDeadline?: SubmissionStageDTO & { stage: string };
  reason?: string;
  isFreeUserWithoutCredits?: boolean;
  callbackUrl?: string;
  userCredit?: number;
  initialUserId?: string; // 👈 current student ID (passed from ProjectDashboard)
}

export const WriteProjectCard = ({
  project,
  isDisabled,
  relevantDeadline,
  isFreeUserWithoutCredits,
  userCredit = 0,
  initialUserId,
}: WriteProjectCardProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const label =
    project?.overallStatus === "completed"
      ? "View Project"
      : project?.overallStatus === "in-progress"
        ? "Continue Writing"
        : project?.projectType === "project"
          ? "Write Project"
          : "Write Journal";

  const handleClick = async () => {
    setLoading(true);
    try {
      const student = project?.projectCreator as IStudent;
      const userIdToUse = project?.groupId
        ? initialUserId
        : student.userId?._id;
      router.push(`/user/${userIdToUse}/projects/${project._id}`);
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const finalDisabled = isDisabled || loading;

  return (
    <div
      className={`p-4 bg-black-900 shadow-md rounded-lg ${
        finalDisabled ? "opacity-90" : ""
      }`}
    >
      {project?.overallStatus !== "completed" ? (
        <>
          <h3 className="capitalize text-xl font-semibold text-blue-400">
            Write Your {project.projectType}
          </h3>
          <p className="text-sm text-gray-300 mt-2">
            {project.projectType === "journal"
              ? "Start writing your Journal"
              : "Start writing and collaborating on your approved project topic."}
          </p>
        </>
      ) : (
        <>
          <h3 className="capitalize text-xl font-semibold text-green-400">
            {project.projectType} Completed
          </h3>
          <p className="text-sm text-green-400 mt-2">
            🎉 <span className="capitalize">{project.projectType}</span>{" "}
            completed! Great job.
          </p>
        </>
      )}

      <button
        className={`mt-4 w-full rounded-md px-4 py-2 text-sm lg:text-base transition disabled:opacity-50 disabled:cursor-not-allowed
          ${
            project?.overallStatus === "completed"
              ? "bg-green-700 hover:bg-green-800"
              : "bg-blue-700 hover:bg-blue-800"
          } text-white cursor-pointer`}
        onClick={handleClick}
        disabled={finalDisabled}
      >
        {loading ? "Loading..." : label}
      </button>

      {project?.overallStatus !== "completed" &&
        relevantDeadline?.fine &&
        relevantDeadline.fine.applied &&
        !relevantDeadline.fine.isPaid && (
          <p className="mt-2 text-red-500 text-sm lg:text-base">
            ⚠ You must pay the fine to continue writing.
          </p>
        )}

      {isFreeUserWithoutCredits && project?.overallStatus !== "completed" && (
        <div className="mt-4 flex flex-col items-center space-y-2">
          <p className="text-sm text-red-400 text-center">
            {userCredit >= 3000
              ? "Upgrade to premium or use credits to continue."
              : "Upgrade to premium to continue working on your project."}
          </p>
        </div>
      )}
    </div>
  );
};
