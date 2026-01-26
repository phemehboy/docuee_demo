import { Document, model, models, Schema } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  message: string;
  audience: ("students" | "supervisors" | "instructors" | "all")[]; // who should see it
  createdBy: Schema.Types.ObjectId; // User ID (schoolAdmin, supervisor, instructor)
  createdByName: string; // Display name (saved permanently)
  schoolId: Schema.Types.ObjectId;
  date: Date;
  status: "active" | "archived"; // helps manage old ones
  actionLink?: string; // optional link (e.g., resource, policy doc, etc.)
  expiryDate: Date;
  userType: "schoolAdmin" | "supervisor" | "instructor";
  department?: string;
}

const announcementSchema = new Schema<IAnnouncement>({
  title: { type: String, required: true },
  message: { type: String, required: true },
  audience: {
    type: [String],
    enum: ["student", "supervisor", "instructor", "all"],
    required: true,
  },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdByName: { type: String, required: true }, // ✅ now stored permanently
  schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["active", "archived"], default: "active" },
  actionLink: { type: String },
  expiryDate: { type: Date, required: false },
  userType: {
    type: String,
    enum: ["schoolAdmin", "supervisor", "instructor"],
    required: true,
  },
  department: { type: String },
});

const Announcement =
  models.Announcement ||
  model<IAnnouncement>("Announcement", announcementSchema);

export default Announcement;
