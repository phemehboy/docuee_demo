"use client";

import { Alert } from "../ui/alert";

export default function DashboardBanner({
  isMobile = false,
}: {
  user?: any;
  isMobile?: boolean;
}) {
  return (
    <Alert
      variant="default"
      className="bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-white border-blue-300 px-3 py-2 text-sm flex items-center justify-center text-center"
    >
      {isMobile ? (
        <span>🚧 Demo Mode. Project workflow only</span>
      ) : (
        <span>
          🚧 <strong>Demo Mode:</strong> This demo showcases the core project
          workflow only. Submissions, billing, and approvals are intentionally
          disabled.
        </span>
      )}
    </Alert>
  );
}
