import "@/lib/database/registerModels";

import { Schema, model, models, Document } from "mongoose";

export interface IAssessmentSetup extends Document {
  title: string;
  type: "assignment" | "quiz" | "test" | "exam" | "project";
  session: string;
  semester: Schema.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  duration: number;
  assessmentDate: Date;
  startTime: string;
  assessmentWindow?: {
    allowLateStart?: boolean; // optional: if students can join late
    gracePeriod?: number; // optional: in minutes
  };
  createdBy: Schema.Types.ObjectId; // Admin user
  assignedDepartments: Schema.Types.ObjectId[]; // list of departments
  status:
    | "draft"
    | "open_for_department_setup"
    | "department_in_progress"
    | "awaiting_school_approval"
    | "published"
    | "active"
    | "grading"
    | "graded"
    | "archived";
}

const AssessmentSetupSchema = new Schema<IAssessmentSetup>(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["assignment", "quiz", "test", "exam", "project"],
      required: true,
    },
    session: { type: String, required: true },
    semester: { type: Schema.Types.ObjectId, ref: "Semester", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    duration: {
      type: Number, // in minutes
      required: true,
      default: 60,
    },
    assessmentWindow: {
      allowLateStart: { type: Boolean, default: false },
      gracePeriod: { type: Number, default: 0 }, // minutes
    },
    // ⏰ Actual exam scheduling
    assessmentDate: { type: Date, required: true },
    startTime: { type: String, required: true },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedDepartments: [{ type: Schema.Types.ObjectId, ref: "Department" }],
    status: {
      type: String,
      enum: [
        "draft",
        "open_for_department_setup",
        "department_in_progress",
        "setting_questions_begin",
        "awaiting_school_approval",
        "published",
        "active",
        "grading",
        "graded",
        "archived",
      ],
      default: "draft",
    },
  },
  { timestamps: true }
);

const AssessmentSetup =
  models.AssessmentSetup ||
  model<IAssessmentSetup>("AssessmentSetup", AssessmentSetupSchema);

export default AssessmentSetup;
