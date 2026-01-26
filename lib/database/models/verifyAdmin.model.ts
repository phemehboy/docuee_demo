import "@/lib/database/registerModels";
import { Schema, model, models, Document } from "mongoose";

import "@/lib/database/registerModels";

export interface IVerifyAdmin extends Document {
  userId: Schema.Types.ObjectId;
  schoolName: string;
  documentUrl: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string;
  createdAt: Date;
}

const VerifyAdminSchema = new Schema<IVerifyAdmin>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  schoolName: { type: String, required: true },
  documentUrl: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  rejectionReason: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

const VerifyAdmin =
  models.VerifyAdmin || model<IVerifyAdmin>("VerifyAdmin", VerifyAdminSchema);

export default VerifyAdmin;
