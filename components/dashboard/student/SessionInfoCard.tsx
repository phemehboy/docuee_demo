// components/dashboard/SessionInfoCard.tsx
"use client";
import { Card } from "@/components/ui/card";

export default function SessionInfoCard({
  session,
  semester,
  startDate,
  endDate,
}: {
  session: string;
  semester: { name: string };
  startDate?: Date;
  endDate?: Date;
}) {
  return (
    <Card className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-md border">
      <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">
        📅 Academic Session
      </h2>
      <p className="text-sm">
        <strong>Session:</strong> {session || "Not set"} <br />
        <strong>Semester:</strong> {semester.name || "Not set"} <br />
        {startDate && endDate && (
          <>
            <strong>Start:</strong> {new Date(startDate).toLocaleDateString()}{" "}
            <br />
            <strong>End:</strong> {new Date(endDate).toLocaleDateString()}
          </>
        )}
      </p>
    </Card>
  );
}
