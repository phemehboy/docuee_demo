import { Schema, model, models, Document } from "mongoose";

export interface IWithdrawal extends Document {
  user: Schema.Types.ObjectId;

  amount: number;
  currency: string;

  // Snapshot (VERY IMPORTANT)
  payoutAccountSnapshot: {
    bankName: string;
    bankCode?: string;
    accountNumber: string;
    accountName: string;
    country: string;
  };

  // Payment processor (future-ready)
  method?: "paystack" | "flutterwave";
  paystackReference?: string;
  transferCode?: string;

  // Admin & processing
  status:
    | "pending" // user submitted
    | "approved" // admin approved
    | "processing"
    | "pending_otp" // paystack OTP
    | "paid" // successful
    | "failed"
    | "rejected"
    | "reversed";

  approverEmail?: string;
  processedAt?: Date;
  note?: string;

  createdAt: Date;
}

const WithdrawalSchema = new Schema<IWithdrawal>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    amount: { type: Number, required: true },
    currency: { type: String, default: "NGN" },

    payoutAccountSnapshot: {
      bankName: { type: String, required: true },
      bankCode: String,
      accountNumber: { type: String, required: true },
      accountName: { type: String, required: true },
      country: { type: String, required: true },
    },

    method: {
      type: String,
      enum: ["paystack", "flutterwave"],
    },

    paystackReference: String,
    transferCode: String,

    status: {
      type: String,
      enum: [
        "pending", // user submitted
        "approved", // admin approved (optional, could skip)
        "processing", // in progress payment
        "pending_otp", // paystack OTP
        "paid", // successful
        "failed",
        "rejected",
        "reversed",
      ],
      default: "pending",
    },

    approverEmail: String,
    processedAt: Date,
    note: String,
  },
  { timestamps: true }
);

export default models.Withdrawal ||
  model<IWithdrawal>("Withdrawal", WithdrawalSchema);
