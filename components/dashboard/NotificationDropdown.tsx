"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

import { motion, AnimatePresence, MotionProps } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  notificationsRead,
} from "@/lib/actions/project-notification.action";
import { BellIcon } from "lucide-react";
import { getNotificationIcon } from "@/lib/getNotificationIcon";
import { getUserById } from "@/lib/actions/user.action";
import { getAnnouncementHref } from "@/lib/getAnnouncementHref";

type Notification = {
  _id: string;
  title: string;
  message: string;
  status: "read" | "unread";
  date: string;
  actionLink?: string;
  type: string;
};

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const { id } = useParams();
  const queryClient = useQueryClient();

  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: userData } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await getUserById(id as string);
      return res ?? null;
    },
    enabled: !!id,
    retry: 1, // or false if you don’t want retries
    staleTime: 60_000, // cache for 1 min
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unreadNotifications", id],
    queryFn: async () => {
      if (!id) return 0;
      const res = await getUnreadNotificationCount(id as string);
      return res.count || 0;
    },
    refetchOnWindowFocus: true,
    staleTime: 30000,
    enabled: !!id,
  });

  const {
    data: notificationData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["dropdownNotifications", id],
    queryFn: async () => {
      if (!id) return { status: "success", data: [] };

      const res = await getNotifications({ userId: id as string });
      return res || { status: "success", data: [] };
    },
    enabled: !!id,
    refetchInterval: 30000,
  });

  const notifications = (notificationData?.data ?? []) as Notification[];
  const unread = notifications.filter(
    (n: Notification) => n.status === "unread",
  );

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsRead({ userId: id as string }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["dropdownNotifications", id],
      });
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications", id] });
    },
  });

  const markOneAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["dropdownNotifications", id],
      });
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications", id] });
    },
  });

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative cursor-pointer"
        aria-label="Toggle Notifications"
      >
        <BellIcon className="size-6 mt-2" />
        {unreadCount > 0 && (
          <span
            aria-label={`${unreadCount} unread notifications`}
            className="
      absolute -top-1 -right-1 
      bg-blue-700 text-white 
      text-[10px] font-medium
      rounded-full 
      h-5 min-w-5 
      px-1.5 
      flex items-center justify-center 
      leading-none
      whitespace-nowrap
    "
          >
            {unreadCount > 99 ? "100+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-[320px] bg-white dark:bg-black-900 shadow-xl rounded-xl z-50 overflow-hidden border"
            {...({} as MotionProps & React.HTMLAttributes<HTMLDivElement>)}
          >
            <div className="flex items-center justify-between p-3 text-sm font-medium border-b">
              <span>Notifications</span>
              {unread.length > 0 && (
                <button
                  onClick={() => markAllAsReadMutation.mutate()}
                  className="text-xs text-blue-500 hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-75 overflow-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center text-center text-gray-500 p-6 text-sm">
                  <p>Loading notifications...</p>
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center text-center text-red-500 p-6 text-sm">
                  <p>⚠️ Unable to load notifications</p>
                  <span className="text-xs">
                    Check your internet connection
                  </span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center text-gray-500 p-6 text-sm">
                  <p className="mb-1">You&apos;re all caught up!</p>
                  <span className="text-xs text-muted-foreground">
                    No new notifications
                  </span>
                </div>
              ) : (
                notifications.map((n: Notification) => {
                  const { href, external } = getAnnouncementHref({
                    type: n.type,
                    actionLink: n.actionLink,
                    id: id as string,
                    userType: userData?.userType,
                  });

                  return external ? (
                    <a
                      key={n._id}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        markOneAsReadMutation.mutate(n._id);
                        setOpen(false);
                      }}
                      className={`block px-4 py-3 transition-colors text-sm border-b hover:bg-gray-100 dark:hover:bg-black-800 ${
                        n.status === "unread"
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {getNotificationIcon(n.type)}
                        <div className="overflow-hidden">
                          <p
                            className={`${
                              n.status === "unread"
                                ? "font-semibold"
                                : "font-normal"
                            } text-gray-800 dark:text-gray-100`}
                          >
                            {n.title}
                          </p>
                          <p className="text-xs text-muted-foreground max-w-65 truncate">
                            {n.message}
                          </p>
                          <p className="text-[10px] mt-1 text-gray-400">
                            {formatDistanceToNow(new Date(n.date), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        {n.status === "unread" && (
                          <span className="ml-auto mt-1 w-2 h-2 shrink-0 rounded-full bg-blue-500" />
                        )}
                      </div>
                    </a>
                  ) : (
                    <Link
                      key={n._id}
                      href={href}
                      onClick={() => {
                        markOneAsReadMutation.mutate(n._id);
                        setOpen(false);
                      }}
                      className={`block px-4 py-3 transition-colors text-sm border-b hover:bg-gray-100 dark:hover:bg-black-800 ${
                        n.status === "unread"
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="shrink-0">
                          {getNotificationIcon(n.type)}
                        </div>

                        <div className="overflow-hidden">
                          <p
                            className={`${
                              n.status === "unread"
                                ? "font-semibold"
                                : "font-normal"
                            } text-gray-800 dark:text-gray-100`}
                          >
                            {n.title}
                          </p>
                          <p className="text-xs text-muted-foreground max-w-65 truncate">
                            {n.message}
                          </p>
                          <p className="text-[10px] mt-1 text-gray-400">
                            {formatDistanceToNow(new Date(n.date), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        {n.status === "unread" && (
                          <span className="ml-auto mt-1 w-2 h-2 shrink-0 rounded-full bg-blue-500" />
                        )}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            <div className="p-2 text-center border-t">
              <Link
                href={`/user/${id}/notifications`}
                className="text-blue-500 text-sm hover:underline"
                onClick={() => setOpen(false)}
              >
                View All Notifications
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
