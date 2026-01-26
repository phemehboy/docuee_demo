import "@/lib/database/registerModels";
import { Schema, model, models, Document } from "mongoose";
import { ISchool } from "./school.model";
import { IUser } from "./user.model";
import { IDepartment } from "./department.model";
import { ILevel } from "./level.model";
import { IProgram } from "./program.model";
import { IStudyMode } from "./studyMode.model";

export interface IPromotion extends Document {
  school: Schema.Types.ObjectId | ISchool;
  promotedBy: Schema.Types.ObjectId | IUser;
  session: string;
  semester?: Schema.Types.ObjectId;
  date: Date;
  mode: "manual" | "automatic" | "hybrid";
  fromLevel?: Schema.Types.ObjectId | ILevel;
  toLevel?: Schema.Types.ObjectId | ILevel | null;
  graduated: boolean;
  department?: Schema.Types.ObjectId | IDepartment;
  program?: Schema.Types.ObjectId | IProgram;
  studyMode?: Schema.Types.ObjectId | IStudyMode;

  // 🧩 Categories (detailed student lists)
  promotedStudents: Schema.Types.ObjectId[];
  repeatedStudents: Schema.Types.ObjectId[];
  probationStudents: Schema.Types.ObjectId[];
  graduatedStudents: Schema.Types.ObjectId[];
  carryoverStudents: {
    studentId: Schema.Types.ObjectId;
    courses: Schema.Types.ObjectId[];
  }[];
  pendingApproval: Schema.Types.ObjectId[];

  // 🧩 Summary section
  summary: {
    promoted: number;
    repeated: number;
    probation: number;
    graduated: number;
    carryover: number;
  };

  approvals?: {
    approver: Schema.Types.ObjectId | IUser;
    status: "approved" | "rejected" | "pending";
    timestamp: Date;
    comment?: string;
  }[];

  studentCount: number;
  remarks?: string;
}

const PromotionSchema = new Schema<IPromotion>({
  school: { type: Schema.Types.ObjectId, ref: "School", required: true },
  promotedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  session: { type: String, required: true },
  semester: { type: Schema.Types.ObjectId, ref: "Semester", default: null },
  date: { type: Date, default: Date.now },
  mode: {
    type: String,
    enum: ["manual", "automatic", "hybrid"],
    default: "manual",
  },

  fromLevel: { type: Schema.Types.ObjectId, ref: "Level", default: null },
  toLevel: { type: Schema.Types.ObjectId, ref: "Level", default: null },
  graduated: { type: Boolean, default: false },
  department: { type: Schema.Types.ObjectId, ref: "Department", default: null },
  program: { type: Schema.Types.ObjectId, ref: "Program", default: null },
  studyMode: { type: Schema.Types.ObjectId, ref: "StudyMode", default: null },

  // ✅ Categories
  promotedStudents: [{ type: Schema.Types.ObjectId, ref: "Student" }],
  repeatedStudents: [{ type: Schema.Types.ObjectId, ref: "Student" }],
  probationStudents: [{ type: Schema.Types.ObjectId, ref: "Student" }],
  graduatedStudents: [{ type: Schema.Types.ObjectId, ref: "Student" }],
  carryoverStudents: [
    {
      studentId: { type: Schema.Types.ObjectId, ref: "Student" },
      courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    },
  ],
  pendingApproval: [
    {
      studentId: { type: Schema.Types.ObjectId, ref: "Student" },
      gpa: Number,
      totalCourses: Number,
      passedCourses: Number,
      passRate: Number,
    },
  ],

  // ✅ Summary
  summary: {
    promoted: { type: Number, default: 0 },
    repeated: { type: Number, default: 0 },
    probation: { type: Number, default: 0 },
    graduated: { type: Number, default: 0 },
    carryover: { type: Number, default: 0 },
  },

  approvals: [
    {
      approver: { type: Schema.Types.ObjectId, ref: "User" },
      status: {
        type: String,
        enum: ["approved", "rejected", "pending"],
        default: "pending",
      },
      timestamp: { type: Date, default: Date.now },
      comment: { type: String, default: "" },
    },
  ],

  studentCount: { type: Number, default: 0 },
  remarks: { type: String, default: "" },
});

const Promotion =
  models.Promotion || model<IPromotion>("Promotion", PromotionSchema);
export default Promotion;
