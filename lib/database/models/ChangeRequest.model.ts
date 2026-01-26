import mongoose, { Schema, models } from "mongoose";

const ChangeRequestSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    role: {
      type: String,
      enum: ["student", "supervisor", "instructor"],
      required: true,
    },

    // School
    currentSchoolId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "School",
    },
    newSchoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
    },

    // Department
    currentDepartment: [
      {
        type: Schema.Types.ObjectId,
        ref: "Department",
      },
    ],
    newDepartment: [
      {
        type: Schema.Types.ObjectId,
        ref: "Department",
      },
    ],

    // Level
    currentLevel: [
      {
        type: Schema.Types.ObjectId,
        ref: "Level",
      },
    ],
    newLevel: [
      {
        type: Schema.Types.ObjectId,
        ref: "Level",
      },
    ],

    // ✅ Program
    currentProgram: {
      type: Schema.Types.ObjectId,
      ref: "Program",
    },
    newProgram: {
      type: Schema.Types.ObjectId,
      ref: "Program",
    },

    // ✅ Study Mode
    currentStudyMode: {
      type: Schema.Types.ObjectId,
      ref: "StudyMode",
    },
    newStudyMode: {
      type: Schema.Types.ObjectId,
      ref: "StudyMode",
    },

    // Other fields
    reason: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "rejected",
        "approvedByCurrentAdmin",
        "approvedByTargetAdmin",
        "completed",
      ],
      default: "pending",
    },

    schoolAdminApproval: {
      type: Boolean,
      default: false,
    },
    destinationSchoolAdminApproval: {
      type: Boolean,
      default: false,
    },

    requiresTargetApproval: {
      type: Boolean,
      default: true,
    },

    approvedByCurrent: {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      name: String,
      email: String,
      date: Date,
    },
    approvedByTarget: {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      name: String,
      email: String,
      date: Date,
    },

    rejectedBy: {
      type: String,
      enum: ["currentSchoolAdmin", "destinationSchoolAdmin", null],
      default: null,
    },

    rejectionReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default models.ChangeRequest ||
  mongoose.model("ChangeRequest", ChangeRequestSchema);
