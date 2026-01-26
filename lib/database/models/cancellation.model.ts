import { model, models, Schema, Document } from "mongoose";

export interface ICancellation extends Document {
  _id: string;
  userId: string;
  email: string;
  fullName: string;
  cancelReason: string;
  subscriptionId: string;
  subscriptionCode: string;
  emailToken: string;
  canceledAt: Date;
}

const CancellationSchema = new Schema<ICancellation>(
  {
    userId: { type: String, required: true },
    email: { type: String, required: true },
    fullName: { type: String, required: true },
    cancelReason: { type: String, required: true },
    subscriptionId: { type: String, required: false },
    subscriptionCode: { type: String, required: false },
    emailToken: { type: String, required: false },

    canceledAt: { type: Date, default: Date.now }, // Auto timestamps
  },
  { timestamps: true }
);

const Cancellation =
  models.Cancellation ||
  model<ICancellation>("Cancellation", CancellationSchema);

export default Cancellation;
