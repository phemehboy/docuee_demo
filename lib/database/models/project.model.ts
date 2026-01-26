import "@/lib/database/registerModels";
import { Document, model, models, Schema } from "mongoose";
import { IUser } from "./user.model";
import { IStudent } from "./student.model";

export enum Status {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
}

export interface Topic {
  topic: string;
  status: Status;
  rejectionReason?: string;
}

export interface ProjectTopics {
  topicOne: Topic;
  topicTwo: Topic;
  topicThree: Topic;
  topicFour: Topic;
}

export type OverallStatus =
  | "pending"
  | "approved"
  | "in-progress"
  | "completed"
  | "rejected";

export type IndependentStatus =
  | "draft" // project created, no supervisor
  | "invitation_sent" // supervisor invited
  | "invitation_declined" // supervisor declined
  | "pending_topics" // supervisor accepted, waiting for topics
  | "topics_submitted" // student submitted topics
  | "active"; // topic approved, writing unlocked

export type Context = "independent" | "institutional";

export type ProjectType = "journal" | "project";

export interface Fine {
  amount: number;
  isPaid: boolean;
  applied: boolean;
  reason?: string;
  paymentReference?: string;
  paidAt?: Date;
  currency: "NGN" | "USD";
  paymentService: "paystack" | "flutterwave";
}

export interface SubmissionStage {
  content: string;
  submitted: boolean;
  submittedAt?: Date;
  editableByStudent: boolean;
  completed: boolean;
  approvedAt?: Date;
  deadline?: Date;
  fine: Fine;
  grade?: {
    score?: number;
    comment?: string;
    gradedAt?: Date;
  };
  resubmitted?: boolean; // ✅ newly added
  resubmittedCount?: number; // ✅ newly added
  order: number;
}

export interface IProject extends Document {
  supervisorId: Schema.Types.ObjectId | IUser;
  departmentName: string;
  projectTopics: ProjectTopics;
  rejectionReason?: string;
  approvalReason?: string;
  submissionStages: Record<string, SubmissionStage>; // 👈 Dynamic stages
  currentStage?: string;
  approvalDate?: Date;
  overallStatus: OverallStatus;
  independentStatus: IndependentStatus;
  context: Context;
  projectType: ProjectType;
  groupId?: Schema.Types.ObjectId;
  projectCreator: Schema.Types.ObjectId | IStudent;
  organizationId: string;
  schoolId: Schema.Types.ObjectId;
  session: string;
  convexProjectId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FineSchema = new Schema({
  amount: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  applied: { type: Boolean, default: false },
  creditApplied: { type: Boolean, default: false },
  reason: { type: String },
  paymentReference: { type: String },
  paidAt: { type: Date },
  currency: { type: String, enum: ["NGN", "USD"], default: "NGN" },
  paymentService: { type: String, enum: ["paystack", "flutterwave"] },
});

const SubmissionStageSchema = new Schema({
  content: { type: String, default: "" },
  submitted: { type: Boolean, default: false },
  submittedAt: { type: Date },
  editableByStudent: { type: Boolean, default: true },
  completed: { type: Boolean, default: false },
  approvedAt: { type: Date },
  deadline: { type: Date },
  fine: { type: FineSchema, default: {} },
  grade: {
    score: { type: Number },
    comment: { type: String },
    gradedAt: { type: Date },
  },
  resubmitted: { type: Boolean, default: false }, // ✅ added
  resubmittedCount: { type: Number, default: 0 }, // ✅ added
  order: { type: Number, required: true },
});

const ProjectSchema = new Schema<IProject>(
  {
    supervisorId: { type: Schema.Types.ObjectId, ref: "User" },
    departmentName: { type: String, required: false },
    projectTopics: {
      topicOne: {
        topic: String,
        status: { type: String, default: "pending" },
        rejectionReason: { type: String }, // 👈 add this
      },
      topicTwo: {
        topic: String,
        status: { type: String, default: "pending" },
        rejectionReason: { type: String }, // 👈 add this
      },
      topicThree: {
        topic: String,
        status: { type: String, default: "pending" },
        rejectionReason: { type: String }, // 👈 add this
      },
      topicFour: {
        topic: String,
        status: { type: String, default: "pending" },
        rejectionReason: { type: String }, // 👈 add this
      },
    },

    rejectionReason: { type: String },
    approvalReason: { type: String },

    // ✅ dynamic stages map
    submissionStages: {
      type: Map,
      of: SubmissionStageSchema,
      default: {},
    },
    currentStage: { type: String, default: "proposal" },
    approvalDate: { type: Date },
    overallStatus: {
      type: String,
      enum: ["pending", "approved", "in-progress", "completed", "rejected"],
      default: "pending",
    },
    independentStatus: {
      type: String,
      enum: [
        "draft",
        "invitation_sent",
        "invitation_declined",
        "pending_topics",
        "topics_submitted",
        "active",
      ],
      default: "draft",
    },

    context: {
      type: String,
      enum: ["independent", "institutional"],
      default: "independent",
    },
    projectType: {
      type: String,
      enum: ["journal", "project"],
      default: "project",
    },

    projectCreator: { type: Schema.Types.ObjectId, ref: "Student" },
    groupId: { type: Schema.Types.ObjectId, ref: "Group", default: null },
    organizationId: { type: String },
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: false },
    session: { type: String, required: false },
    convexProjectId: { type: String, default: null },
  },
  { timestamps: true },
);

// ✅ Unique topic validation
ProjectSchema.pre("save", async function (this: IProject) {
  const projectTopics = this.projectTopics || {};
  const topics = [
    projectTopics.topicOne?.topic,
    projectTopics.topicTwo?.topic,
    projectTopics.topicThree?.topic,
    projectTopics.topicFour?.topic,
  ].filter(Boolean);

  if (new Set(topics).size !== topics.length) {
    throw new Error("Project topics must be unique.");
  }
});

const Project = models.Project || model<IProject>("Project", ProjectSchema);
export default Project;
