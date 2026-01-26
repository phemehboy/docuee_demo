"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ProfileSkeleton() {
  return (
    <main className="py-4 px-2 md:px-6 max-w-5xl mx-auto space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
          My Profile
        </h1>
        <div className="h-9 w-28 bg-gray-300 dark:bg-gray-700 rounded-xl" />
      </div>

      {/* Profile Summary */}
      <Card className="border-none bg-black-900 p-4">
        <CardHeader className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-700" />
          <div className="flex flex-col gap-2">
            <div className="h-5 w-40 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-4 w-56 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-3 w-28 bg-gray-300 dark:bg-gray-700 rounded" />
          </div>
        </CardHeader>
      </Card>

      {/* Profile Details */}
      <Card className="border-none bg-black-900 p-4">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
              <div className="h-5 w-32 bg-gray-300 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
