import mongoose, { Schema, models } from "mongoose";

const ArchivedUserRecordSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["student", "supervisor", "instructor"],
      required: true,
    },

    fromSchool: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    toSchool: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    fromDepartment: [
      {
        type: Schema.Types.ObjectId,
        ref: "Department",
        required: true,
      },
    ],
    toDepartment: [
      {
        type: Schema.Types.ObjectId,
        ref: "Department",
        required: true,
      },
    ],
    fromLevel: [
      {
        type: Schema.Types.ObjectId,
        ref: "Level",
      },
    ],
    toLevel: [
      {
        type: Schema.Types.ObjectId,
        ref: "Level",
      },
    ],

    reason: { type: String, required: true },
    archivedAt: { type: Date, default: Date.now },

    documents: [
      {
        type: { type: String }, // "project", "assignment", "comment", etc.
        refId: { type: String }, // Reference to actual document
        summary: { type: String }, // Optional: title or summary
        courseId: { type: String }, // Optional: title or summary
      },
    ],
  },
  { timestamps: true }
);

export default models.ArchivedUserRecord ||
  mongoose.model("ArchivedUserRecord", ArchivedUserRecordSchema);
