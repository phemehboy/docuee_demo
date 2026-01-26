import Transaction from "../database/models/transaction.model";
import User from "../database/models/user.model";

export async function recordTransaction({
  userId,
  organizationId,
  type,
  provider,
  amount,
  currency = "NGN",
  status = "pending",
  transactionId,
  reference,
  description,
  metadata = {},
}: {
  userId: string;
  organizationId?: string;
  type: "subscription" | "fine" | "credit_withdrawal" | "topup" | "other";
  provider: "paystack" | "flutterwave" | "manual" | "other";
  amount: number;
  currency?: string;
  status?: "success" | "failed" | "pending" | "cancelled";
  transactionId?: string;
  reference?: string;
  description?: string;
  metadata?: any;
}) {
  // 1️⃣ Save transaction in central Transaction collection
  const transaction = await Transaction.create({
    user: userId,
    organization: organizationId,
    type,
    provider,
    amount,
    currency,
    status,
    transactionId,
    reference,
    description,
    metadata,
  });

  // 2️⃣ Update lightweight billing summary on User (NOT full history)
  if (status === "success") {
    await User.findByIdAndUpdate(userId, {
      $set: {
        lastTransactionAt: new Date(),
        lastTransactionAmount: amount,
        lastTransactionType: type,
        lastTransactionProvider: provider,
      },
      $inc: { totalSpent: amount }, // optional: running tally
    });
  }

  return transaction;
}
