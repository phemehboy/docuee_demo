import React from "react";

const SupportLoading = () => {
  return (
    <main className="flex justify-center px-2 md:px-4 animate-pulse py-8">
      <div className="w-full max-w-xl space-y-6">
        {/* Card Skeleton */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4 shadow">
          {/* Header Skeleton */}
          <div className="space-y-2">
            <div className="h-6 w-1/2 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>

          {/* Issue Type Skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-1/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>

          {/* Feature Skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-1/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>

          {/* Subject Skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-1/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>

          {/* Description Skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-1/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-24 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>

          {/* Severity Skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-1/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>

          {/* Submit Button Skeleton */}
          <div className="h-12 w-full bg-gray-300 dark:bg-gray-700 rounded mt-4"></div>
        </div>
      </div>
    </main>
  );
};

export default SupportLoading;
