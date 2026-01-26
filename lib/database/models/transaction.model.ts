import { Schema, model, models } from "mongoose";

const TransactionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    organization: { type: Schema.Types.ObjectId, ref: "Organization" },

    type: {
      type: String,
      enum: ["subscription", "fine", "credit_withdrawal", "topup", "other"],
      required: true,
    },
    provider: {
      type: String,
      enum: ["paystack", "flutterwave", "manual", "other"],
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "NGN" },
    status: {
      type: String,
      enum: ["success", "failed", "pending", "cancelled"],
      default: "pending",
    },

    transactionId: { type: String },
    reference: { type: String },
    description: { type: String },

    metadata: { type: Schema.Types.Mixed }, // store raw gateway payload for debugging
  },
  { timestamps: true }
);

const Transaction =
  models.Transaction || model("Transaction", TransactionSchema);
export default Transaction;
