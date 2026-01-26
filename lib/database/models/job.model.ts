// models/job.model.ts
import mongoose, { Schema } from "mongoose";

const JobSchema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true },

    // change ref if needed
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    fileKey: { type: String, required: true },

    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed"],
      default: "queued",
    },

    total: { type: Number, default: 0 },
    processed: { type: Number, default: 0 },

    updated: [{ type: String }],
    skipped: [{ type: String }],
    failed: [{ type: String }],

    // summary object (dynamic)
    result: { type: Schema.Types.Mixed, default: {} },

    errorMessage: { type: String, default: "" },
  },

  // Enable automatic timestamps:
  { timestamps: true }
);

// Export
export default mongoose.models.Job || mongoose.model("Job", JobSchema);
