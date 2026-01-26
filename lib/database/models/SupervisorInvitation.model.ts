import { Schema, model, models, Types } from "mongoose";

const SupervisorInvitationSchema = new Schema(
  {
    projectId: {
      type: Types.ObjectId,
      ref: "Project",
      required: true,
    },
    studentId: {
      type: Types.ObjectId,
      ref: "Student",
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["supervisor"],
      default: "supervisor",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    declinedAt: Date,
    acceptedAt: Date,
    token: {
      type: String,
      required: true,
      unique: true,
    },
    resendCount: { type: Number },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// 🔥 PERFORMANCE INDEX (CRITICAL)
SupervisorInvitationSchema.index(
  { token: 1, status: 1, expiresAt: 1 },
  { name: "invite_validation_idx" }
);

export default models.SupervisorInvitation ||
  model("SupervisorInvitation", SupervisorInvitationSchema);
