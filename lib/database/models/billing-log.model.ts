import { Schema, model, models } from "mongoose";

const BillingLogSchema = new Schema({
  successCount: Number,
  failedCount: Number,
  downgradeCount: Number,
  chargedUsers: Number,
  failedCharges: Number,
  downgradedUsers: Number,
  creditUsers: Number,
  totalProcessed: Number,
  rawSummary: Object,
  createdAt: { type: Date, default: Date.now },
});

export default models.BillingLog || model("BillingLog", BillingLogSchema);
