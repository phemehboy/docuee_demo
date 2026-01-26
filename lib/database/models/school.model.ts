import "@/lib/database/registerModels";
import { Document, model, models, Schema, Types } from "mongoose";

export interface IPromotionMap {
  fromLevel: Schema.Types.ObjectId;
  toLevel: Schema.Types.ObjectId;
}

export interface IPromotionSettings {
  mode: "automatic" | "manual" | "hybrid";
  passGPA: number;
  passCourseRate: number;
  projectRequired: boolean;
  probationGPA: number;
  autoGraduateOnFinal: boolean;
  maxCarryoverCourses: number;
  promotionMap: IPromotionMap[];
  programOverrides?: {
    program: Schema.Types.ObjectId;
    passGPA?: number;
    passCourseRate?: number;
    probationGPA?: number;
    projectRequired?: boolean;
    maxCarryoverCourses?: number;
    autoGraduateOnFinal?: boolean;
    mode?: "automatic" | "manual" | "hybrid";
  }[];
}

export interface ISchool extends Document {
  _id: Types.ObjectId;
  adminId: Schema.Types.ObjectId;
  name: string;
  location: string;
  type: string;
  motto?: string;
  logo?: string;

  semesterSystem: "standard" | "custom";
  semesters: Schema.Types.ObjectId[];
  currentSemester?: Schema.Types.ObjectId;
  sessions: {
    start: Date;
    end: Date;
    name: string; // "2024/2025"
    isCurrent: boolean;
  }[];
  currentSession?: string;
  createdAt: Date;
  updatedAt: Date;

  promotionHistory: {
    date: Date;
    promotedBy: Schema.Types.ObjectId;
    filters: {
      department?: string;
      program?: string;
      level?: string;
    };
  }[];

  projectStages: string[];

  projectCreditUnit: number;

  promotionSettings: IPromotionSettings;
}

const PromotionHistorySchema = new Schema(
  {
    date: { type: Date, required: true, default: Date.now },
    promotedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    filters: {
      department: { type: String },
      program: { type: String },
      level: { type: String },
    },
  },
  { _id: false },
);

const PromotionMapSchema = new Schema(
  {
    program: { type: Schema.Types.ObjectId, ref: "Program", required: true },
    mappings: [
      {
        fromLevel: {
          type: Schema.Types.ObjectId,
          ref: "Level",
          required: true,
        },
        toLevel: { type: Schema.Types.ObjectId, ref: "Level", required: true },
      },
    ],
  },
  { _id: false },
);

const ProgramOverrideSchema = new Schema(
  {
    program: { type: Schema.Types.ObjectId, ref: "Program", required: true },
    passGPA: { type: Number },
    passCourseRate: { type: Number },
    probationGPA: { type: Number },
    projectRequired: { type: Boolean },
    maxCarryoverCourses: { type: Number },
    autoGraduateOnFinal: { type: Boolean },
    mode: { type: String, enum: ["automatic", "manual", "hybrid"] },
  },
  { _id: false },
);

const PromotionSettingsSchema = new Schema(
  {
    mode: {
      type: String,
      enum: ["automatic", "manual", "hybrid"],
      default: "manual",
    },
    passGPA: { type: Number, default: 2.0 },
    passCourseRate: { type: Number, default: 0.75 },
    projectRequired: { type: Boolean, default: false },
    probationGPA: { type: Number, default: 1.5 },
    maxCarryoverCourses: { type: Number },
    autoGraduateOnFinal: { type: Boolean, default: true },
    promotionMap: [PromotionMapSchema],
    programOverrides: { type: [ProgramOverrideSchema], default: [] },
  },
  { _id: false },
);

const SessionSchema = new Schema({
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  name: { type: String, required: true }, // "2024/2025"
  isCurrent: { type: Boolean, default: false },
});

const SchoolSchema = new Schema<ISchool>(
  {
    name: { type: String, required: true, unique: true },
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    location: { type: String, required: true },
    type: { type: String, required: true },
    motto: { type: String },
    logo: { type: String },

    semesterSystem: {
      type: String,
      enum: ["standard", "custom"],
      default: "standard",
    },

    semesters: [{ type: Schema.Types.ObjectId, ref: "Semester" }],
    currentSemester: { type: Schema.Types.ObjectId, ref: "Semester" },
    sessions: [SessionSchema],
    currentSession: { type: String },

    promotionHistory: [PromotionHistorySchema],

    projectStages: {
      type: [String],
      default: [
        "Proposal",
        "Chapter 1",
        "Chapter 2",
        "Chapter 3",
        "Final Submission",
      ],
    },

    projectCreditUnit: { type: Number, default: 6 },

    promotionSettings: { type: PromotionSettingsSchema, default: {} },
  },
  { timestamps: true },
);

const School = models.School || model<ISchool>("School", SchoolSchema);
export default School;
