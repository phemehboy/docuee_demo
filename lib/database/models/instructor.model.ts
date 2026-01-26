import { Schema, model, models, Document } from "mongoose";
import "@/lib/database/registerModels";
import { IUser } from "./user.model";
import { ICourse } from "./course.model";
import { IDepartment } from "./department.model";
import { ISchool } from "./school.model";
import { ILevel } from "./level.model";
import { IProgram } from "./program.model";
import { IStudyMode } from "./studyMode.model";
import { IDesignation } from "./designation.model";

export interface IInstructor extends Document {
  _id: string;
  userId: Schema.Types.ObjectId | IUser;
  schoolId: Schema.Types.ObjectId | ISchool;
  department: (Schema.Types.ObjectId | IDepartment)[];
  level: (Schema.Types.ObjectId | ILevel)[];
  program: (Schema.Types.ObjectId | IProgram)[];
  studyMode: (Schema.Types.ObjectId | IStudyMode)[];
  designation: Schema.Types.ObjectId | IDesignation;
  yearsOfExperience: number;
  expertise: string[];
  courses: (Schema.Types.ObjectId | ICourse)[];
  verificationStatus: "pending" | "approved" | "declined" | "not_required";
}

const InstructorSchema = new Schema<IInstructor>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  schoolId: { type: Schema.Types.ObjectId, ref: "School", default: null },
  department: [
    {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },
  ],
  level: [{ type: Schema.Types.ObjectId, ref: "Level" }],
  program: [{ type: Schema.Types.ObjectId, ref: "Program" }],
  studyMode: [{ type: Schema.Types.ObjectId, ref: "StudyMode" }],
  designation: { type: Schema.Types.ObjectId, ref: "Designation" },
  yearsOfExperience: { type: Number },
  expertise: [{ type: String }],
  courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  verificationStatus: {
    type: String,
    enum: ["pending", "approved", "declined", "not_required"],
    default: "pending",
  },
});

const Instructor =
  models.Instructor || model<IInstructor>("Instructor", InstructorSchema);

export default Instructor;
