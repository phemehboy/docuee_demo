import { Schema, model, models, Document, Types } from "mongoose";
import { IUser } from "./user.model";
import { ICourse } from "./course.model";
import { IDepartment } from "./department.model";
import { ISchool } from "./school.model";
import { ILevel } from "./level.model";
import { IProgram } from "./program.model";
import { IStudyMode } from "./studyMode.model";
import { ISemester } from "./semester.model";

export interface IStudent extends Document {
  _id: string;
  userId: Types.ObjectId | IUser;
  supervisor: Types.ObjectId | IUser;
  school: Types.ObjectId | ISchool;
  department?: Types.ObjectId | IDepartment;
  level?: Types.ObjectId | ILevel;
  courses: (Types.ObjectId | ICourse)[];
  program?: Types.ObjectId | IProgram;
  studyMode?: Types.ObjectId | IStudyMode;
  status?: "active" | "graduated" | "repeat" | "probation" | "carryover";
  promotionCount?: number;
  lastPromotedAt?: Date;
  admissionNumber?: string;
  cohortSerial: number;
  semester?: Types.ObjectId | ISemester | null;
  session?: string | null;
  group?: Types.ObjectId;
  approved?: boolean; // optional: for manual promotion UI
}

const StudentSchema = new Schema<IStudent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    supervisor: { type: Schema.Types.ObjectId, ref: "User" },
    school: { type: Schema.Types.ObjectId, ref: "School", default: null },
    department: { type: Schema.Types.ObjectId, ref: "Department" },
    level: { type: Schema.Types.ObjectId, ref: "Level" },
    courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    program: { type: Schema.Types.ObjectId, ref: "Program" },
    studyMode: { type: Schema.Types.ObjectId, ref: "StudyMode" },
    status: {
      type: String,
      enum: ["active", "graduated", "repeat", "probation", "carryover"],
      default: "active",
    },
    promotionCount: { type: Number, default: 0 },
    lastPromotedAt: { type: Date },
    admissionNumber: { type: String, unique: true, sparse: true },
    cohortSerial: { type: Number },
    semester: { type: Schema.Types.ObjectId, ref: "Semester" },
    session: { type: String },
    group: { type: Schema.Types.ObjectId, ref: "Group" },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Student = models.Student || model<IStudent>("Student", StudentSchema);
export default Student;
