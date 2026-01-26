import "@/lib/database/registerModels";
import { Schema, model, models, Document } from "mongoose";

export interface ICourseAssessment extends Document {
  deptAssessment: Schema.Types.ObjectId; // DeptAssessmentConfig
  course: Schema.Types.ObjectId;
  instructor: Schema.Types.ObjectId;
  totalMarks: number;
  status:
    | "draft"
    | "submitted"
    | "hod_approved"
    | "hod_rejected"
    | "admin_approved"
    | "admin_rejected"
    | "active"
    | "published"
    | "completed";
  questionSet?: Schema.Types.ObjectId; // AssessmentQuestionSet
  hasNewSubmission?: boolean;
}

const CourseAssessmentSchema = new Schema<ICourseAssessment>(
  {
    deptAssessment: {
      type: Schema.Types.ObjectId,
      ref: "DeptAssessmentConfig",
      required: true,
    },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "Instructor",
      required: true,
    },
    totalMarks: { type: Number, default: 100 },
    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "hod_approved",
        "hod_rejected",
        "submitted_to_admin",
        "admin_approved",
        "admin_rejected",
        "active",
        "published",
        "grading",
        "completed",
      ],
      default: "draft",
    },
    questionSet: { type: Schema.Types.ObjectId, ref: "AssessmentQuestionSet" },
    hasNewSubmission: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CourseAssessmentSchema.index(
  { deptAssessment: 1, course: 1 },
  { unique: true }
);

const CourseAssessment =
  models.CourseAssessment ||
  model<ICourseAssessment>("CourseAssessment", CourseAssessmentSchema);

export default CourseAssessment;
