import { Schema, model, models, Document } from "mongoose";

export interface ICarryoverCourse {
  courseId: string;
  session: string;
  semester: Schema.Types.ObjectId;
  status: "pending" | "retaken" | "cleared";
}

export interface IPromotionRecord {
  session: string;
  semester: Schema.Types.ObjectId;
  fromLevel: Schema.Types.ObjectId;
  toLevel?: Schema.Types.ObjectId;
  outcome:
    | "promoted"
    | "repeat"
    | "probation"
    | "graduated"
    | "carryover"
    | "pendingApproval";
  note?: string;
  timestamp?: Date;
}

export interface IStudentPerformance extends Document {
  student: Schema.Types.ObjectId;
  semester: Schema.Types.ObjectId;
  session: string;
  gpa: number;
  cgpa: number;
  totalCredits: number;
  totalGradePoints: number;
  status: "active" | "repeat" | "probation" | "carryover" | "graduated";
  carryoverCourses: ICarryoverCourse[];
  promotionHistory: IPromotionRecord[];
}

const CarryoverCourseSchema = new Schema<ICarryoverCourse>({
  courseId: { type: String, required: true },
  session: { type: String, required: true },
  semester: { type: Schema.Types.ObjectId, ref: "Semester", required: true },
  status: {
    type: String,
    enum: ["pending", "retaken", "cleared"],
    default: "pending",
  },
});

const PromotionHistorySchema = new Schema<IPromotionRecord>({
  session: { type: String, required: true },
  semester: { type: Schema.Types.ObjectId, ref: "Semester", required: true },
  fromLevel: { type: Schema.Types.ObjectId, ref: "Level", required: true },
  toLevel: { type: Schema.Types.ObjectId, ref: "Level" },
  outcome: {
    type: String,
    enum: [
      "promoted",
      "repeat",
      "probation",
      "graduated",
      "carryover",
      "pendingApproval",
    ],
    required: true,
  },
  note: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const StudentPerformanceSchema = new Schema<IStudentPerformance>(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    semester: { type: Schema.Types.ObjectId, ref: "Semester", required: true },
    session: { type: String, required: true },
    gpa: { type: Number, default: 0 },
    cgpa: { type: Number, default: 0 },
    totalCredits: { type: Number, default: 0 },
    totalGradePoints: { type: Number, default: 0 },

    // 🆕 Student current status
    status: {
      type: String,
      enum: ["active", "repeat", "probation", "carryover", "graduated"],
      default: "active",
    },

    // 🆕 New arrays
    carryoverCourses: [CarryoverCourseSchema],
    promotionHistory: [PromotionHistorySchema],
  },
  { timestamps: true }
);

const StudentPerformance =
  models.StudentPerformance ||
  model<IStudentPerformance>("StudentPerformance", StudentPerformanceSchema);

export default StudentPerformance;
