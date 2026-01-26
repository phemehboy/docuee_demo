import mongoose from "mongoose";

export interface IFeedback extends Document {
  userId: mongoose.Schema.Types.ObjectId; // ref to User
  section: string;
  helpful: "yes" | "no";
  reason: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    section: {
      type: String,
      required: true,
    },
    helpful: {
      type: String,
      enum: ["yes", "no"],
      required: true,
    },
    reason: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Feedback ||
  mongoose.model("Feedback", FeedbackSchema);
