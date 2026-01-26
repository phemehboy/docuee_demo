"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, LinkIcon, MoreHorizontal, Trash2 } from "lucide-react";

import {
  getNotifications,
  notificationsRead,
  deleteNotificationById,
  markNotificationAsRead,
} from "@/lib/actions/project-notification.action";
import { Loader } from "@/components/ui/Loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getNotificationIcon } from "@/lib/getNotificationIcon";
import { getUserById } from "@/lib/actions/user.action";
import { getAnnouncementHref } from "@/lib/getAnnouncementHref";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

type Notification = {
  _id: string;
  title: string;
  message: string;
  status: "unread" | "read";
  date: string;
  actionLink?: string;
  type: string;
};

export default function NotificationsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<
    string | null
  >(null);

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

  // Fetch notifications
  const { data: notificationData = { data: [] }, isLoading } = useQuery({
    queryKey: ["allNotifications", id],
    queryFn: async () => {
      if (!id) return { data: [] };
      const res = await getNotifications({ userId: id as string });
      return res || { data: [] };
    },
    enabled: !!id,
    refetchInterval: 30000,
  });

  const notifications: Notification[] = notificationData?.data ?? [];

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsRead({ userId: id as string }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allNotifications", id] });
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

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) =>
      deleteNotificationById({ notificationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allNotifications", id] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications", id] });
      setDeleteDialogOpen(false);
      setNotificationToDelete(null);

      toast.success("The notification has been successfully deleted.");
    },
  });

  const openDeleteDialog = (notificationId: string) => {
    setNotificationToDelete(notificationId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (notificationToDelete) {
      deleteNotificationMutation.mutate(notificationToDelete);
    }
  };

  return (
    <main className="mx-auto px-4 py-8 space-y-8 w-full">
      {/* Heading */}
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex gap-2 items-center">
            <button
              onClick={() => router.back()}
              className="hover:text-blue-500 transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold">Notifications</h1>
          </div>

          {notifications.some((n) => n.status === "unread") && (
            <button
              onClick={() => markAllAsReadMutation.mutate()}
              className="text-sm text-blue-500 hover:underline disabled:opacity-50 cursor-pointer"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="w-full max-w-full sm:max-w-2xl mx-auto space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader />
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-muted-foreground text-center">
            You have no notifications yet.
          </p>
        ) : (
          notifications.map((n: Notification) => {
            const { href } = getAnnouncementHref({
              type: n.type,
              actionLink: n.actionLink,
              id: id as string,
              userType: userData?.userType,
            });

            return (
              <div
                key={n._id}
                className={`flex items-start sm:items-center justify-between rounded-lg border px-2 md:px-4 py-3 transition w-full ${
                  n.status === "unread"
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex-1 flex gap-2 items-start justify-between">
                  {getNotificationIcon(n.type)}
                  <div className="w-full">
                    <p
                      className={`text-sm ${
                        n.status === "unread" ? "font-semibold" : "font-normal"
                      }`}
                    >
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground break-words whitespace-pre-wrap">
                      {n.message}
                    </p>
                    <p className="text-[10px] mt-1 text-gray-400">
                      {formatDistanceToNow(new Date(n.date), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {n.status === "unread" && (
                    <span className="mt-1 w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                  )}
                </div>

                {/* More actions menu */}
                <div className="ml-2">
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                        aria-label="More actions"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-white shadow-md rounded-md"
                    >
                      <DropdownMenuItem
                        onClick={() => {
                          markOneAsReadMutation.mutate(n._id);
                          if (href) {
                            window.open(href, "_blank");
                          }
                        }}
                        className="flex items-center gap-2 text-black hover:text-white hover:bg-black-100 cursor-pointer"
                      >
                        <span className="text-blue-400">
                          <LinkIcon className="w-4 h-4" />
                        </span>
                        <span>Open link</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="flex items-center gap-2 text-red-500 hover:text-red-100 hover:bg-red-700 cursor-pointer"
                        onClick={() => openDeleteDialog(n._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-black-900">
          <DialogHeader>
            <DialogTitle>Delete Notification</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this notification? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-700 cursor-pointer"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
