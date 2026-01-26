import { Document, model, models, Schema, Types } from "mongoose";

export interface IStudyLevel extends Document {
  _id: Types.ObjectId;
  name: string;
}

const StudyLevelSchema = new Schema({
  name: { type: String, required: true, unique: true },
});

const StudyLevel = models.StudyLevel || model("StudyLevel", StudyLevelSchema);

export default StudyLevel;
