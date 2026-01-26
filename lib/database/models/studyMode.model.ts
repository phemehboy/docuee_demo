import { Types } from "mongoose";
import { Schema, model, models, Document } from "mongoose";

export interface IStudyMode extends Document {
  _id: Types.ObjectId;
  name: string;
  school: Schema.Types.ObjectId;
}

const StudyModeSchema = new Schema<IStudyMode>(
  {
    name: { type: String, required: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true },
  },
  { timestamps: true },
);

StudyModeSchema.index({ name: 1, school: 1 }, { unique: true }); // prevent duplicates per school

const StudyMode =
  models.StudyMode || model<IStudyMode>("StudyMode", StudyModeSchema);
export default StudyMode;
