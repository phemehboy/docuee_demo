// models/Expertise.ts
import { Document, model, models, Schema } from "mongoose";

export interface IExpertise extends Document {
  _id: string;
  name: string;
  school: Schema.Types.ObjectId;
}

const ExpertiseSchema = new Schema<IExpertise>({
  name: { type: String, required: true },
  school: { type: Schema.Types.ObjectId, ref: "School", required: true },
});

ExpertiseSchema.index({ name: 1, school: 1 }, { unique: true });

const Expertise =
  models.Expertise || model<IExpertise>("Expertise", ExpertiseSchema);

export default Expertise;
