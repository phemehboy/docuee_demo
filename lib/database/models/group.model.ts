import mongoose, { Schema, Document, Types } from "mongoose";
import { IStudent } from "./student.model";

export interface IGroup extends Document {
  name: string;
  supervisor: Types.ObjectId; // link to User (supervisor)
  students: Types.ObjectId[] | IStudent[]; // link to Student model
  organizationId: string; // from supervisor’s org OR unique per group
  createdAt: Date;
}

const GroupSchema = new Schema<IGroup>({
  name: { type: String, required: true },
  supervisor: { type: Schema.Types.ObjectId, ref: "User", required: true },
  students: [{ type: Schema.Types.ObjectId, ref: "Student" }],
  organizationId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Group ||
  mongoose.model<IGroup>("Group", GroupSchema);
