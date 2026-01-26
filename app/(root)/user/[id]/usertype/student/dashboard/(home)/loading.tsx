export default function LoadingStudentDashboard() {
  return (
    <main className="px-2 py-2 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-6 md:space-y-8 animate-pulse">
        {/* Welcome Card */}
        <div className="bg-white dark:bg-gray-900 border-l-4 border-blue-600 p-6 rounded-2xl shadow-sm">
          <div className="h-7 w-72 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded mt-3"></div>
        </div>

        {/* Session Info Skeleton */}
        <div className="p-6 bg-gray-50 dark:bg-gray-950 rounded-2xl shadow-sm space-y-3">
          <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>

        {/* Stats Skeleton */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-white dark:bg-gray-900 shadow-sm"
            />
          ))}
        </section>

        {/* Project Summary Skeleton */}
        <div className="p-6 bg-gray-50 dark:bg-gray-950 rounded-2xl space-y-3">
          <div className="h-6 w-56 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="h-32 bg-white dark:bg-gray-900 rounded-xl mt-4 shadow-sm"></div>
        </div>

        {/* Notifications Skeleton */}
        <div className="p-6 bg-gray-50 dark:bg-gray-950 rounded-2xl space-y-3">
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="h-20 bg-white dark:bg-gray-900 rounded-xl shadow-sm"></div>
        </div>

        {/* Recent Activity Skeleton */}
        <div className="p-6 bg-gray-50 dark:bg-gray-950 rounded-2xl space-y-4">
          <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="h-32 bg-white dark:bg-gray-900 rounded-xl shadow-sm"></div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="p-6 bg-gray-50 dark:bg-gray-950 rounded-2xl space-y-3">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="h-32 bg-white dark:bg-gray-900 rounded-xl mt-3 shadow-sm"></div>
        </div>
      </div>
    </main>
  );
}
