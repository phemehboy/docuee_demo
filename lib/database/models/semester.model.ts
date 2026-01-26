import mongoose, { Schema, Document, Model } from "mongoose";
import { ISchool } from "./school.model";
import { Types } from "mongoose";

export interface ISemester extends Document {
  _id: Types.ObjectId;
  name: string;
  schoolId: Schema.Types.ObjectId | ISchool;
  startDate?: Date;
  endDate?: Date;
  isCustom?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SemesterSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      index: true,
    },
    startDate: { type: Date },
    endDate: { type: Date },
    isCustom: { type: Boolean, default: false },
  },
  { timestamps: true },
);

SemesterSchema.index({ name: 1, schoolId: 1 }, { unique: true });

export const Semester: Model<ISemester> =
  mongoose.models.Semester || mongoose.model("Semester", SemesterSchema);
