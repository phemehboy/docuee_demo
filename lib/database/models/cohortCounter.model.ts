import { Schema, model, models, Document } from "mongoose";

export interface ICohortCounter extends Document {
  school: Schema.Types.ObjectId;
  department: Schema.Types.ObjectId;
  level: Schema.Types.ObjectId;
  program?: Schema.Types.ObjectId;
  studyMode?: Schema.Types.ObjectId;
  seq: number; // last assigned serial
}

const CohortCounterSchema = new Schema<ICohortCounter>(
  {
    school: { type: Schema.Types.ObjectId, ref: "School", required: true },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    level: { type: Schema.Types.ObjectId, ref: "Level", required: true },
    program: { type: Schema.Types.ObjectId, ref: "Program" }, // optional
    studyMode: { type: Schema.Types.ObjectId, ref: "StudyMode" }, // optional
    seq: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Ensure one counter per unique combination
CohortCounterSchema.index(
  { school: 1, department: 1, level: 1, program: 1, studyMode: 1 },
  { unique: true }
);

const CohortCounter =
  models.CohortCounter ||
  model<ICohortCounter>("CohortCounter", CohortCounterSchema);

export default CohortCounter;
