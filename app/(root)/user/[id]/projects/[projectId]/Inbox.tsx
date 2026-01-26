"use client";

import { Button } from "@/components/ui/button";
import { BellIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { ClientSideSuspense } from "@liveblocks/react";
import { useInboxNotifications } from "@liveblocks/react/suspense";
import { InboxNotification, InboxNotificationList } from "@liveblocks/react-ui";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export const Inbox = () => {
  return (
    <ClientSideSuspense
      fallback={
        <>
          <Button disabled variant={"ghost"} className="relative" size="icon">
            <BellIcon className="size-4 md:size-5" />
          </Button>
          <Separator
            orientation="vertical"
            className="h-6 bg-black-600/20 hidden md:flex"
          />
        </>
      }
    >
      <InboxMenu />
    </ClientSideSuspense>
  );
};

const InboxMenu = () => {
  const { inboxNotifications } = useInboxNotifications();
  const { user } = useUser();

  const myNotifications = useQuery(api.notifications.getUserNotifications, {
    clerkId: user?.id || "",
  });

  const markRead = useMutation(api.notifications.markNotificationRead);

  const totalNotifications =
    inboxNotifications.length + (myNotifications?.length || 0);

  const typeIconMap: Record<string, string> = {
    submission: "📘",
    approval: "✅",
    comment: "💬",
    mention: "📎",
    reminder: "⏰",
    general: "📢",
    fine_paid: "💰",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative cursor-pointer" size="icon">
          <BellIcon className="size-4 md:size-5" />
          {totalNotifications > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-sky-500 text-[10px] font-medium text-white flex items-center justify-center">
              {totalNotifications > 99 ? "99+" : totalNotifications}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-full max-w-[90vw] md:w-100 p-2 bg-white shadow-md overflow-auto max-h-[70vh]"
      >
        {totalNotifications > 0 ? (
          <div className="space-y-2">
            {/* Liveblocks Notifications */}
            {inboxNotifications.length > 0 && (
              <InboxNotificationList>
                {inboxNotifications.map((n) => (
                  <InboxNotification key={n.id} inboxNotification={n} />
                ))}
              </InboxNotificationList>
            )}

            {/* Convex Custom Notifications */}
            {myNotifications?.map((n) => (
              <div
                key={n._id}
                onClick={() => markRead({ notificationId: n._id })}
                className="border px-3 py-2 rounded-md text-sm text-black bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
              >
                <span>
                  {typeIconMap[n.type] || "🔔"} {n.message}
                </span>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-black text-sm">No available notifications</span>
        )}
      </DropdownMenuContent>

      <Separator
        orientation="vertical"
        className="h-6 bg-black-600/20 hidden md:flex"
      />
    </DropdownMenu>
  );
};
