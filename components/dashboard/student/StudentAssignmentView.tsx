"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { IUser } from "@/lib/database/models/user.model";

interface StudentAssignmentViewProps {
  user: IUser;
}

export default function StudentAssignmentView({
  user,
}: StudentAssignmentViewProps) {
  const assignments = useQuery(api.task_assignments.getAssignmentsByStudent, {
    studentClerkId: user.clerkId,
  });

  if (assignments === undefined) {
    return <p className="text-sm text-gray-500">Loading assignments...</p>;
  }

  if (!assignments?.length) {
    return <p className="text-sm text-gray-500">No assignments yet.</p>;
  }

  const upcomingAssignments = assignments
    .filter((a) => {
      if (!a.deadline) return true; // keep assignments with no deadline
      return new Date(a.deadline) > new Date(); // only future deadlines
    })
    .sort((a, b) => {
      if (!a.deadline) return 1; // put assignments without deadline last
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

  if (!upcomingAssignments.length) {
    return <p className="text-sm text-gray-400">No upcoming assignments.</p>;
  }

  return (
    <ul className="space-y-3">
      {upcomingAssignments.map((a) => (
        <Link
          key={a._id}
          href={`/user/${user._id}/usertype/${user.userType}/dashboard/courses/course/${a.courseMongoId}/tasks?tab=student&assignmentId=${a._id}`}
        >
          <li className="mb-2 bg-white dark:bg-blue-900 p-4 rounded-xl shadow-sm border border-blue-100 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950 transition">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-blue-800 dark:text-white">
                  {a.assignmentTitle}
                </h4>
                <p className="text-sm text-gray-500 dark:text-blue-300">
                  Due:{" "}
                  {a.deadline
                    ? new Date(a.deadline).toLocaleString()
                    : "No deadline"}
                </p>
              </div>

              <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-100 px-2 py-1 rounded">
                {a.tasks.length} Task{a.tasks.length > 1 ? "s" : ""}
              </span>
            </div>
          </li>
        </Link>
      ))}
    </ul>
  );
}
