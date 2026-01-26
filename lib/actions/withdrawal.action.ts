"use server";

import { connectToDatabase } from "../database";
import ProjectNotification from "../database/models/notification.model";
import Withdrawal from "../database/models/withdrawal.model";
import { sendDocueeEmail } from "../email/sendDocueeEmail";
import User from "../database/models/user.model";
import { recordTransaction } from "../services/transactionService";
import Transaction from "../database/models/transaction.model";

const FINAL_STATUSES = ["approved", "failed", "reversed"];

export async function processWithdrawal(
  data: any,
  eventType: "transfer.success" | "transfer.failed" | "transfer.reversed",
) {
  await connectToDatabase();

  try {
    const transferCode = data.transfer_code;

    if (!transferCode) {
      console.error("❌ Missing transfer_code in webhook data", data);
      return;
    }

    console.log(
      `[WEBHOOK] Processing ${eventType} for transfer_code=${transferCode}`,
    );

    // 🔍 Fetch withdrawal
    const withdrawal = await Withdrawal.findOne({ transferCode });

    if (!withdrawal) {
      console.error(
        `❌ Withdrawal not found for transfer_code=${transferCode}`,
      );
      return;
    }

    // 🔁 Idempotency check (VERY IMPORTANT)
    if (FINAL_STATUSES.includes(withdrawal.status)) {
      console.log(
        `🔁 Withdrawal already finalized (${withdrawal.status}). Skipping.`,
        { withdrawalId: withdrawal._id.toString() },
      );
      return;
    }

    // 🧭 Map Paystack event → internal status
    const statusMap: Record<string, string> = {
      "transfer.success": "approved",
      "transfer.failed": "failed",
      "transfer.reversed": "reversed",
    };

    const newStatus = statusMap[eventType];
    if (!newStatus) {
      console.warn("⚠️ Unsupported transfer event:", eventType);
      return;
    }

    // 💾 Update withdrawal (FINAL UPDATE)
    withdrawal.status = newStatus;
    withdrawal.paystackReference =
      data.reference || withdrawal.paystackReference;
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    console.log("✅ Withdrawal finalized:", {
      id: withdrawal._id.toString(),
      status: newStatus,
    });

    // 👤 Fetch user
    const user = await User.findById(withdrawal.user);
    if (!user) {
      console.error(
        "❌ User not found for withdrawal:",
        withdrawal._id.toString(),
      );
      return;
    }

    // 🔔 Notifications (ONLY ON FINAL STATES)
    if (newStatus === "approved") {
      // 📧 Email user
      await sendDocueeEmail({
        to: user.email,
        subject: "Withdrawal Successful ✅",
        title: `Hello ${user.firstName},`,
        body: `
          <p>Your withdrawal of <strong>${withdrawal.amount} ${withdrawal.currency}</strong>
          has been <strong>successfully paid</strong>.</p>
          <p>Payment method: <strong>${withdrawal.method.toUpperCase()}</strong></p>
        `,
        theme: "blue",
      });

      // 🔔 In-app notification
      await ProjectNotification.create({
        title: "Withdrawal Successful",
        message: `Your withdrawal of ${withdrawal.amount} ${withdrawal.currency} was paid successfully.`,
        type: "withdrawal_paid",
        userId: user._id,
        actionLink: `/user/${user._id}/usertype/${user.userType}/dashboard/referrals`,
        status: "unread",
      });

      const existingTx = await Transaction.findOne({
        reference: withdrawal.transferCode,
        type: "withdrawal",
      });

      if (!existingTx) {
        await recordTransaction({
          userId: user._id.toString(),
          type: "credit_withdrawal",
          provider: "manual",
          amount: withdrawal.amount,
          currency: "CREDIT",
          status: "success",
          reference: withdrawal.transferCode,
          description: "Credits converted to cash",
          metadata: {
            payoutProvider: withdrawal.method, // paystack | flutterwave
            payoutCurrency: withdrawal.currency,
          },
        });
      }
    }

    if (newStatus === "failed" || newStatus === "reversed") {
      // 💸 Refund user balance (SAFE)
      user.withdrawableEarnings += withdrawal.amount;
      await user.save();

      // 📧 Notify user
      await sendDocueeEmail({
        to: user.email,
        subject: "Withdrawal Failed ❌",
        title: `Hello ${user.firstName},`,
        body: `
          <p>Your withdrawal of <strong>${withdrawal.amount} ${withdrawal.currency}</strong>
          could not be completed.</p>
          <p>The amount has been returned to your wallet.</p>
        `,
        theme: "red",
      });

      // 🔔 In-app notification
      await ProjectNotification.create({
        title: "Withdrawal Failed",
        message: `Your withdrawal of ${withdrawal.amount} ${withdrawal.currency} failed and was refunded.`,
        type: "withdrawal_rejected",
        userId: user._id,
        actionLink: `/user/${user._id}/usertype/${user.userType}/dashboard/referrals`,
        status: "unread",
      });

      const existingTx = await Transaction.findOne({
        reference: withdrawal.transferCode,
        type: "withdrawal",
      });

      if (!existingTx) {
        await recordTransaction({
          userId: user._id.toString(),
          type: "credit_withdrawal",
          provider: "manual",
          amount: withdrawal.amount,
          currency: withdrawal.currency,
          status: "failed",
          reference: withdrawal.transferCode,
          description: "Withdrawal failed or reversed",
          metadata: {
            payoutProvider: withdrawal.method, // paystack | flutterwave
            payoutCurrency: withdrawal.currency,
          },
        });
      }
    }
  } catch (error) {
    console.error("❌ Error processing withdrawal webhook:", error);
  }
}

