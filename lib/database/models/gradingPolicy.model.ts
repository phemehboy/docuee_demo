import { Schema, model, models, Document } from "mongoose";

export interface IGradingPolicy extends Document {
  school?: Schema.Types.ObjectId; // Optional — if you support multiple schools/orgs
  assignment: number;
  quiz: number;
  lab: number;
  test: number;
  exam: number;
  project: number;
  updatedBy: Schema.Types.ObjectId;
  updatedAt: Date;
}

const GradingPolicySchema = new Schema<IGradingPolicy>(
  {
    school: { type: Schema.Types.ObjectId, ref: "School" }, // optional
    assignment: { type: Number, default: 2 },
    quiz: { type: Number, default: 1 },
    lab: { type: Number, default: 3 },
    test: { type: Number, default: 4 },
    exam: { type: Number, default: 5 },
    project: { type: Number, default: 8 },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const GradingPolicy =
  models.GradingPolicy ||
  model<IGradingPolicy>("GradingPolicy", GradingPolicySchema);

export default GradingPolicy;
