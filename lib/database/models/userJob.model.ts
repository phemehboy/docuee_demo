// models/job.model.ts
import mongoose, { Schema } from "mongoose";

const UserJobSchema = new Schema({
  schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true },
  adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  fileKey: { type: String, required: true },
  status: {
    type: String,
    enum: ["queued", "processing", "completed", "failed"],
    default: "queued",
  },
  total: { type: Number, default: 0 },
  processed: { type: Number, default: 0 },
  updated: { type: [String], default: [] },
  skipped: { type: [String], default: [] },
  failed: { type: [String], default: [] },
  result: { type: Schema.Types.Mixed, default: {} }, // store summary if needed
  errorMessage: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// keep timestamps in sync
UserJobSchema.pre("save", function (next) {
  (this as any).updatedAt = new Date();
  next();
});

export default mongoose.models.UserJob ||
  mongoose.model("UserJob", UserJobSchema);