export async function processFlutterwaveWithdrawal(data: any) {
  await connectToDatabase();
  try {
    // Find and update the withdrawal request
    const withdrawal = await Withdrawal.findOneAndUpdate(
      { transferCode: data.reference },
      {
        status: data.status === "SUCCESSFUL" ? "approved" : "failed",
        flutterwaveReference: data.reference,
      },
      { new: true },
    );

    if (!withdrawal) {
      console.error(`❌ No withdrawal found for reference: ${data.reference}`);
      return;
    }

    console.log("✅ Updated Withdrawal:", withdrawal);

    // Extract the recipient (user withdrawing) and approver email
    const recipientEmail = withdrawal.email; // The person receiving the funds
    const approverEmail = withdrawal.approverEmail; // The person who approved the transfer

    if (!approverEmail) {
      console.warn(
        "⚠️ Approver email is missing for withdrawal:",
        withdrawal._id,
      );
    }

    let emailPayload: Parameters<typeof sendDocueeEmail>[0] | null = null;

    if (data.status === "SUCCESSFUL") {
      emailPayload = {
        to: recipientEmail,
        subject: "Transfer Successful",
        title: "Withdrawal Successful 🎉",
        body: `
      Dear ${withdrawal.accountName},<br/><br/>
      Your withdrawal of <strong>$${withdrawal.amount}</strong> to
      <strong>${withdrawal.bankName}</strong><br/>
      (Account Number: ${withdrawal.accountNumber}) was completed successfully.
    `,
        theme: "green",
        note: "If you did not initiate this transaction, please contact support immediately.",
      };
    } else {
      emailPayload = {
        to: approverEmail,
        subject: "Transfer Failed",
        title: "Withdrawal Failed ⚠️",
        body: `
      Dear Approver,<br/><br/>
      The transfer of <strong>$${withdrawal.amount}</strong> to
      <strong>${withdrawal.bankName}</strong><br/>
      (Account Number: ${withdrawal.accountNumber}) has failed.<br/><br/>
      <strong>Reason:</strong> ${data.complete_message || "No reason provided"}.
    `,
        theme: "red",
        note: "Please review and take the necessary action.",
      };
    }

    // Send email only if payload exists
    if (emailPayload) {
      console.log(`📧 Sending email to: ${emailPayload.to}`);
      await sendDocueeEmail(emailPayload);
    }
  } catch (error) {
    console.error(`❌ Error processing withdrawal:`, error);
  }
}
