import { Schema, model, models, Document } from "mongoose";

export interface ITransfer extends Document {
  transferCode: string;
  reference: string;
  amount: number;
  currency: string;
  recipientName: string;
  recipientBank: string;
  recipientAccount: string;
  recipientEmail: string | null;
  status: "pending" | "success" | "failed" | "reversed";
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransferSchema = new Schema<ITransfer>(
  {
    transferCode: { type: String, required: true, unique: true },
    reference: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    recipientName: { type: String, required: true },
    recipientBank: { type: String, required: true },
    recipientAccount: { type: String, required: true },
    recipientEmail: { type: String, default: null },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "reversed"],
      required: true,
    },
    reason: { type: String },
  },
  { timestamps: true }
);

const Transfer =
  models.Transfer || model<ITransfer>("Transfer", TransferSchema);

export default Transfer;
