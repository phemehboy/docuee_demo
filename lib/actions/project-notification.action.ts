"use server";
import { NOTIFICATIONDATAPROPS, PAYMENTNOTIFICATIONPROPS } from "@/types";
import { connectToDatabase } from "../database";
import ProjectNotification from "../database/models/notification.model";
import mongoose from "mongoose";
import { handleError } from "../utils";

export async function markNotificationAsRead(notificationId: string) {
  try {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SERVER_URL;

    const res = await fetch(
      `${baseUrl}/api/notifications/${notificationId}/read`,
      {
        method: "PATCH",
      }
    );

    if (!res.ok) throw new Error("Failed to mark notification as read");

    return await res.json();
  } catch (err) {
    console.error("Failed to mark notification as read", err);
    throw err;
  }
}

export async function createProjectNotification(
  notificationData: NOTIFICATIONDATAPROPS
) {
  const { title, type, message, projectId, userId, actionLink } =
    notificationData;
  try {
    await connectToDatabase();

    // ✅ Only validate projectId if provided
    if (projectId && !mongoose.Types.ObjectId.isValid(projectId)) {
      throw new Error("Invalid projectId");
    }

    // ✅ Always validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid userId");
    }

    const notification = new ProjectNotification({
      title,
      message,
      type,
      projectId: projectId || null, // allow null
      userId,
      actionLink,
    });

    await notification.save();
    console.log("Project notification created successfully");

    return JSON.parse(JSON.stringify(notification));
  } catch (error) {
    console.error("Error creating project notification:", error);
  }
}

export async function createPaymentNotification(
  notificationData: PAYMENTNOTIFICATIONPROPS
) {
  const { userId, title, message, type, actionLink } = notificationData;
  try {
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid userId");
    }

    const notification = new ProjectNotification({
      title,
      message,
      type,
      userId,
      actionLink,
    });

    await notification.save();
    console.log("Payment notification created successfully");

    return JSON.parse(JSON.stringify(notification));
  } catch (error) {
    console.error("Error creating payment notification:", error);
  }
}

export async function createPaymentFailedNotification({
  userId,
  errorMessage,
}: {
  userId: string;
  errorMessage: string;
}) {
  try {
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid userId");
    }

    const notification = new ProjectNotification({
      title: "Payment Failed",
      message: errorMessage,
      type: "payment_failed",
      userId,
      actionLink: `/pricing`,
    });

    await notification.save();
    console.log("Payment failure notification created successfully");

    return JSON.parse(JSON.stringify(notification));
  } catch (error) {
    console.error("Error creating payment failure notification:", error);
  }
}

export async function getNotifications({
  userId,
  type,
}: {
  userId: string;
  type?: string; // optional
}) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    await connectToDatabase();

    const query: any = { userId };
    if (type) {
      query.type = type;
    }

    const notifications = await ProjectNotification.find(query).sort({
      date: -1,
    });

    return {
      status: "success",
      data: JSON.parse(JSON.stringify(notifications)),
    };
  } catch (error) {
    console.error("Unable to fetch notifications:", error);
    return {
      status: "error",
      error: "Failed to fetch notifications",
    };
  }
}

export async function deleteNotificationById({
  notificationId,
  // path,
}: {
  notificationId: string;
  // path: string;
}) {
  try {
    await connectToDatabase();

    if (!notificationId) {
      throw new Error("No notification Id found for this notification");
    }

    const deletedNotification =
      await ProjectNotification.findByIdAndDelete(notificationId);

    if (deletedNotification) {
      // revalidatePath(path);
      return { status: "success", message: "Notification deleted" };
    } else {
      return { status: "error", error: "Failed to delete notification" };
    }
  } catch (error) {
    handleError(error);
  }
}

export async function getUnreadNotificationCount(userId: string) {
  try {
    await connectToDatabase();
    const unreadCount = await ProjectNotification.countDocuments({
      userId,
      status: "unread",
    });
    return { count: unreadCount };
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    return { error: "Internal Server Error" };
  }
}

export async function notificationsRead({ userId }: { userId: string }) {
  try {
    await connectToDatabase();
    if (!userId) {
      throw new Error("User ID is required");
    }

    await ProjectNotification.updateMany(
      { userId, status: "unread" },
      { $set: { status: "read" } }
    );

    return { message: "Notifications marked as read" };
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return { error: "Internal Server Error" };
  }
}
