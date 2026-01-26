import { Schema, model, models, Document } from "mongoose";
import { IUser } from "./user.model";
import { ISchool } from "./school.model";
import { IDepartment } from "./department.model";
import { ILevel } from "./level.model";
import { IProgram } from "./program.model";
import { IStudyMode } from "./studyMode.model";

export interface IChangeLog extends Document {
  userId: Schema.Types.ObjectId | IUser;
  role: "student" | "instructor";
  changeType: "school-transfer" | "internal-update";
  from: {
    school?: Schema.Types.ObjectId | ISchool;
    department?: (Schema.Types.ObjectId | IDepartment)[];
    level?: (Schema.Types.ObjectId | ILevel)[];
  };
  to: {
    school?: Schema.Types.ObjectId | ISchool;
    department?: (Schema.Types.ObjectId | IDepartment)[];
    level?: (Schema.Types.ObjectId | ILevel)[];
    program?: Schema.Types.ObjectId | IProgram;
    studyMode?: Schema.Types.ObjectId | IStudyMode;
  };
  reason?: string;
  approvedBy: Schema.Types.ObjectId | IUser;
  approvedAt: Date;
}

const ChangeLogSchema = new Schema<IChangeLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["student", "instructor"], required: true },
    changeType: {
      type: String,
      enum: ["school-transfer", "internal-update"],
      required: true,
    },
    from: {
      school: { type: Schema.Types.ObjectId, ref: "School" },
      department: [{ type: Schema.Types.ObjectId, ref: "Department" }],
      level: [{ type: Schema.Types.ObjectId, ref: "Level" }],
    },
    to: {
      school: { type: Schema.Types.ObjectId, ref: "School" },
      department: [{ type: Schema.Types.ObjectId, ref: "Department" }],
      level: [{ type: Schema.Types.ObjectId, ref: "Level" }],
      program: { type: Schema.Types.ObjectId, ref: "Program" },
      studyMode: { type: Schema.Types.ObjectId, ref: "StudyMode" },
    },
    reason: { type: String },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    approvedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ChangeLog =
  models.ChangeLog || model<IChangeLog>("ChangeLog", ChangeLogSchema);
export default ChangeLog;
