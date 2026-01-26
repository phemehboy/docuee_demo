"use client";

import Link from "next/link";
import { keyToLabel } from "@/lib/stages";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StudentProjectViewProps {
  project: any;
  userId: string;
}

export default function StudentProjectView({
  project,
  userId,
}: StudentProjectViewProps) {
  // Treat project as non-existent if it has no topics
  const effectiveProject = project ?? null;

  const isClickable = !!effectiveProject;

  const topics = Object.entries(effectiveProject?.projectTopics || {});
  const hasTopics = topics.length > 0;

  const card = (
    <Card
      className={cn(
        "bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700 transition hover:shadow-md",
        isClickable && "cursor-pointer",
      )}
    >
      <CardHeader>
        <CardTitle className="text-blue-700 dark:text-blue-300">
          🧩 Project Overview{" "}
          {effectiveProject?.context === "independent" ? (
            <Badge className="text-xs bg-blue-100 text-blue-800 rounded-full">
              The last project is shown
            </Badge>
          ) : (
            ""
          )}
        </CardTitle>
      </CardHeader>

      {!effectiveProject ? (
        <CardContent>
          <p className="text-sm text-gray-400">No project found yet.</p>
        </CardContent>
      ) : (
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={`capitalize ${
                effectiveProject?.overallStatus === "pending"
                  ? "text-blue-500"
                  : effectiveProject?.overallStatus === "in-progress"
                    ? "text-yellow-500"
                    : effectiveProject?.overallStatus === "approved"
                      ? "text-yellow-500"
                      : effectiveProject?.overallStatus === "rejected"
                        ? "text-red-500"
                        : effectiveProject?.overallStatus === "completed"
                          ? "text-green-500"
                          : ""
              }`}
            >
              {effectiveProject?.overallStatus}
            </span>
          </p>

          <p>
            <strong>Supervisor:</strong>{" "}
            {effectiveProject?.supervisorId
              ? `${effectiveProject?.supervisorId.firstName} ${effectiveProject?.supervisorId.lastName}`
              : "Not assigned"}
          </p>

          <p>
            <strong>Current Stage:</strong>{" "}
            {keyToLabel(effectiveProject?.currentStage) || "N/A"}
          </p>

          <div className="mt-3">
            <strong>Topics Submitted:</strong>

            {!hasTopics ? (
              <p className="mt-2 text-sm text-muted-foreground italic">
                No topics submitted yet.
              </p>
            ) : (
              <ul className="list-disc ml-5 mt-2 space-y-2">
                {topics.map(([key, topic]: any) => (
                  <li key={key} className="flex items-center justify-between">
                    <span>{topic.topic || "Untitled topic"}</span>

                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                        topic.status === "approved"
                          ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100"
                          : topic.status === "rejected"
                            ? "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100"
                            : "bg-blue-100 text-gray-700 dark:bg-blue-800 dark:text-gray-100",
                      )}
                    >
                      {topic.status || "pending"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );

  // If no project, return card normally
  if (!effectiveProject) return card;

  // If project exists, make the card clickable
  return (
    <Link href={`/user/${userId}/usertype/student/dashboard/project`}>
      {card}
    </Link>
  );
}
