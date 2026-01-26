import { Document, model, models, Schema } from "mongoose";

export interface IProjectNotification extends Document {
  title: string;
  message: string;
  type:
    | "project_created"
    | "project_updated"
    | "project_approved"
    | "project_rejected"
    | "project_approved_reason"
    | "project_rejected_reason"
    | "payment_success"
    | "payment_failed"
    | "payment_cancelled"
    | "chat_message"
    | "stage_submitted"
    | "stage_completed"
    | "project_completed"
    | "editing_enabled"
    | "announcement"
    | "assignment"
    | "grading"
    | "timetable_created"
    | "timetable_updated";
  projectId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  status: "unread" | "read";
  date?: Date;
  actionLink?: string;
  announcementId: Schema.Types.ObjectId;
}

const projectNotificationSchema = new Schema({
  title: String,
  message: String,
  type: {
    type: String,
    enum: [
      "project_created",
      "project_updated",
      "project_approved",
      "project_rejected",
      "project_approved_reason",
      "project_rejected_reason",
      "payment_success",
      "payment_failed",
      "payment_cancelled",
      "chat_message",
      "stage_submitted",
      "stage_completed",
      "project_completed",
      "editing_enabled",
      "announcement",
      "assignment",
      "grading",
      "timetable_created", // ✅ NEW
      "timetable_updated",
      "stage_deadline_reminder",
      "stage_deadline_missed",
      "submission",
      "assessment_open",
      "supervisor_accept",
      "supervisor_decline",
      "withdrawal_paid",
      "withdrawal_rejected",
      "support_update",
    ],
    required: true,
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    required: false,
  },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["unread", "read"], default: "unread" },
  date: { type: Date, default: Date.now },
  actionLink: String,
  announcementId: { type: Schema.Types.ObjectId, ref: "Announcement" },
});

const ProjectNotification =
  models.ProjectNotification ||
  model<IProjectNotification>("ProjectNotification", projectNotificationSchema);

export default ProjectNotification;
