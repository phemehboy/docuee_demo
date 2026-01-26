"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { IProjectNotification } from "@/lib/database/models/notification.model";

export default function DashboardNotifications() {
  const [notifications, setNotifications] = useState<IProjectNotification[]>(
    []
  );

  useEffect(() => {
    async function fetchNotifications() {
      const res = await fetch(`/api/notifications/recent`);
      const data = await res.json();
      if (data.status === "success") setNotifications(data.data);
    }
    fetchNotifications();
  }, []);

  if (!notifications.length) return null;

  return (
    <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 rounded-2xl shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="font-semibold text-blue-700 dark:text-blue-300">
            Recent Updates
          </h2>
        </div>

        <AnimatePresence>
          {notifications.map((n, index) => (
            <motion.div
              key={String(n._id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Link
                href={n.actionLink || "#"}
                className="block p-3 rounded-xl bg-blue-100/60 dark:bg-blue-900/30 border border-blue-200/30 dark:border-blue-800/40 hover:bg-blue-200/60 dark:hover:bg-blue-800/50 transition-colors"
              >
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  {n.title}
                </p>
                <p className="text-sm text-blue-800/80 dark:text-blue-300/70">
                  {n.message}
                </p>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
