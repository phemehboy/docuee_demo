import "@/lib/database/registerModels";
import { Types } from "mongoose";
import { Document, model, models, Schema } from "mongoose";

export interface IDepartment extends Document {
  _id: Types.ObjectId;
  name: string;
  school: Schema.Types.ObjectId; // Added school reference
  description?: string;
  createdAt: Date; // 👈 added
  updatedAt: Date;
}

const DepartmentSchema = new Schema(
  {
    name: { type: String, required: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true }, // new field
    description: { type: String },
  },
  { timestamps: true }, // 👈 this adds createdAt & updatedAt
);

// 🛡️ Ensure unique level name per school
DepartmentSchema.index({ name: 1, school: 1 }, { unique: true });

const Department = models.Department || model("Department", DepartmentSchema);

export default Department;
