import { Schema, Document, model, models } from "mongoose";

const TransactionSchema = new Schema(
  {
    charge_id: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false } // Avoid creating a unique `_id` for each transaction
);

export interface IPayment extends Document {
  user_id: string;
  subscription_id: string;
  amount: number;
  status: string;
  next_billing_date: Date;
  start_date: Date;
  end_date?: Date;
  payment_method: string;
  authorization_code: string;
  transaction_reference: string;
  authorization: any;
  email: string;
  transaction_history: {
    charge_id: string;
    amount: number;
    status: string;
    date: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    subscription_id: {
      type: String,
      required: true,
      // unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "active",
    },
    next_billing_date: {
      type: Date,
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
    },
    payment_method: {
      type: String,
      required: true,
    },
    authorization_code: {
      type: String,
      required: true,
    },
    transaction_reference: {
      type: String,
      required: true,
    },
    authorization: {
      type: Schema.Types.Mixed,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    transaction_history: [TransactionSchema],
  },
  { timestamps: true }
);

const Payment = models.Payment || model("Payment", PaymentSchema);

export default Payment;
