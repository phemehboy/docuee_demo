import { Document, model, models, Schema, Types } from "mongoose";

// Correct type here
export interface MemberEntry {
  user: Types.ObjectId;
  userClerkId: string;
  joinedAt: Date;
}

export interface IOrganization extends Document {
  name: string;
  createdAt: Date;
  slug: string;
  members: MemberEntry[];
  createdBy: Types.ObjectId;
  deletedAt: Date | null;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true },
    slug: { type: String },
    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" }, // optional
        userClerkId: { type: String, required: true },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Organization =
  models.Organization ||
  model<IOrganization>("Organization", OrganizationSchema);

export default Organization;
