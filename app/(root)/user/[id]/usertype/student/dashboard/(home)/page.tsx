import StudentAssignmentView from "@/components/dashboard/student/StudentAssignmentView";
import StudentProjectView from "@/components/dashboard/student/StudentProjectView";
import DashboardNotifications from "@/components/DashboardNotifications";
import { getStudentProject } from "@/lib/actions/project.action";
import { getUserById } from "@/lib/actions/user.action";
import { notFound } from "next/navigation";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const dbUser = await getUserById(id);
  if (!dbUser) return notFound();

  const hasSchool =
    !!dbUser.school &&
    typeof dbUser.school === "object" &&
    "_id" in dbUser.school;

  const project = await getStudentProject(dbUser._id.toString());

  return (
    <main className="min-h-screen flex flex-col max-w-6xl mx-auto ">
      <div className="flex-1 py-2 md:p-4 lg:mt-4 space-y-6">
        {/* Header */}
        <div className="bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-600 p-6 rounded-2xl shadow-sm">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-800 dark:text-white">
            👋 Welcome Back, {dbUser.firstName}!
          </h1>

          {/* Different text for mobile vs large screens */}
          {hasSchool ? (
            <p className="text-blue-700 dark:text-blue-100 mt-2 sm:hidden">
              Your current academic summary.
            </p>
          ) : (
            <p className="text-blue-700 dark:text-blue-100 mt-2 sm:hidden">
              Your current project summary.
            </p>
          )}
          {hasSchool ? (
            <p className="hidden sm:block text-blue-700 dark:text-blue-100 mt-2">
              Here’s a summary of your current academic performance.
            </p>
          ) : (
            <p className="hidden sm:block text-blue-700 dark:text-blue-100 mt-2">
              Here’s a summary of your current project.
            </p>
          )}
        </div>

        <section>
          <StudentProjectView project={project} userId={dbUser._id} />
        </section>

        {/* Future sections */}
        <section className="flex flex-col gap-6">
          {hasSchool && (
            <div className="bg-blue-50 dark:bg-blue-950 rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                📚 Upcoming Assignments
              </h3>
              <StudentAssignmentView user={dbUser} />
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-950 rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
              🔔 Notifications
            </h3>
            <DashboardNotifications />
          </div>
        </section>
      </div>
    </main>
  );
}
