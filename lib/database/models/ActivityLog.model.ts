import { Schema, model, models, Document } from "mongoose";

export interface IActivityLog extends Document {
  user: Schema.Types.ObjectId;
  entityType: string;
  entityId: Schema.Types.ObjectId;
  action: string;
  payload?: any;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    entityType: { type: String },
    entityId: { type: Schema.Types.ObjectId },
    action: { type: String },
    payload: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const ActivityLog =
  models.ActivityLog || model<IActivityLog>("ActivityLog", ActivityLogSchema);

export default ActivityLog;
