// lib/database/models/joinRequest.model.ts

import mongoose, { Schema, Document } from "mongoose";

export interface IJoinRequest extends Document {
  user: mongoose.Types.ObjectId;
  school: mongoose.Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  preferredRole?: "student" | "supervisor" | "instructor";
  rejectionReason?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
}

const JoinRequestSchema = new Schema<IJoinRequest>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  school: { type: Schema.Types.ObjectId, ref: "School", required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  preferredRole: {
    type: String,
    enum: ["student", "supervisor", "instructor"],
  },
  rejectionReason: { type: String },
  reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  reviewedAt: { type: Date },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.JoinRequest ||
  mongoose.model<IJoinRequest>("JoinRequest", JoinRequestSchema);
