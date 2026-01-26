import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISupportRequest extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  userRole: "student" | "supervisor";

  type: "bug" | "payment" | "confusion" | "feature" | "other";
  feature: string;

  subject: string;
  message: string;

  severity: "low" | "medium" | "high";
  status: "open" | "in_review" | "resolved" | "closed";

  platform: "web" | "mobile";

  screenshotUrl?: string;
  adminNote?: string;

  createdAt: Date;
  updatedAt: Date;
}

const SupportRequestSchema = new Schema<ISupportRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },
    userRole: { type: String, enum: ["student", "supervisor"], required: true },

    type: {
      type: String,
      enum: ["bug", "payment", "confusion", "feature", "other"],
      required: true,
    },

    feature: { type: String, required: true },

    subject: { type: String, required: true },
    message: { type: String, required: true },

    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    status: {
      type: String,
      enum: ["open", "in_review", "resolved", "closed"],
      default: "open",
    },

    platform: { type: String, default: "web" },

    screenshotUrl: { type: String },
    adminNote: { type: String },
  },
  { timestamps: true }
);

const SupportRequest: Model<ISupportRequest> =
  mongoose.models.SupportRequest ||
  mongoose.model<ISupportRequest>("SupportRequest", SupportRequestSchema);

export default SupportRequest;
