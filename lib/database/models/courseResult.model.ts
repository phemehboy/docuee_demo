import { Schema, model, models, Document } from "mongoose";
import { IStudent } from "./student.model";
import { ICourse } from "./course.model";

export interface ICourseResult extends Document {
  assessmentId?: Schema.Types.ObjectId;
  student: Schema.Types.ObjectId | IStudent;
  course?: Schema.Types.ObjectId | ICourse;
  semester: Schema.Types.ObjectId;
  session: string;
  assessmentType: "assignment" | "quiz" | "lab" | "test" | "exam" | "project";
  finalScore: number;
  gradeLetter: string;
  gradePoint: number;
  creditUnit: number;
  passed: boolean;
}

const CourseResultSchema = new Schema<ICourseResult>(
  {
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course" },
    semester: { type: Schema.Types.ObjectId, ref: "Semester", required: true },
    session: { type: String, required: true },
    assessmentType: {
      type: String,
      enum: ["assignment", "quiz", "lab", "test", "exam", "project"],
    },
    finalScore: { type: Number, required: true },
    gradeLetter: { type: String },
    gradePoint: { type: Number },
    creditUnit: { type: Number },
    passed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const CourseResult =
  models.CourseResult ||
  model<ICourseResult>("CourseResult", CourseResultSchema);
export default CourseResult;
