import "@/lib/database/registerModels";

import { Schema, model, models, Document, Types } from "mongoose";
import { ISchool } from "./school.model";
import { IDepartment } from "./department.model";
import { ILevel } from "./level.model";
import { IProgram } from "./program.model";
import { IStudyMode } from "./studyMode.model";

export type UserType = "instructor" | "supervisor" | "student" | "schoolAdmin";

export interface IUser extends Document {
  _id: Types.ObjectId;
  clerkId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string;
  picture: string;
  gender: "male" | "female" | "other";
  userType: UserType;
  country: string;
  timeZone: string;

  school: Schema.Types.ObjectId | ISchool;
  department: (Schema.Types.ObjectId | IDepartment)[];
  isHOD?: boolean;
  isAssigned?: boolean;
  hodDepartment?: Schema.Types.ObjectId | IDepartment;
  level: (Schema.Types.ObjectId | ILevel)[];
  program: (Schema.Types.ObjectId | IProgram)[];
  studyMode: (Schema.Types.ObjectId | IStudyMode)[];
  supervisor: Schema.Types.ObjectId;
  designation: Schema.Types.ObjectId;
  expertise: string[];
  yearsOfExperience: number;
  adminVerified: boolean;
  subscriptionType: "free" | "premium" | "pro";
  subscriptionStatus: "active" | "pending" | "failed";
  pendingAuthorizationUrl: string;
  subscriptionCoveredByCredit: boolean;
  subscriptionEndDate: Date;
  subscriptionCancelled: boolean;
  gracePeriodEndDate: Date; // when the grace period ends
  inGracePeriod: boolean; // whether the user is currently in grace period
  lastGraceReminderSent: Date;
  graceReason: string;

  paystackCustomerId: string;
  flutterwaveCustomerId: string;
  paymentToken: string;
  paymentProvider: string;
  reference: string;
  nextBillingDate: Date;
  failedBillingAttempts: number;
  course: string;
  joinedAt: Date;
  lastLoginAt: Date;
  referralCode: string;
  referredBy?: Schema.Types.ObjectId;
  referralEarnings: number;
  withdrawableEarnings: number;
  creditBalance: number; // Credits for future subscription payments
  useCreditsAutomatically: boolean;
  rewardPreference: string;
  payoutAccount: {
    provider: "paystack" | "flutterwave";
    bankName: string;
    accountNumber: string;
    accountName: string;
    country: string;
    currency: string;
    verified: boolean;
    verifiedAt: Date;
  };
  previousRank: number;
  referredUsers: Schema.Types.ObjectId[];
  paidReferredUsers: Schema.Types.ObjectId[];
  lastReferralReminderSent: Date;
  lastUpgradeReminderSent: Date;
  paidFines: {
    from: Schema.Types.ObjectId;
    amount: number;
    date: Date;
    projectId: Schema.Types.ObjectId;
    transactionId?: string;
  }[];
  suspendedBySchool: boolean;
  isAdmin: boolean;
  invited: boolean;

  organizationId: Types.ObjectId;
  orgCount: number;
  orgHistory: Schema.Types.ObjectId[];
  orgHistoryWhileFreePlan: Schema.Types.ObjectId[];
  accountMode: "independent" | "institutional";
  hasChosenIndependent: boolean;
}

