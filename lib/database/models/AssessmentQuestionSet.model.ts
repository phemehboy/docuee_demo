import "@/lib/database/registerModels";

import { Schema, model, models, Document } from "mongoose";

export interface IAssessmentQuestionSet extends Document {
  courseAssessment: Schema.Types.ObjectId;
  createdBy: Schema.Types.ObjectId; // instructor user
  content: any; // store JSON structure of questions, metadata, marking schemes
  status:
    | "draft"
    | "submitted"
    | "approved"
    | "rejected"
    | "admin_approved"
    | "admin_rejected";
  feedback?: string;
}

const AssessmentQuestionSetSchema = new Schema<IAssessmentQuestionSet>(
  {
    courseAssessment: {
      type: Schema.Types.ObjectId,
      ref: "CourseAssessment",
      required: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "approved",
        "rejected",
        "submitted_to_admin",
        "admin_approved",
        "admin_rejected",
      ],
      default: "draft",
    },
    feedback: { type: String },
  },
  { timestamps: true }
);

const AssessmentQuestionSet =
  models.AssessmentQuestionSet ||
  model<IAssessmentQuestionSet>(
    "AssessmentQuestionSet",
    AssessmentQuestionSetSchema
  );

export default AssessmentQuestionSet;
