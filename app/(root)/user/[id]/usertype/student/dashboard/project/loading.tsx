export default function LoadingProjectDashboard() {
  return (
    <div className="px-2 py-2 sm:py-4">
      <div className="mx-auto max-w-5xl space-y-4 md:space-y-6 animate-pulse">
        {/* Header */}
        <div className="flex justify-between items-center p-2">
          <div className="h-8 w-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-8 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>

        {/* Announcements */}
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-300 dark:bg-gray-700 rounded-lg"
            ></div>
          ))}
        </div>

        {/* Project Status Card */}
        <div className="p-4 bg-gray-200 dark:bg-gray-800 rounded-lg space-y-2">
          <div className="h-6 w-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded mt-2"></div>
        </div>

        {/* Deadline / Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-40 bg-gray-300 dark:bg-gray-700 rounded-lg"
            ></div>
          ))}
        </div>

        {/* Project Overview */}
        <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
      </div>
    </div>
  );
}
