import mongoose, { Schema, Document } from "mongoose";

// optional interface for typing
export interface IUserJob extends Document {
  schoolId: mongoose.Types.ObjectId;
  adminId: mongoose.Types.ObjectId;
  fileKey: string;
  status: "queued" | "processing" | "completed" | "failed";
  total: number;
  processed: number;
  updated: string[];
  skipped: string[];
  failed: string[];
  result: any;
  errorMessage: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserJobSchema = new Schema<IUserJob>({
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
  result: { type: Schema.Types.Mixed, default: {} },
  errorMessage: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// ✅ Fix TypeScript error
UserJobSchema.pre<IUserJob>("save", function () {
  // `this` is your document
  this.updatedAt = new Date();
});

export default mongoose.models.UserJob ||
  mongoose.model<IUserJob>("UserJob", UserJobSchema);
