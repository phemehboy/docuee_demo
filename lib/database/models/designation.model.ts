import "@/lib/database/registerModels";
import { Document, model, models, Schema } from "mongoose";

export interface IDesignation extends Document {
  _id: string;
  name: string;
  school: Schema.Types.ObjectId;
}

const DesignationSchema = new Schema({
  name: { type: String, required: true },
  school: { type: Schema.Types.ObjectId, ref: "School", required: true },
});

DesignationSchema.index({ name: 1, school: 1 }, { unique: true });

const Designation =
  models.Designation || model("Designation", DesignationSchema);

export default Designation;
