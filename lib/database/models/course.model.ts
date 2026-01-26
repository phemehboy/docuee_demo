import "@/lib/database/registerModels";
import { Document, model, models, Schema } from "mongoose";
import { IUser } from "./user.model";
import { IInstructor } from "./instructor.model";
import { IStudent } from "./student.model";
import { IDepartment } from "./department.model";
import { ILevel } from "./level.model";
import { ISemester } from "./semester.model";
import { IStudyMode } from "./studyMode.model";
import { Types } from "mongoose";

export interface ICourse extends Document {
  _id: Types.ObjectId;
  title: string;
  code: string;
  description: string;
  instructors: (Schema.Types.ObjectId | IInstructor)[];
  students: Schema.Types.ObjectId[] | IStudent[];
  startDate: Date;
  endDate: Date;
  thumbnail: string;
  creatorId: Schema.Types.ObjectId | IUser;
  department: Schema.Types.ObjectId | IDepartment;
  program: Schema.Types.ObjectId; // 👈 link directly to the program
  programType: string;
  level: Schema.Types.ObjectId | ILevel;
  semester: Schema.Types.ObjectId | ISemester;
  session: string; // ✅
  schoolId: Schema.Types.ObjectId;
  studyMode: Schema.Types.ObjectId[] | IStudyMode[];
  studyModeName?: string;
  creditUnits: number;
  courseType: "core" | "elective";
}

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    code: { type: String, required: true },
    description: { type: String, required: true },
    instructors: [{ type: Schema.Types.ObjectId, ref: "Instructor" }],
    students: [{ type: Schema.Types.ObjectId, ref: "Student" }],
    startDate: { type: Date },

    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value: Date) {
          // TypeScript cannot infer `this` here, so cast it
          const doc = this as unknown as ICourse;
          return doc.startDate < value;
        },
        message: "endDate must be after startDate",
      },
    },

    thumbnail: { type: String, required: true },
    creatorId: { type: Schema.Types.ObjectId, ref: "User" },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    program: { type: Schema.Types.ObjectId, ref: "Program", required: true }, // 👈 important
    programType: { type: String, required: true },
    level: { type: Schema.Types.ObjectId, ref: "Level", required: true },
    semester: { type: Schema.Types.ObjectId, ref: "Semester", required: true },
    session: { type: String, required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true },
    studyMode: [
      {
        type: Schema.Types.ObjectId,
        ref: "StudyMode",
        required: true,
      },
    ], // ✅ new
    creditUnits: { type: Number, default: 3 }, // optional
    courseType: { type: String, enum: ["core", "elective"], default: "core" },
  },
  { timestamps: true },
);

const Course = models.Course || model<ICourse>("Course", CourseSchema);

export default Course;
