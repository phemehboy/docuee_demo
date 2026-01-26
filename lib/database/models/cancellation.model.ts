import { model, models, Schema, Document } from "mongoose";

export interface ICancellation extends Document {
  userId: string;
  email: string;
  fullName: string;
  cancelReason: string;
  subscriptionId?: string;
  subscriptionCode?: string;
  emailToken?: string;
  canceledAt: Date;
}

const CancellationSchema = new Schema<ICancellation>(
  {
    userId: { type: String, required: true },
    email: { type: String, required: true },
    fullName: { type: String, required: true },
    cancelReason: { type: String, required: true },
    subscriptionId: { type: String },
    subscriptionCode: { type: String },
    emailToken: { type: String },
    canceledAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const Cancellation =
  models.Cancellation ||
  model<ICancellation>("Cancellation", CancellationSchema);

export default Cancellation;
