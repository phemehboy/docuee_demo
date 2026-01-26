import mongoose, { Schema, models, model } from "mongoose";
import crypto from "crypto";

const CertificateSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    program: { type: Schema.Types.ObjectId, ref: "Program" },
    department: { type: Schema.Types.ObjectId, ref: "Department" },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true },
    issuedBy: { type: Schema.Types.ObjectId, ref: "User" },
    session: { type: String, required: true },
    certificateNumber: { type: String, unique: true, required: true },
    issueDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["issued", "revoked", "pending"],
      default: "issued",
    },
    verificationUrl: String,
    digitalSignature: String,
    verificationHash: String,
    qrCodeImage: String,
  },
  { timestamps: true }
);

CertificateSchema.pre("save", function (next) {
  if (!this.verificationHash) {
    const hash = crypto
      .createHash("sha256")
      .update(`${this.student}-${this.certificateNumber}-${this.issueDate}`)
      .digest("hex");
    this.verificationHash = hash;
  }

  if (!this.verificationUrl) {
    this.verificationUrl = `https://docuee.com/verify/${this.certificateNumber}`;
  }

  next();
});

// ✅ Keep this one
CertificateSchema.index({ student: 1 });

CertificateSchema.virtual("verifyLink").get(function () {
  return `${this.verificationUrl}?hash=${this.verificationHash}`;
});

const Certificate =
  models.Certificate || model("Certificate", CertificateSchema);

export default Certificate;
