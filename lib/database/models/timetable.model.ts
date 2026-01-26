import "@/lib/database/registerModels";
import { Schema, model, models, Types, Document } from "mongoose";

export interface ITimetable extends Document {
  school: Types.ObjectId; // restrict to school
  createdBy: Types.ObjectId; // admin/instructor/supervisor
  title: string; // e.g. "Computer Science Level 400 Timetable"
  entries: {
    course?: Types.ObjectId; // optional link to Course model
    subject?: string; // if no course, allow manual input
    instructor?: Types.ObjectId;
    day: string; // e.g. "Monday"
    startTime: string; // "10:00"
    endTime: string; // "12:00"
    location: string; // "Lab 2"
  }[];
  audience: ("students" | "instructors" | "supervisors" | "all")[];
  level?: Types.ObjectId;
  department?: Types.ObjectId;
  program?: Types.ObjectId;
  studyMode?: Types.ObjectId;
  session?: string;
  semester?: Types.ObjectId;
}

const TimetableSchema = new Schema<ITimetable>(
  {
    school: { type: Schema.Types.ObjectId, ref: "School", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    entries: [
      {
        course: { type: Schema.Types.ObjectId, ref: "Course" },
        subject: { type: String },
        instructor: { type: Schema.Types.ObjectId, ref: "User" },
        day: { type: String, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        location: { type: String, required: true },
      },
    ],
    audience: [
      { type: String, enum: ["students", "instructors", "supervisors", "all"] },
    ],
    level: { type: Schema.Types.ObjectId, ref: "Level" },
    department: { type: Schema.Types.ObjectId, ref: "Department" },
    program: { type: Schema.Types.ObjectId, ref: "Program" },
    studyMode: { type: Schema.Types.ObjectId, ref: "StudyMode" },
    session: { type: String },
    semester: { type: Schema.Types.ObjectId, ref: "Semester" },
  },
  { timestamps: true }
);

const Timetable =
  models.Timetable || model<ITimetable>("Timetable", TimetableSchema);

export default Timetable;
