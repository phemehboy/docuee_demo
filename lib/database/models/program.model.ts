import "@/lib/database/registerModels";

import { Document, model, models, Schema, Types } from "mongoose";

export interface IProgram extends Document {
  _id: string;
  type: string; // ✅ Changed from ObjectId to string
  department: { _id: string; name: string } | Types.ObjectId;
  school: Schema.Types.ObjectId;
}

const ProgramSchema = new Schema<IProgram>({
  type: { type: String, required: true }, // ✅ Plain string
  department: {
    type: Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  school: { type: Schema.Types.ObjectId, ref: "School", required: true },
});

// ✅ Prevent duplicates by type + department + school
ProgramSchema.index({ type: 1, department: 1, school: 1 }, { unique: true });

const Program = models.Program || model<IProgram>("Program", ProgramSchema);
export default Program;
