import React from "react";

const SettingsLoading = () => {
  return (
    <main className="max-w-5xl mx-auto py-8 px-1 md:px-4 space-y-10 animate-pulse">
      {/* Header Skeleton */}
      <section className="flex justify-between items-center space-x-4">
        <div className="h-8 w-1/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-8 w-40 bg-gray-300 dark:bg-gray-700 rounded"></div>
      </section>

      {/* Request Form Skeleton */}
      <section className="w-full max-w-2xl border border-gray-200 p-6 rounded-md space-y-4">
        <div className="h-6 w-1/2 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-24 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
      </section>

      {/* Subscription Skeleton */}
      <section className="border border-gray-200 p-6 rounded-md space-y-4">
        <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
      </section>

      {/* Security Skeleton */}
      <section className="border border-gray-200 p-6 rounded-md space-y-2">
        <div className="h-6 w-1/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded"></div>
      </section>

      {/* Account Skeleton */}
      <section className="border border-gray-200 p-6 rounded-md space-y-2">
        <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
      </section>
    </main>
  );
};

export default SettingsLoading;
