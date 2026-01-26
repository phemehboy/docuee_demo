"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-sm p-3 flex items-center justify-between z-999">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" />
        <span>No Internet Connection</span>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="bg-white text-red-600 px-3 py-1 text-xs rounded flex items-center gap-1"
      >
        <RefreshCcw className="w-3 h-3" />
        Retry
      </button>
    </div>
  );
}
