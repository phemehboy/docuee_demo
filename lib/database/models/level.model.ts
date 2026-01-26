import "@/lib/database/registerModels";
import { Schema, model, models, Document, Types } from "mongoose";
import { IProgram } from "./program.model";

export interface ILevel extends Document {
  _id: Types.ObjectId;
  name: string;
  rank: number;
  abbreviation?: string;
  canGraduate: boolean;
  program: Types.ObjectId | IProgram; // 🔗 Refers to the Program
  school: Types.ObjectId;
}

const LevelSchema = new Schema<ILevel>(
  {
    name: { type: String, required: true },
    rank: { type: Number, required: true },
    abbreviation: { type: String },
    canGraduate: { type: Boolean, default: false },
    program: {
      type: Schema.Types.ObjectId,
      ref: "Program", // 🔗 Reference
      required: true,
    },
    school: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
  },
  { timestamps: true },
);

// ✅ Index to prevent duplicate levels in same program
LevelSchema.index({ rank: 1, program: 1 }, { unique: true });
LevelSchema.index({ name: 1, program: 1 }, { unique: true });

const Level = models.Level || model<ILevel>("Level", LevelSchema);
export default Level;
