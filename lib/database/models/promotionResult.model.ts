import mongoose, { Schema } from "mongoose";

const PromotionResultSchema = new Schema({
  schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true },
  session: { type: String, required: true },
  semesterId: { type: Schema.Types.ObjectId, ref: "Semester", required: true },
  adminId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // NEW
  programId: { type: Schema.Types.ObjectId, ref: "Program" }, // NEW (optional)
  mode: { type: String }, // NEW (optional, e.g., "regular", "special")
  dryRun: { type: Boolean, default: false },
  summary: {
    promotedCount: { type: Number, default: 0 },
    repeatedCount: { type: Number, default: 0 },
    probationCount: { type: Number, default: 0 },
    graduatedCount: { type: Number, default: 0 },
    carryoverCount: { type: Number, default: 0 },
  },
  students: {
    promoted: [Schema.Types.Mixed],
    repeated: [Schema.Types.Mixed],
    probation: [Schema.Types.Mixed],
    graduated: [Schema.Types.Mixed],
    carryover: [Schema.Types.Mixed],
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.PromotionResult ||
  mongoose.model("PromotionResult", PromotionResultSchema);
