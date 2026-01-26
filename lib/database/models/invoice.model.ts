import { Schema, Document, model, models } from "mongoose";

export interface IInvoiceTransaction {
  charge_id: string;
  amount: number;
  status: string;
  date: Date;
}

export interface IInvoice extends Document {
  invoice_code: string;
  user_id: string;
  subscription_code: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  transaction_reference: string;
  description: string;
  due_date: Date;
  next_payment_date: Date;
  paid_date?: Date;
  metadata: Record<string, any>;
  transaction_history: IInvoiceTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceTransactionSchema = new Schema<IInvoiceTransaction>(
  {
    charge_id: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoice_code: {
      type: String,
      required: true,
      unique: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    subscription_code: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "pending",
    },
    payment_method: {
      type: String,
      required: true,
    },
    transaction_reference: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    due_date: {
      type: Date,
      required: true,
    },
    next_payment_date: {
      type: Date,
      required: true,
    },
    paid_date: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    transaction_history: {
      type: [InvoiceTransactionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Invoice = models.Invoice || model<IInvoice>("Invoice", InvoiceSchema);

export default Invoice;
