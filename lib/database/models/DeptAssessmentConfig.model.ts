import "@/lib/database/registerModels";

import { Schema, model, models, Document } from "mongoose";

export interface IDeptAssessmentConfig extends Document {
  assessmentSetup: Schema.Types.ObjectId;
  department: Schema.Types.ObjectId;
  hod: Schema.Types.ObjectId;
  proposedStart?: Date | null;
  proposedEnd?: Date | null;
  status:
    | "pending"
    | "instructor_setup"
    | "setting_questions_begin"
    | "hod_approved"
    | "hod_rejected"
    | "grading"
    | "completed";
  notes?: string;
}

const DeptAssessmentConfigSchema = new Schema<IDeptAssessmentConfig>(
  {
    assessmentSetup: {
      type: Schema.Types.ObjectId,
      ref: "AssessmentSetup",
      required: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    hod: { type: Schema.Types.ObjectId, ref: "User", required: true },
    proposedStart: { type: Date },
    proposedEnd: { type: Date },
    status: {
      type: String,
      enum: [
        "pending",
        "instructor_setup",
        "setting_questions_begin",
        "hod_approved",
        "hod_rejected",
        "grading",
        "completed",
      ],
      default: "pending",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

DeptAssessmentConfigSchema.index(
  { assessmentSetup: 1, department: 1 },
  { unique: true }
);

const DeptAssessmentConfig =
  models.DeptAssessmentConfig ||
  model<IDeptAssessmentConfig>(
    "DeptAssessmentConfig",
    DeptAssessmentConfigSchema
  );

export default DeptAssessmentConfig;
