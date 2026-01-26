import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["student", "instructor", "supervisor"],
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired"],
      default: "pending",
    },
    invitedBy: { type: String }, // Optional: could be admin's Clerk ID
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Invitation ||
  mongoose.model("Invitation", invitationSchema);
