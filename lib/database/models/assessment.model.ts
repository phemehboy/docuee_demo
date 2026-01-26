import { Schema, model, models, Document } from "mongoose";
import { IStudent } from "./student.model";
import { ICourse } from "./course.model";

export interface IAssessment extends Document {
  // student: Schema.Types.ObjectId | IStudent;
  students: (Schema.Types.ObjectId | IStudent)[];
  course: Schema.Types.ObjectId | ICourse;
  type: "assignment" | "quiz" | "test" | "exam" | "project";
  score: number;
  weight: number; // e.g. 10 for 10% of the total
  total: number;
  session: string;
  semester: Schema.Types.ObjectId;
  submittedAt?: Date;
  gradedBy?: Schema.Types.ObjectId;
}

const AssessmentSchema = new Schema<IAssessment>(
  {
    // student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    students: [{ type: Schema.Types.ObjectId, ref: "Student", required: true }],

    course: { type: Schema.Types.ObjectId, ref: "Course" },
    type: {
      type: String,
      enum: ["assignment", "quiz", "test", "exam", "project"],
      required: true,
    },
    score: { type: Number, required: true },
    weight: { type: Number, default: 0 },
    total: { type: Number, default: 100 },
    session: { type: String, required: true },
    semester: { type: Schema.Types.ObjectId, ref: "Semester", required: true },
    submittedAt: { type: Date },
    gradedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

AssessmentSchema.index(
  { students: 1, course: 1, semester: 1, session: 1, type: 1 },
  { unique: true }
);

const Assessment =
  models.Assessment || model<IAssessment>("Assessment", AssessmentSchema);
export default Assessment;