const UserSchema = new Schema(
  {
    clerkId: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: {
      type: String,
      unique: true, // ensures uniqueness only if a value exists
      sparse: true, // allows multiple users to have null/undefined phone
      trim: true,
    },

    picture: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"] },
    userType: {
      type: String,
      enum: ["instructor", "supervisor", "student", "schoolAdmin"],
    },
    country: { type: String },
    timeZone: { type: String, default: "Africa/Lagos" },
    school: { type: Schema.Types.ObjectId, ref: "School" },
    department: {
      type: [Schema.Types.ObjectId],
      ref: "Department",
      default: [],
    },
    isHOD: {
      type: Boolean,
      default: false,
    },
    hodDepartment: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    isAssigned: {
      type: Boolean,
      default: false,
    },
    level: {
      type: [Schema.Types.ObjectId],
      ref: "Level",
      default: [],
    },
    program: [{ type: Schema.Types.ObjectId, ref: "Program", default: [] }],
    studyMode: [{ type: Schema.Types.ObjectId, ref: "StudyMode", default: [] }],
    supervisor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    designation: { type: Schema.Types.ObjectId, ref: "Designation" },
    expertise: [{ type: String }],
    yearsOfExperience: { type: Number, require: true },
    adminVerified: { type: Boolean, default: false },
    subscriptionType: {
      type: String,
      enum: ["free", "premium", "pro"],
      default: "free",
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "pending", "failed"],
      default: "active",
    },
    accountMode: {
      type: String,
      enum: ["independent", "institutional"],
      default: "independent",
    },
    hasChosenIndependent: { type: Boolean, default: false },
    pendingAuthorizationUrl: { type: String },
    subscriptionCoveredByCredit: { type: Boolean, default: false },
    subscriptionEndDate: { type: Date, default: null },
    subscriptionCancelled: { type: Boolean, default: false },
    gracePeriodEndDate: { type: Date, default: null },
    inGracePeriod: { type: Boolean, default: false },
    lastGraceReminderSent: { type: Date, default: null },
    graceReason: {
      type: String,
      enum: ["payment_failed", "manual_review", "other"],
      default: "payment_failed",
    },

    customerId: { type: String },
    paymentToken: {
      type: String,
    },
    paymentProvider: {
      type: String, // 'paystack' or 'flutterwave'
    },
    reference: { type: String },
    flutterwave: {
      flwRef: { type: String }, // flw_ref
      lastPaymentAt: { type: Date }, // flw_ref
      email: { type: String }, // flw_ref
    },
    nextBillingDate: { type: Date, default: null, index: true },
    failedBillingAttempts: {
      type: Number,
      default: 0,
    },
    course: { type: String },
    joinedAt: { type: Date, default: Date.now },
    lastLoginAt: { type: Date, default: null },
    // Referral System Fields
    referralCode: { type: String, unique: true, required: true },
    referredBy: { type: Schema.Types.ObjectId, ref: "User", default: null }, // The referral code of the person who referred them
    referralEarnings: { type: Number, default: 0 }, // Total earnings from referrals
    withdrawableEarnings: { type: Number, default: 0 }, // Eligible balance for withdrawal
    creditBalance: { type: Number, default: 0 }, // Credits for future subscription payments
    useCreditsAutomatically: { type: Boolean, default: false },
    creditTransactions: [
      {
        type: {
          type: String,
          enum: ["referral", "fine", "bonus", "admin", "withdrawal", "other"],
          required: true,
        },
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        description: { type: String },
      },
    ],
    lastTransactionAt: { type: Date, default: null },
    lastTransactionAmount: { type: Number, default: 0 },
    lastTransactionType: {
      type: String,
      enum: ["subscription", "fine", "topup", "other"],
      default: null,
    },
    lastTransactionProvider: {
      type: String,
      enum: ["paystack", "flutterwave", "manual", "other"],
      default: null,
    },

    rewardPreference: {
      type: String,
      enum: ["cash", "credits"],
      default: "credits",
    },
    payoutAccount: {
      provider: {
        type: String,
        enum: ["paystack", "flutterwave"],
        default: null,
      },
      bankName: { type: String },
      accountNumber: { type: String },
      bankCode: { type: String },
      accountName: { type: String },
      country: { type: String, default: "NG" },
      currency: { type: String, default: "NGN" },
      verified: { type: Boolean, default: false },
      verifiedAt: { type: Date },
    },

    referredUsers: [{ type: Schema.Types.ObjectId, ref: "User" }], // List of referred users
    paidReferredUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    lastReferralReminderSent: { type: Date },
    lastUpgradeReminderSent: { type: Date },

    paidFines: [
      {
        from: { type: Schema.Types.ObjectId, ref: "User" },
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        projectId: { type: Schema.Types.ObjectId, ref: "Project" },
        transactionId: { type: String },
      },
    ],
    suspendedBySchool: {
      type: Boolean,
      default: false,
    },
    previousRank: { type: Number, default: null }, // Add this line
    isAdmin: { type: Boolean, default: false }, // Add this field
    invited: { type: Boolean, default: false },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization" },
    orgCount: { type: Number, default: 0 },
    orgHistory: [{ type: Schema.Types.ObjectId, ref: "Organization" }],
    orgHistoryWhileFreePlan: [
      { type: Schema.Types.ObjectId, ref: "Organization" },
    ],
  },
  { timestamps: true },
);

const User = models.User || model("User", UserSchema);

UserSchema.index({ subscriptionType: 1, nextBillingDate: 1 });
UserSchema.index({ useCreditsAutomatically: 1, nextBillingDate: 1 });

export default User;
