import mongoose from "mongoose";

const FailedPaymentsSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transaction_id: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true },
    currency: { type: String, required: true },
    email: { type: String, required: true },
    transaction_reference: { type: String, required: true },
    failed_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.FailedPayments ||
  mongoose.model("FailedPayments", FailedPaymentsSchema);
