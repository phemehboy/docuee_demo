import { Schema, model, models, Document } from "mongoose";

export interface IGradeScale extends Document {
  school: Schema.Types.ObjectId;
  gradeLetter: string;
  minScore: number;
  maxScore: number;
  gradePoint: number;
}

const GradeScaleSchema = new Schema<IGradeScale>({
  school: { type: Schema.Types.ObjectId, ref: "School", required: true },
  gradeLetter: { type: String, required: true },
  minScore: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  gradePoint: { type: Number, required: true },
});

const GradeScale =
  models.GradeScale || model<IGradeScale>("GradeScale", GradeScaleSchema);
export default GradeScale;
