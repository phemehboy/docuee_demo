"use client";

import { useEffect, useState } from "react";

export default function StudentPerformanceView({
  studentId,
}: {
  studentId: string;
}) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/student/performance/${studentId}`)
      .then((res) => res.json())
      .then((data) => setData(data));
  }, [studentId]);

  console.log({ data });

  if (!data) return <p>Loading...</p>;

  const { performance, courses } = data;

  const noPerformance = !performance || performance.length === 0;
  const noCourses = !courses || courses.length === 0;

  if (noPerformance && noCourses) {
    return (
      <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-800 text-center">
        <h2 className="text-lg md:text-xl font-bold text-blue-800 dark:text-white mb-2">
          📊 Academic Performance
        </h2>
        <p className="text-blue-700 dark:text-gray-400 text-sm">
          No academic results yet. Once your assessments are graded, your
          performance will appear here.
        </p>
      </div>
    );
  }

  const latest = performance[0];

  return (
    <div className="bg-blue-50 dark:bg-blue-950 p-2 md:p-6 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-800">
      {/* Header */}
      <h2 className="text-lg md:text-xl font-bold text-blue-800 dark:text-white mb-3 md:mb-4">
        {/* Mobile text */}
        <span className="sm:hidden">📊 Performance</span>
        {/* Desktop text */}
        <span className="hidden sm:inline">📊 Academic Performance</span>
      </h2>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="bg-white dark:bg-blue-900 p-3 md:p-4 rounded-xl shadow-sm">
          <p className="text-xs md:text-sm text-gray-500 dark:text-blue-300">
            GPA
          </p>
          <h3 className="text-xl md:text-2xl font-bold text-blue-700 dark:text-white">
            {latest?.gpa?.toFixed(2) || "0.00"}
          </h3>
        </div>

        <div className="bg-white dark:bg-blue-900 p-3 md:p-4 rounded-xl shadow-sm">
          <p className="text-xs md:text-sm text-gray-500 dark:text-blue-300">
            CGPA
          </p>
          <h3 className="text-xl md:text-2xl font-bold text-blue-700 dark:text-white">
            {latest?.cgpa?.toFixed(2) || "0.00"}
          </h3>
        </div>

        <div className="bg-white dark:bg-blue-900 p-3 md:p-4 rounded-xl shadow-sm">
          <p className="text-xs md:text-sm text-gray-500 dark:text-blue-300">
            Credits
          </p>
          <h3 className="text-xl md:text-2xl font-bold text-blue-700 dark:text-white">
            {latest?.totalCredits || 0}
          </h3>
        </div>

        <div className="bg-white dark:bg-blue-900 p-3 md:p-4 rounded-xl shadow-sm">
          <p className="text-xs md:text-sm text-gray-500 dark:text-blue-300">
            Grade Points
          </p>
          <h3 className="text-xl md:text-2xl font-bold text-blue-700 dark:text-white">
            {latest?.totalGradePoints || 0}
          </h3>
        </div>
      </div>

      {/* Course Results Table */}
      <h3 className="text-base md:text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2 md:mb-3">
        {/* Mobile text */}
        <span className="sm:hidden">📘 Courses</span>
        {/* Desktop text */}
        <span className="hidden sm:inline">📘 Course Results</span>
      </h3>

      <div className="w-full overflow-x-auto rounded-xl border border-blue-100 dark:border-blue-800">
        <table className="min-w-max w-full text-xs md:text-sm">
          <thead className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100">
            <tr>
              <th className="text-left p-2 md:p-3 w-64">Course</th>
              <th className="text-left p-2 md:p-3 w-40">Type</th>
              <th className="text-left p-2 md:p-3">Score</th>
              <th className="text-left p-2 md:p-3">Grade</th>
              <th className="text-left p-2 md:p-3">Credit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100 dark:divide-blue-800">
            {courses.map((c: any) => (
              <tr
                key={c._id}
                className="hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
              >
                <td className="p-2 md:p-3 w-64">
                  {c.course ? c.course.title : "Final Year Project"}
                </td>

                <td className="p-2 md:p-3 capitalize w-40">
                  {c.assessmentType || "N/A"}
                </td>

                <td className="p-2 md:p-3">
                  {c.finalScore
                    ? Number.isInteger(c.finalScore)
                      ? c.finalScore
                      : c.finalScore.toFixed(2)
                    : "0"}
                </td>

                <td className="p-2 md:p-3 font-semibold">{c.gradeLetter}</td>
                <td className="p-2 md:p-3">{c.creditUnit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
